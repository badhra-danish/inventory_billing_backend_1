const SaleController = require("../../controllers/Sales/Sales.controller");
const express = require("express");
const router = express.Router();

router.post("/create", SaleController.createSale);

module.exports = router;
