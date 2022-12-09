const { body } = require("express-validator");

const signUpValidation = [
  body("email")
    .isEmail()
    .withMessage("Please enter a valid email.")
    .normalizeEmail(),
  body("password")
    .trim()
    .isLength({ min: 13 })
    .withMessage("Password must have a minimum of 13 characters."),
  // body("name")
  //   .trim()
  //   .isLength({ min: 1 })
  //   .withMessage("Please enter your name."),
];

module.exports = signUpValidation;
