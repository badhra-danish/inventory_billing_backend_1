const StockController = require("../../controllers/Stock/Stock.controller");
const express = require("express");
const { auth } = require("../../middlewares/auth");
const { authorizeRoles } = require("../../middlewares/role");
const router = express.Router();

router.post(
  "/create",
  auth,
  authorizeRoles("SHOP_ADMIN"),
  StockController.createStock,
);
router.put("/updatequantity/:stock_id", StockController.updateStockQuantity);
router.get("/getallstockpage", auth, StockController.getAllStockPage);
router.get("/getvariantinstock", auth, StockController.getAllVariantInStock);
router.delete("/delete/:stock_id", StockController.deleteStockVariant);

module.exports = router;
