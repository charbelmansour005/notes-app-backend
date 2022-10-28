const Note = require("../model/note");
const User = require("../model/user");
const Category = require("../model/category");

/**
 * User can filter his Notes by a specific category he enters in the URL
 * The whole category name will be read and not only parts of it, so the
 * category name being filtered must exist as a whole
 */
exports.filterbyCategory = (req, res) => {
  const id = req.userId;
  Note.find({
    $and: [{ creator: id }, { categoryName: req.params.key }],
  }).then((data) => {
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
      res.json({ usernotes: notes });
    })
    .catch((err) => {
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
  }).then((data) => {
    if (data.length === 0) {
      res.status(404).json({
        Error: `No notes with the '${req.params.key}' tag were found.`,
      });
    } else {
      res.status(200).json({
        Success: `${data.length} notes with the '${req.params.key}' tag were found.`,
        data,
      });
    }
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
      res.json({ usernotes: notes });
    })
    .catch((err) => {
      console.log(err);
    });
};

/**
 * Creating a note for the signed in user
 * User must fill out the 'categoryName' and the 'content' fields, whereas tags are optional.
 * Upon creating a note with a previously existing category, a new category will NOT be created,
 * only the note will be created and added to the signed in user under his 'notes' array,
 * as well as to the Notes collection, where it will also include the creator's ObjectId
 *
 * Else, when creating a note with a * new * category, the latter will be created as well,
 * and both the note and the new category will be added to the User doc respectively under his 'notes'
 * and 'categories' arrays, as well as to their own collections - with the user's ObjectId
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
  Category.find({
    name: categoryName,
    creator: creator,
  })
    .then((categories) => {
      if (!categories.length) {
        const newCatergory = new Category({
          name: categoryName,
          creator: creator,
        });
        newCatergory
          .save()
          .then(() => {
            return User.findById(req.userId);
          })
          .then((user) => {
            creator = user;
            user.categories.push(newCatergory._id);
            return user.save();
          })
          .then(() => {
            const note = new Note({
              content: content,
              creator: creator,
              tags: tags,
              categoryName: req.body.categoryName,
            });
            note
              .save()
              .then(() => {
                return User.findById(req.userId);
              })
              .then((user) => {
                creator = user;
                user.notes.push(note._id);
                return user.save();
              });
            res.status(201).json({
              Success: "Note created and saved into a new category",
            });
          }) //new
          .catch((err) => {
            console.log(err);
            res.status(404).json({
              Error: "Make sure you have filled out all the requried fields",
            });
          });
        return console.log("done, note saved with new category");
      } else {
        //exists -> create note with inputted category from above
        console.log(categories[0].name);
        note
          .save()
          .then(() => {
            return User.findById(req.userId);
          })
          .then((user) => {
            creator = user;
            user.notes.push(note._id);
            return user.save();
          });
        console.log("note created with exsiting category");
        res.status(201).json({
          Success: "Note Created and added to existing category.",
        });
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(404).json({
        Error: "There was an error processing your request.",
      });
    });
};

/**
 * Must be authenticated with JWT Token to Update a note
 * ( Signed in user may only update his own note(s) )
 */
exports.putOneNote = (req, res) => {
  const _id = req.params.id;
  const content = req.body.content;
  const updated_At = new Date();
  Note.findById(_id)
    .then((note) => {
      if (!note) {
        return res.status(404).json({
          Error: "could not find note to update",
        });
      }
      if (note.creator.toString() !== req.userId) {
        return res.status(401).json({ Error: "Not authorized to update note" });
      }
      note.content = content;
      note.updated_At = updated_At;
      return note.save();
    })
    .then((result) => {
      res.status(200).json({
        Success: "Updated note successfully.",
        note: result,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(404).json({
        Error: "There was a problem updating your note.",
      });
    });
};

/**
 * Signed in user may only delete one of his notes
 * The note gets deleted from the user's collection from under his 'notes' Array
 * as well as from the notes collection
 * @param - ObjectId of the note to be deleted
 */
exports.deleteOneNote = (req, res) => {
  let creator = req.userId;
  const _id = req.params.id;
  Note.findById(_id)
    .then((note) => {
      if (!note) {
        res.status(404).json({
          Error: "could not find note to delete",
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
        info: "post was deleted.",
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

// - - - - - - - - - - - - - - - - - - Superuser actions - - - - - - - - - - - - - - - - - -

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
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};
// Get all notes
exports.getNotes = (req, res, next) => {
  Note.find().then((note) => {
    res.json(note);
  });
};
// Get all Notes by specific Sort
exports.getAllNotesBySort = (req, res, next) => {
  const sort = req.params.sort;
  Note.find()
    .sort({ updated_At: sort })
    .then((note) => {
      res.json({ info: "Found all notes", note: note });
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};
