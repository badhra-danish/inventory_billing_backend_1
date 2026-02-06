const express = require("express");
const router = express.Router();
const SupplierController = require("../../controllers/People/Supplier.Controller");
const { auth } = require("../../middlewares/auth");
const { authorizeRoles } = require("../../middlewares/role");

router.post(
  "/create",
  auth,
  authorizeRoles("SHOP_ADMIN"),
  SupplierController.createSupplier,
);
router.put("/update/:supplierID", auth, SupplierController.updateSupplier);
router.delete("/delete/:supplierID", auth, SupplierController.deleteSupplier);
router.get("/getsupplierpage", auth, SupplierController.getSupplierPage);

module.exports = router;
