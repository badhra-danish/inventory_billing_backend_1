const SaleController = require("../../controllers/Sales/Sales.controller");
const express = require("express");
const { auth } = require("../../middlewares/auth");
const { authorizeRoles } = require("../../middlewares/role");
const router = express.Router();

router.post(
  "/create",
  auth,
  authorizeRoles("SHOP_ADMIN"),
  SaleController.createSale,
);
router.post("/createPayment/:sale_id", auth, SaleController.createPayment);
router.put("/update/:sale_id", auth, SaleController.updateSales);
router.get("/getallsale", auth, SaleController.getAllSalesInfo);
router.get("/getallinvoice", auth, SaleController.getAllInvoiceInfo);
router.get("/getallpayment/:sale_id", auth, SaleController.getAllPaymentSales);
router.get("/getsalebyid/:sale_id", auth, SaleController.getSaleById);
router.put("/updatepayment/:payment_id", auth, SaleController.updatePayment);
router.delete("/deletepayment/:payment_id", auth, SaleController.deletePayment);

module.exports = router;
