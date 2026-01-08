const express = require("express");
const router = express.Router();
const SupplierController = require("../../controllers/People/SupplierController");

router.post("/create", SupplierController.createSupplier);
router.put("/update/:supplierID", SupplierController.updateSupplier);
router.delete("/delete/:supplierID", SupplierController.deleteSupplier);
router.get("/getsupplierpage", SupplierController.getSupplierPage);

module.exports = router;
