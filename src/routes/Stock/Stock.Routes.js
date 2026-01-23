const StockController = require("../../controllers/Stock/Stock.controller");
const express = require("express");
const router = express.Router();

router.post("/create", StockController.createStock);
router.put("/updatequantity/:stock_id", StockController.updateStockQuantity);
router.get("/getallstockpage", StockController.getAllStockPage);
router.get("/getvariantinstock", StockController.getAllVariantInStock);
router.delete("/delete/:stock_id", StockController.deleteStockVariant);

module.exports = router;
