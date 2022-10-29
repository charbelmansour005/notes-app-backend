const mongoose = require("mongoose");

const noteSchema = mongoose.Schema({
  content: {
    type: String,
    required: [true, "Content is required"],
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  updated_At: { type: Date, default: Date.now() },
  tags: {
    type: String,
  },
  categoryName: {
    type: String,
    ref: "Category",
    required: [true, "A note must belong to a category"],
  },
});

const Note = mongoose.model("Note", noteSchema);

var query = Note.find();
query.countDocuments(function (err, count) {
  if (err) console.log(err);
  else console.log("All Notes:", count);
});

module.exports = Note;
