const CategoryController = require("../../controllers/Inventory/Category.Controller");
const express = require("express");
const { auth } = require("../../middlewares/auth");
const { authorizeRoles } = require("../../middlewares/role");
const router = express.Router();

router.get("/getCategoryPage", auth, CategoryController.getCategoryPage);
router.post(
  "/create",
  auth,
  authorizeRoles("SHOP_ADMIN"),
  CategoryController.createCategory,
);
router.put("/update/:category_id", auth, CategoryController.updateCategory);
router.delete("/delete/:category_id", auth, CategoryController.deleteCategory);
module.exports = router;
