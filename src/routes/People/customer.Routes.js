const express = require("express");
const router = express.Router();
const CustomerController = require("../../controllers/People/CuatomerController");

router.post("/create", CustomerController.createCustomer);
router.put("/update/:customerID", CustomerController.updateCustomer);
router.delete("/delete/:customerID", CustomerController.deleteCustomer);
router.get("/getcustomerpage", CustomerController.getCustomerPage);

module.exports = router;
