const { body } = require("express-validator");

const categoryValidation = [
  body("name")
    .trim() //meaning?
    .isLength({ min: 2 })
    .withMessage("Category name must include at least 1 character"),
];

module.exports = categoryValidation;
