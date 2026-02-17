const express = require("express");
const { auth } = require("../../middlewares/auth");
const { authorizeRoles } = require("../../middlewares/role");
const PurchaseController = require("../../controllers/Purchase/PurchaseOrder.Controller");
const router = express.Router();

router.post(
  "/createpurchaseorder",
  auth,
  authorizeRoles("SHOP_ADMIN"),
  PurchaseController.createPurchaseOrder,
);
router.get(
  "/getallpurchaseorder",
  auth,
  PurchaseController.getAllPurchaseOrder,
);
module.exports = router;
