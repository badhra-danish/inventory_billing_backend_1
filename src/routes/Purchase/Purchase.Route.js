const express = require("express");
const { auth } = require("../../middlewares/auth");
const { authorizeRoles } = require("../../middlewares/role");
const PurchaseController = require("../../controllers/Purchase/Purchase.Controller");
const router = express.Router();

router.post("/create", auth, PurchaseController.createPurchase);

module.exports = router;
