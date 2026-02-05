const express = require("express");
const router = express.Router();
const AttributeController = require("../../controllers/Inventory/Attribute.Controller");
const { auth } = require("../../middlewares/auth");
const { authorizeRoles } = require("../../middlewares/role");

router.post(
  "/create",
  auth,
  authorizeRoles("SHOP_ADMIN"),
  AttributeController.createAttribute,
);
router.put("/update/:attributeID", AttributeController.updateAttribute);
router.delete("/delete/:attributeID", AttributeController.deleteAttribute);
router.get("/getattributepage", auth, AttributeController.getAttributePage);

module.exports = router;
