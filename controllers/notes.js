const Note = require("../models/note");
const User = require("../models/user");
const Category = require("../models/category");

/**
 * User can filter his Notes by a specific category he enters in the URL
 */
exports.filterbyCategory = (req, res) => {
  const id = req.userId;
  Note.find({
    $and: [{ creator: id }, { categoryName: req.params.key }],
  })
    .then((data) => {
      if (data.length === 0) {
        res.status(404).json({
          Error: `No note(s) in the '${req.params.key}' category were found.`,
        });
      } else {
        res.status(200).json({
          Success: `${data.length} note(s) in the '${req.params.key}' category were found.`,
          data,
        });
      }
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      console.log(err);
    });
};

/**
 *
 * Displays the notes of the signed in user
 */
exports.getNotesOfUser = (req, res) => {
  const id = req.userId;
  Note.find({ creator: id })
    .then((notes) => {
      if (!notes.length) {
        return res
          .status(404)
          .json({ Error: "You don't have any notes yet, create some!" });
      } else {
        res.status(200).json({ usernotes: notes });
      }
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      console.log(err);
    });
};

/**
 * Triggers a search that finds posts by their tags
 */
exports.searchUserTags = (req, res) => {
  const id = req.userId;
  Note.find({
    $and: [{ creator: id }, { $or: [{ tags: { $regex: req.params.key } }] }],
  })
    .then((data) => {
      if (data.length === 0) {
        res.status(404).json({
          Error: `No notes with the '${req.params.key}' tag were found.`,
        });
      } else {
        res.status(200).json({
          Success: `${data.length} note(s) with the '${req.params.key}' tag were found.`,
          data,
        });
      }
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      console.log(err);
    });
};

/**
 * fetches the notes with whatever sort the user chooses
 * @param -> sorts: "1","-1","ascending","descending"
 */
exports.getUserNotesLatest = (req, res) => {
  const id = req.userId;
  const sort = req.params.sort;
  Note.find({ creator: id })
    .sort({ updated_At: sort })
    .then((notes) => {
      if (!notes.length) {
        res.status(404).json({ Error: "No notes were found, write a note!" });
      } else {
        return res.status(200).json({ usernotes: notes });
      }
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      console.log(err);
    });
};

/**
 * Creating a note for the signed in user
 * @param - userId auto inserted just by being signed in
 */
exports.postAddNote = (req, res) => {
  const content = req.body.content;
  const tags = req.body.tags;
  const categoryName = req.body.categoryName;
  let creator = req.userId;
  const note = new Note({
    content: content,
    creator: creator,
    tags: tags,
    categoryName: categoryName,
  });
  //look for inserted Category
  Category.find({
    name: categoryName,
    creator: creator,
  }) //if not found
    .then((categories) => {
      if (!categories.length) {
        const newCatergory = new Category({
          //create category with it's name
          name: categoryName,
          creator: creator,
        });
        newCatergory
          .save()
          .then(() => {
            return User.findById(req.userId);
          })
          .then((user) => {
            //push new category to the user's categories
            creator = user;
            user.categories.push(newCatergory._id);
            return user.save();
          })
          .then(() => {
            const note = new Note({
              //then create the note
              content: content,
              creator: creator,
              tags: tags,
              categoryName: req.body.categoryName, //with the newly created category
            });
            note
              .save()
              .then(() => {
                return User.findById(req.userId);
              })
              .then((user) => {
                //and push the note into the user's notes
                creator = user;
                user.notes.push(note._id);
                return user.save();
              });
            res.status(201).json({
              Success: `New Note and new '${req.body.categoryName}' Category was created for the note as well.`,
            });
          })
          .catch((err) => {
            console.log(err);
            res.status(404).json({
              Error: "Make sure you have filled out all the required fields",
            });
          });
        return console.log("done, note saved with new category");
      } else {
        note //if the category already exists for the user
          .save() //create the note
          .then(() => {
            return User.findById(req.userId);
          })
          .then((user) => {
            creator = user; //and make the relation
            user.notes.push(note._id);
            return user.save();
          });
        console.log(
          `Note created and added to exsiting '${req.body.categoryName}' category`
        );
        res.status(201).json({
          Success: `Note created and added to exsiting '${req.body.categoryName}' category`,
        });
      }
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      console.log(err);
    });
};

/**
 * Must be authenticated with JWT Token to Update a note
 * ( Signed in user may only update his own note(s) )
 */
exports.putOneNote = (req, res) => {
  const _id = req.params.id;
  const content = req.body.content;
  const tags = req.body.tags;
  const updated_At = new Date();
  Note.findById(_id)
    .then((note) => {
      if (!note) {
        return res.status(404).json({
          Error: "Could not update, note was not found.",
        });
      }
      if (note.creator.toString() !== req.userId) {
        return res.status(401).json({ Error: "Not authorized to update note" });
      }
      note.content = content;
      note.tags = tags;
      note.updated_At = updated_At;
      if (!content) {
        res.status(404).json({ Error: "Do not leave the content field empty" });
      } else {
        return note.save();
      }
    })
    .then((result) => {
      res.status(200).json({
        Success: "Updated note successfully.",
        note: result,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      console.log(err);
    });
};

/**
 * Signed in user may only delete one of his notes
 * @param - ObjectId of the note to be deleted
 */
exports.deleteOneNote = (req, res) => {
  let creator = req.userId;
  const _id = req.params.id;
  Note.findById(_id)
    .then((note) => {
      if (!note) {
        res.status(404).json({
          Error: "Could not delete, note was not found",
        });
      }
      if (note.creator.toString() !== req.userId) {
        return res
          .status(401)
          .json({ Error: "Not authorized to delete this note" });
      }
      return Note.findByIdAndRemove(_id);
    })
    .then(() => {
      return User.findById(req.userId);
    })
    .then((user) => {
      creator = user;
      console.log(user.notes);
      user.notes.pull(_id);
      return user.save();
    })
    .then((result) => {
      console.log(result);
      res.status(200).json({
        Success: "Note was deleted.",
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      console.log(err);
    });
};

// - - - - - - - - - - - - - - - - - - Extra controllers - - - - - - - - - - - - - - - - - -

// Get a single note of any user by it's ObjectId
exports.getOneNote = (req, res, next) => {
  const _id = req.params.id;
  Note.findById(_id)
    .then((note) => {
      if (!note) {
        const error = new Error("Could not find note");
        error.statusCode = 204;
        throw error;
      }
      res.status(200).json({ info: "Found note", note: note });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      console.log(err);
    });
};
// Get all notes
exports.getNotes = (req, res, next) => {
  Note.find()
    .then((note) => {
      if (!note.length) {
        return res
          .status(404)
          .json({ Error: "No notes were found in the database." });
      }
      res.status(200).json(note);
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      console.log(err);
    });
};
// Get all Notes by specific Sort
exports.getAllNotesBySort = (req, res, next) => {
  const sort = req.params.sort;
  Note.find()
    .sort({ updated_At: sort })
    .then((note) => {
      if (!note.length) {
        return res
          .status(404)
          .json({ Error: "No notes were found in the database." });
      } else {
        res.status(200).json({ info: "Found all notes", note: note });
      }
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }
      console.log(err);
    });
};
