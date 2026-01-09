const express = require("express");
const router = express.Router();
const WarrantyController = require("../../controllers/Inventory/Warranty.Controller");

router.post("/create", WarrantyController.createWarranty);
router.put("/update/:warrantyID", WarrantyController.updateWarranty);
router.delete("/delete/:warrantyID", WarrantyController.deleteWarranty);
router.get("/getwarrantypage", WarrantyController.getWarrantyPage);

module.exports = router;
