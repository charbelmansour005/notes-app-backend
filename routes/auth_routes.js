const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth");
const signUpValidation = require("../validations/auth_validation");

router.post("/login", authController.postLogin);
router.put("/signup", signUpValidation, authController.putSignup);

module.exports = router;
