const SubCategoryController = require("../../controllers/Inventory/SubCategory.Controller");
const express = require("express");
const { authorizeRoles } = require("../../middlewares/role");
const { auth } = require("../../middlewares/auth");
const router = express.Router();

router.post(
  "/create",
  auth,
  authorizeRoles("SHOP_ADMIN"),
  SubCategoryController.createSubcategory,
);
router.put("/update/:subCategoryID", SubCategoryController.updateSubcategory);
router.delete(
  "/delete/:subCategoryID",
  SubCategoryController.deleteSubCategory,
);
router.get(
  "/getSubCategoryPage",
  auth,
  SubCategoryController.getSubCategoryPage,
);
router.get(
  "/getsubcategorybycategory/:category_id",
  auth,
  SubCategoryController.getSubcategoryByCategory,
);
module.exports = router;
