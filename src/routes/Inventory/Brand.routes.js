const express = require("express");
const router = express.Router();
const BrandController = require("../../controllers/Inventory/Brand.Controller");
const { auth } = require("../../middlewares/auth");
const { authorizeRoles } = require("../../middlewares/role");

router.post(
  "/create",
  auth,
  authorizeRoles("SHOP_ADMIN"),
  BrandController.createBrands,
);
router.put("/update/:brandID", BrandController.updateBrand);
router.delete("/delete/:brandID", BrandController.deleteBrand);
router.get("/getbrandpage", auth, BrandController.getBrandPage);

module.exports = router;
