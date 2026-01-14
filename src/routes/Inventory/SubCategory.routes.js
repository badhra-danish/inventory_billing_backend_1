const SubCategoryController = require("../../controllers/Inventory/SubCategory.Controller");
const express = require("express");
const router = express.Router();

router.post("/create", SubCategoryController.createSubcategory);
router.put("/update/:subCategoryID", SubCategoryController.updateSubcategory);
router.delete(
  "/delete/:subCategoryID",
  SubCategoryController.deleteSubCategory
);
router.get("/getSubCategoryPage", SubCategoryController.getSubCategoryPage);
router.get(
  "/getsubcategorybycategory/:category_id",
  SubCategoryController.getSubcategoryByCategory
);
module.exports = router;
