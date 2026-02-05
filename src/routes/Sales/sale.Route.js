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
router.put("/update/:sale_id", SaleController.updateSales);
router.get("/getallsale", SaleController.getAllSalesInfo);
router.get("/getallinvoice", SaleController.getAllInvoiceInfo);
router.get("/getallpayment/:sale_id", SaleController.getAllPaymentSales);
router.get("/getsalebyid/:sale_id", SaleController.getSaleById);
router.put("/updatepayment/:payment_id", SaleController.updatePayment);
router.delete("/deletepayment/:payment_id", SaleController.deletePayment);

module.exports = router;
