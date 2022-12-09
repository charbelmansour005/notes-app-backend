const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  email: {
    type: String,
    required: [true, "Please enter your email address."],
    lowercase: true,
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please enter a password."],
    minlength: 13,
  },
  name: {
    type: String,
    required: [false, "Please enter your name."], //was true
  },
  notes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note",
    },
  ],
  categories: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
  ],
});

const User = mongoose.model("User", userSchema);

var query = User.find();
query.countDocuments(function (err, count) {
  if (err) console.log(err);
  else console.log("All Users:", count);
});

module.exports = User;
