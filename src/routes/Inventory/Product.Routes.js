const express = require("express");
const router = express.Router();
const ProductController = require("../../controllers/Inventory/Product/Product.Controller");
const { validate } = require("../../validator/middleware/validate_temp");
const {
  createProductSchema,
} = require("../../validator/Product/poduct.schema");
router.post(
  "/create",
  validate(createProductSchema),
  ProductController.createProduct
);
router.get("/getproductpage", ProductController.getProductPage);
router.get("/getallproduct", ProductController.getAllProduct);
router.get(
  "/getallvariantbyproduct/:product_id",
  ProductController.getAllVariantByProduct
);
router.put("/upadtevariant/:variant_id", ProductController.updateVariant);
module.exports = router;
