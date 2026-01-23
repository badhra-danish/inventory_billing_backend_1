const express = require("express");
const router = express.Router();
const CustomerController = require("../../controllers/People/Customer.Controller");

router.post("/create", CustomerController.createCustomer);
router.put("/update/:customerID", CustomerController.updateCustomer);
router.delete("/delete/:customerID", CustomerController.deleteCustomer);
router.get("/getcustomerpage", CustomerController.getCustomerPage);
router.get("/getallcustomer", CustomerController.getAllCustomer);

module.exports = router;
