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
router.put("/update/:unitID", auth, UnitController.updateUnit);
router.delete("/delete/:unitID", auth, UnitController.deleteUnit);
router.get("/getunitpage", auth, UnitController.getUnitPage);

module.exports = router;
