const express = require("express");
const router = express.Router();
const CustomerController = require("../../controllers/People/Customer.Controller");
const { auth } = require("../../middlewares/auth");
const { authorizeRoles } = require("../../middlewares/role");

router.post(
  "/create",
  auth,
  authorizeRoles("SHOP_ADMIN"),
  CustomerController.createCustomer,
);
router.put("/update/:customerID", auth, CustomerController.updateCustomer);
router.delete("/delete/:customerID", auth, CustomerController.deleteCustomer);
router.get("/getcustomerpage", auth, CustomerController.getCustomerPage);
router.get("/getallcustomer", auth, CustomerController.getAllCustomer);

module.exports = router;
