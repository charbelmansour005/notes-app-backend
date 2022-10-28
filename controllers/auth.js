const User = require("../model/user");
var nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "charbelmansour005@gmail.com",
    pass: "encxvodkkuczlxdv",
  },
});

exports.postLogin = (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let loadedUser;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        const error = new Error("");
        throw error;
      }
      loadedUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((isEqual) => {
      if (!isEqual) {
        return res.json({ Error: "Wrong password." });
      }
      const token = jwt.sign(
        {
          email: loadedUser.email,
          userId: loadedUser._id.toString(),
        },
        "somesupersecretsecret",
        { expiresIn: "8h" }
      );
      res.status(200).json({ token: token, userId: loadedUser._id.toString() });
    })
    .catch((error) => {
      console.log(error);
      res
        .status(401)
        .json({ Error: "A user with this email could not be found." });
    });
};

exports.putSignup = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: "Validation FAILED, Password or Email format is incorrect",
      error: errors.array(),
    });
  }
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        res.status(400).json({
          error:
            "An existing Email address was found, please sign up using a different one.",
        });
        return console.log("Failed");
      }
      return bcrypt.hash(password, 12).then((hashedPassword) => {
        const authenticatedUser = new User({
          name: name,
          email: email,
          password: hashedPassword,
        });
        return authenticatedUser.save();
      });
    })
    .then(() => {
      res.json({
        Success: "Signed up!",
      });
      return transporter.sendMail({
        to: email,
        from: "employees@node-complete.com",
        html: "<h1>You Signed up!</h1>",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};
