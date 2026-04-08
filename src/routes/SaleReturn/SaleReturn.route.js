const SaleReturnController = require("../../controllers/SaleReturn/SaleReturn.Controller");
const express = require("express");
const { auth } = require("../../middlewares/auth");
const { authorizeRoles } = require("../../middlewares/role");
const router = express.Router();

router.post("/create", auth, SaleReturnController.createSaleReturn);
router.get("/getallsalesreturn", auth, SaleReturnController.getAllSalesReturn);
router.get(
  "/getsalesreturnbyid/:sale_return_id",
  auth,
  SaleReturnController.getSaleReturnById,
);
router.put(
  "/update/:sale_return_id",
  auth,
  SaleReturnController.saleReturnUpdate,
);
module.exports = router;
