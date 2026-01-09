const express = require("express");
const router = express.Router();
const AttributeController = require("../../controllers/Inventory/Attribute.Controller");

router.post("/create", AttributeController.createAttribute);
router.put("/update/:attributeID", AttributeController.updateAttribute);
router.delete("/delete/:attributeID", AttributeController.deleteAttribute);
router.get("/getattributepage", AttributeController.getAttributePage);

module.exports = router;
