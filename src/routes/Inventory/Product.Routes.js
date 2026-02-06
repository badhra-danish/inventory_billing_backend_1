const express = require("express");
const router = express.Router();
const ProductController = require("../../controllers/Inventory/Product/Product.Controller");
const { validate } = require("../../validator/middleware/validate_temp");
const {
  createProductSchema,
} = require("../../validator/Product/poduct.schema");
const { authorizeRoles } = require("../../middlewares/role");
const { auth } = require("../../middlewares/auth");
router.post(
  "/create",
  auth,
  validate(createProductSchema),
  auth,
  authorizeRoles("SHOP_ADMIN"),

  ProductController.createProduct,
);
router.post(
  "/addproductvariant/:product_id",
  auth,
  ProductController.createVariantofProduct,
);
router.get("/getproductpage", auth, ProductController.getProductPage);
router.get("/getallproduct", auth, ProductController.getAllProduct);
router.get(
  "/getallvariantbyproduct/:product_id",
  auth,
  ProductController.getAllVariantByProduct,
);
router.get(
  "/getvariantbysearch",
  auth,
  ProductController.getAllVariantBySearch,
);

router.put(
  "/upadatevariant/:variant_id",
  auth,
  ProductController.updateVariant,
);
router.put("/updateproduct/:product_id", auth, ProductController.updateProduct);

router.delete(
  "/deletevariant/:variant_id",
  auth,
  ProductController.deleteVariant,
);
router.delete(
  "/deleteproduct/:product_id",
  auth,
  ProductController.deleteProduct,
);

module.exports = router;
