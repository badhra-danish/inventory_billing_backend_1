const CategoryController = require("../../controllers/Inventory/Category.Controller");
const express = require("express");
const router = express.Router();

router.get("/getCategoryPage", CategoryController.getCategoryPage);
router.post("/create", CategoryController.createCategory);
router.put("/update/:category_id", CategoryController.updateCategory);
router.delete("/delete/:category_id", CategoryController.deleteCategory);
module.exports = router;
