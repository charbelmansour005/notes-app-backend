const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/is.auth");
const notesController = require("../controllers/notes");
// Readme: value of :sort can be entered in the URL as either : 1, -1, ascending or descending

router.get("/notes/:sort", isAuth, notesController.getUserNotesLatest);
router.get("/notes", isAuth, notesController.getNotesOfUser);
router.get("/tags/:key", isAuth, notesController.searchUserTags);
router.get("/filtercategory/:key", isAuth, notesController.filterbyCategory);
router.post("/note", isAuth, notesController.postAddNote);
router.put("/note/:id", isAuth, notesController.putOneNote);
router.delete("/note/:id", isAuth, notesController.deleteOneNote);

module.exports = router;

// Superuser
router.get("/allnotes", isAuth, notesController.getNotes); // Get All Notes
router.get("/notes/:sort", isAuth, notesController.getAllNotesBySort); //  Get All Notes - custom sort
router.get("/note/:id", isAuth, notesController.getOneNote); // Get 1 note by ID
