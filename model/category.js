const mongoose = require("mongoose");

const categorySchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Category name is required"],
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

const Category = mongoose.model("Category", categorySchema);

var query = Category.find();
query.countDocuments(function (err, count) {
  if (err) console.log(err);
  else console.log("All Categories:", count);
});

module.exports = Category;
