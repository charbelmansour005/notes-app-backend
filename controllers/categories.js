const Category = require("../model/category");
const User = require("../model/user");
const { validationResult } = require("express-validator");
/**
 * fetches the categories created by the signed in user
 * @param -> req.userId from is.auth.js middleware
 * @route "/categ"
 */
exports.getCategsOfUser = (req, res) => {
  const id = req.userId;
  Category.find({ creator: id })
    .then((categories) => {
      if (!categories.length) {
        res
          .status(404)
          .json({ Error: "You do not have any categories, try adding some!" });
      } else {
        res.status(200).json({ UserCategories: categories });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

/**
 * Signed in user may only delete one of his own categories
 * the deleted category also gets deleted from the Category collection
 * and gets pulled out from the user's categories field in the User collection
 * @param -> ObjectId of the target Category to be deleted
 * @route "/category/:id"
 */
exports.deleteUserCategory = (req, res) => {
  let creator = req.userId;
  const _id = req.params.id;
  Category.findById(_id)
    .then((category) => {
      if (!category) {
        res.status(404).json({
          Error: "Could not find category to delete",
        });
      }
      if (category.creator.toString() !== req.userId) {
        return res.status(401).json({
          Error: "Not Authorized to delete category",
        });
      }
      return Category.findByIdAndRemove(_id);
    })
    .then(() => {
      return User.findById(req.userId);
    })
    .then((user) => {
      creator = user;
      console.log(user.notes);
      user.categories.pull(_id);
      return user.save();
    })
    .then((result) => {
      console.log(result);
      res.status(200).json({
        Success: "Category was deleted",
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

/**
 * When a signed in user creates a category, it automatically takes his ID.
 * @param -> req.userId from is.auth.js middleware
 * @route "/categories"
 */
exports.postAddCategory = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message:
        "Validation FAILED, enter at least 2 letters in the category name",
      error: errors.array(),
    });
  }
  const Id = req.userId;
  const category = new Category({
    name: req.body.name,
    creator: Id,
  });
  Category.find({
    name: req.body.name,
    creator: Id,
  }).then((categories) => {
    if (!categories.length) {
      category
        .save()
        .then((category) => {
          res.status(201).json({
            category,
            info: {
              dateCreated: new Date().toISOString(),
              status: "Category Created Successfully",
            },
          });
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      res.status(400).json({
        Conflict: "A Category with that name already exists for you.",
      });
    }
  });
};

/**
 * Allows user to edit only his categories
 * @param -> req.userId from is.auth.js middleware
 * @details -> this function compares signed in userId with the userId attatched to the category in question
 * @route "/category/:id"
 */
exports.putCategory = (req, res) => {
  const _id = req.params.id;
  const name = req.body.name;
  Category.findById(_id).then((category) => {
    if (!category) {
      return res.status(404).json({
        Error: " Could not find category to update ",
      });
    }
    if (category.creator.toString() !== req.userId) {
      // Javascript doesn't know what a Mongoose ObjectId is
      return res.status(401).json({ Error: "Unauthorized to edit category" });
    }
    const Id = req.userId;
    Category.find({
      name: req.body.name,
      creator: Id,
    })
      .then((categories) => {
        if (!categories.length) {
          category.name = name;
          return category
            .save()
            .then((result) => {
              res
                .status(200)
                .json({ Success: "Updated category name!", category: result });
            })
            .catch((err) => {
              console.log(err);
            });
        } else {
          res.json({
            Error: `A category with the name '${req.body.name}' was found. Please update using another name.`,
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

/**
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * - - - - - - - - - - - - - - - - - - Superuser actions start - - - - - - - - - - - - - - - - -
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */

/**
 * Gets any category regardless of who is signed in
 * @route "/onecategory/:id"
 */
exports.getOneCategory = (req, res) => {
  const _id = req.params.id;
  Category.findById(_id)
    .then((categ) => {
      res.status(200).json({ Success: "Category was found!", categ });
    })
    .catch((err) => {
      console.log("Could not find category", err);
      res.status(404).json({ Error: "Could not find the category." });
    });
};

/**
 * Gets all categories of all users regardless of who is signed in
 * @route "/allcategories"
 */
exports.getAllCategories = (req, res) => {
  Category.find()
    .then((categ) => {
      if (!categ.length) {
        res
          .status(404)
          .json({ Error: "No Categories were found in the database" });
      } else {
        return res
          .status(200)
          .json({ Success: "Fetched all categories of all users.", categ });
      }
    })
    .catch((err) => {
      console.log(err);
    });
};
