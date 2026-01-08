const express = require("express");
const router = express.Router();
const BrandController = require("../../controllers/Inventory/BrandController");

router.post("/create", BrandController.createBrands);
router.put("/update/:brandID", BrandController.updateBrand);
router.delete("/delete/:brandID", BrandController.deleteBrand);
router.get("/getbrandpage", BrandController.getBrandPage);

module.exports = router;
