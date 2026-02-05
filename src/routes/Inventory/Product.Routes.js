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
  ProductController.createProduct,
);
router.post(
  "/addproductvariant/:product_id",
  ProductController.createVariantofProduct,
);
router.get("/getproductpage", ProductController.getProductPage);
router.get("/getallproduct", ProductController.getAllProduct);
router.get(
  "/getallvariantbyproduct/:product_id",
  ProductController.getAllVariantByProduct,
);
router.get("/getvariantbysearch", ProductController.getAllVariantBySearch);

router.put("/upadatevariant/:variant_id", ProductController.updateVariant);
router.put("/updateproduct/:product_id", ProductController.updateProduct);

router.delete("/deletevariant/:variant_id", ProductController.deleteVariant);
router.delete("/deleteproduct/:product_id", ProductController.deleteProduct);

module.exports = router;
