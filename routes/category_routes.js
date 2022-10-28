const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/is.auth");

const categoryController = require("../controllers/categories");
const categoryValidation = require("../validation/category_validation");

router.get("/categ", isAuth, categoryController.getCategsOfUser);
router.delete("/category/:id", isAuth, categoryController.deleteUserCategory);
router.post(
  "/categories",
  isAuth,
  categoryValidation,
  categoryController.postAddCategory
);
router.put("/category/:id", isAuth, categoryController.putCategory);

//superuser
router.get("/onecategory/:id", isAuth, categoryController.getOneCategory);
router.get("/allcategories", isAuth, categoryController.getAllCategories);

module.exports = router;
