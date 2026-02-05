const express = require("express");
const router = express.Router();
const UnitController = require("../../controllers/Inventory/Unit.Controller");
const { auth } = require("../../middlewares/auth");
const { authorizeRoles } = require("../../middlewares/role");

router.post(
  "/create",
  auth,
  authorizeRoles("SHOP_ADMIN"),
  UnitController.createUnit,
);
router.put("/update/:unitID", UnitController.updateUnit);
router.delete("/delete/:unitID", UnitController.deleteUnit);
router.get("/getunitpage", auth, UnitController.getUnitPage);

module.exports = router;
