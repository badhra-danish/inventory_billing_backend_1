const UserController = require("../../controllers/User/user.Controller");
const ShopController = require("../../controllers/User/shop.Controller");
const express = require("express");
const { route } = require("../index.routes");
const router = express.Router();
const { authorizeRoles } = require("../../middlewares/role");
const { auth } = require("../../middlewares/auth");
router.post("/login", UserController.login);

router.post(
  "/createshopadmin",
  auth,
  authorizeRoles("SUPER_ADMIN"),
  ShopController.createShopAdminWithShop,
);
router.post("/shoplogin", ShopController.loginShopAdmin);
router.get("/getallshopadmin", auth, ShopController.getAllShopAdmin);
router.put("/updateshopadmin/:id", ShopController.updateShopAdminWithShop);
router.get("/dashboard/superadminstats", ShopController.getDashboardStats);
router.get(
  "/dashboard/shopadminstats/:id",
  ShopController.getShopDashboardStats,
);
router.get(
  "/dashboard/analytics/:id",
  ShopController.getSalesPurchaseAnalytics,
);

module.exports = router;
