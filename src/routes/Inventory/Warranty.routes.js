const express = require("express");
const router = express.Router();
const WarrantyController = require("../../controllers/Inventory/Warranty.Controller");
const { auth } = require("../../middlewares/auth");
const { authorizeRoles } = require("../../middlewares/role");

router.post(
  "/create",
  auth,
  authorizeRoles("SHOP_ADMIN"),
  WarrantyController.createWarranty,
);
router.put("/update/:warrantyID", WarrantyController.updateWarranty);
router.delete("/delete/:warrantyID", WarrantyController.deleteWarranty);
router.get("/getwarrantypage", auth, WarrantyController.getWarrantyPage);

module.exports = router;
