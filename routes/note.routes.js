const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/is.auth");
const notesController = require("../controllers/notes");
const notesValid = require("../validations/post.note.validation");

router.get("/notes/:sort", isAuth, notesController.getUserNotesLatest);
router.get("/notes", isAuth, notesController.getNotesOfUser);
router.get("/tags/:key", isAuth, notesController.searchUserTags);
router.get("/filtercategory/:key", isAuth, notesController.filterbyCategory);
router.post("/note", isAuth, notesValid, notesController.postAddNote);
router.put("/note/:id", isAuth, notesController.putOneNote);
router.delete("/note/:id", isAuth, notesController.deleteOneNote);

module.exports = router;

// Extra routes:
router.get("/allnotes", isAuth, notesController.getNotes); // Get All Notes
router.get("/notes/:sort", isAuth, notesController.getAllNotesBySort); //  Get All Notes - custom sort
router.get("/note/:id", isAuth, notesController.getOneNote); // Get 1 note by ID
