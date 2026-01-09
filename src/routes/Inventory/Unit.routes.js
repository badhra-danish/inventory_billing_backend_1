const express = require("express");
const router = express.Router();
const UnitController = require("../../controllers/Inventory/Unit.Controller");

router.post("/create", UnitController.createUnit);
router.put("/update/:unitID", UnitController.updateUnit);
router.delete("/delete/:unitID", UnitController.deleteUnit);
router.get("/getunitpage", UnitController.getUnitPage);

module.exports = router;
