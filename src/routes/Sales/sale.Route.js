const SaleController = require("../../controllers/Sales/Sales.controller");
const express = require("express");
const router = express.Router();

router.post("/create", SaleController.createSale);
router.post("/createPayment/:sale_id", SaleController.createPayment);
router.get("/getallsale", SaleController.getAllSalesInfo);
router.get("/getallpayment/:sale_id", SaleController.getAllPaymentSales);
router.get("/getsalebyid/:sale_id", SaleController.getSaleById);
router.put("/updatepayment/:payment_id", SaleController.updatePayment);
router.delete("/deletepayment/:payment_id", SaleController.deletePayment);

module.exports = router;
