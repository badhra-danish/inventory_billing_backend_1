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
module.exports = router;
