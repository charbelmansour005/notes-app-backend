const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/is.auth");

const categCntrl = require("../controllers/categories");
const categValid = require("../validations/category.validation");

router.get("/mycategs", isAuth, categCntrl.getCategsOfUser);
router.delete("/category/:id", isAuth, categCntrl.deleteUserCategory);
router.post("/categories", isAuth, categValid, categCntrl.postAddCategory);
router.put("/category/:id", isAuth, categCntrl.putCategorySet);

// Extra routes:
router.get("/onecategory/:id", isAuth, categCntrl.getOneCategory);
router.get("/allcategories", isAuth, categCntrl.getAllCategories);

module.exports = router;
