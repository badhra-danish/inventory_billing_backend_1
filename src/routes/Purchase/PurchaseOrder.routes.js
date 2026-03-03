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
router.get(
  "/getpurchaseorderid/:purchase_order_id",
  auth,
  PurchaseController.getPurchaseOrder,
);
router.put(
  "/updatepurchaseorder/:purcahse_order_id",
  auth,
  PurchaseController.updatePurchaseOrder,
);
router.get(
  "/getallpurchaseorderno",
  auth,
  PurchaseController.getAllPurchaseOrderNo,
);
module.exports = router;
