const { body } = require("express-validator");

const noteValidation = [
  body("content")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Content must have a minimum of 1 character."),
  body("categoryName")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Please enter a category for the note."),
];

module.exports = noteValidation;
