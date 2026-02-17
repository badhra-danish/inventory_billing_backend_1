const express = require("express");
const router = express.Router();
const WareHouseController = require("../../controllers/People/Warehouse.Controller");
const { auth } = require("../../middlewares/auth");
const { authorizeRoles } = require("../../middlewares/role");
const { wareHouseService } = require("../../services/People/WareHouse.Service");

router.post(
  "/create",
  auth,
  authorizeRoles("SHOP_ADMIN"),
  WareHouseController.createWarehouse,
);
router.get("/getallwarehouse", auth, WareHouseController.getAllWarehouse);
router.get(
  "/getbyid/:warehouse_id",
  auth,
  WareHouseController.getWarehouseById,
);

// UPDATE
router.put(
  "/update/:warehouse_id",
  auth,
  authorizeRoles("SHOP_ADMIN"),
  WareHouseController.updateWarehouse,
);

// DELETE
router.delete(
  "/delete/:warehouse_id",
  auth,
  authorizeRoles("SHOP_ADMIN"),
  WareHouseController.deleteWarehouse,
);
module.exports = router;
