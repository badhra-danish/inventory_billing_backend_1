const express = require("express");
const { auth } = require("../../middlewares/auth");
const { authorizeRoles } = require("../../middlewares/role");
const PurchaseController = require("../../controllers/Purchase/Purchase.Controller");
const router = express.Router();

router.post("/create", auth, PurchaseController.createPurchase);
router.get("/getallpurchaseinfo", auth, PurchaseController.getAllPurchaseInfo);
router.get(
  "/getpurchasebyid/:purchase_id",
  auth,
  PurchaseController.getPurchaseById,
);
router.put("/update/:purchase_id", auth, PurchaseController.updatePurchase);
router.post(
  "/createpuchasepayment/:purchase_id",
  auth,
  PurchaseController.createPaymentofPurchase,
);
router.get(
  "/getallpaymentpurchase/:purchase_id",
  auth,
  PurchaseController.getAllPaymentPurchase,
);
router.put(
  "/updatepaymentpurchase/:payment_id",
  auth,
  PurchaseController.updatePaymentPurchase,
);
router.delete(
  "/deletepurchasepayment/:payment_id",
  auth,
  PurchaseController.deletePaymentPurchase,
);
module.exports = router;
