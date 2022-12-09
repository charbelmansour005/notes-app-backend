const Category = require("../models/category");
const User = require("../models/user");
const { validationResult } = require("express-validator");

/**
 * fetches the categories created by the signed in user
 * @param -> req.userId from is.auth.js middleware
 * async
 */
exports.getCategsOfUser = async (req, res) => {
  const id = req.userId;
  const categories = await Category.find({ creator: id });
  if (!categories.length) {
    res
      .status(404)
      .json({ Error: "You do not have any categories, try adding some!" });
  } else {
    res.status(200).json({ UserCategories: categories });
  }
};

/**
 * Signed in user may only delete one of his own categories
 * @param -> ObjectId of the target Category to be deleted
 * async
 */
exports.deleteUserCategory = async (req, res) => {
  let creator = req.userId;
  const _id = req.params.id;
  const category = await Category.findById(_id);
  if (!category) {
    return res.status(404).json({
      Error: "Could not find category to delete",
    });
  }
  if (category.creator.toString() !== req.userId) {
    return res.status(401).json({
      Error: "Not Authorized to delete category",
    });
  }
  Category.findByIdAndRemove(_id);
  const user = await User.findById(req.userId);
  creator = user;
  user.categories.pull(_id);
  user.save();
  res.status(200).json({
    Success: "Category was deleted",
  });
};

/**
 * When a signed in user creates a category, it automatically takes his ID.
 * @param -> req.userId from is.auth.js middleware
 * es7 needs better error handling
 */
exports.postAddCategory = async (req, res) => {
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

  const categories = await Category.find({
    name: req.body.name,
    creator: Id,
  });
  if (!categories.length) {
    const newCateg = await category.save();
    res.status(201).json({
      newCateg,
      info: {
        dateCreated: new Date().toISOString(),
        status: "Category Created Successfully",
      },
    });
  } else {
    res.status(400).json({
      Conflict: "A Category with that name already exists for you.",
    });
  }
};

/**
 * Allows user to edit only his categories
 * @param -> req.userId from is.auth.js middleware
 * es7 - test works
 */
exports.putCategorySet = async (req, res) => {
  const _id = req.params.id;
  const name = req.body.name;
  if (!name) {
    res.status(404).json({ Error: "Do not leave the category name empty" });
  } else {
    const category = await Category.findById(_id);
    if (!category) {
      return res.status(404).json({
        Error: " Could not find category to update ",
      });
    }
    if (category.creator.toString() !== req.userId) {
      return res.status(401).json({ Error: "Unauthorized to edit category" });
    }
    const Id = req.userId;
    const categories = await Category.find({
      name: req.body.name,
      creator: Id,
    });
    if (!categories.length) {
      category.name = name;
      const result = await category.save();
      res.status(200).json({
        Success: "Updated category name!",
        category: result,
      });
    } else {
      res.json({
        Error: `A category with the name '${req.body.name}' was found. Please update to another name.`,
      });
    }
  }
};

// - - - - - - - - - - - - - - - - - - Extra controllers - - - - - - - - - - - - - - - - - -

/**
 * Gets any category regardless of who is signed in
 */
exports.getOneCategory = async (req, res) => {
  const _id = req.params.id;
  const categ = await Category.findById(_id);
  if (!categ) {
    res.status(404).json({ Error: "Could not find the category." });
  }
  res.status(200).json({ Success: "Category was found!", categ });
};

/**
 * Gets all categories of all users regardless of who is signed in
 */
exports.getAllCategories = async (req, res) => {
  const categ = await Category.find();
  if (!categ.length) {
    res.status(404).json({ Error: "No Categories were found in the database" });
  } else {
    return res
      .status(200)
      .json({ Success: "Fetched all categories of all users.", categ });
  }
};
