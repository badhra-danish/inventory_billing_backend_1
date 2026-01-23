const express = require("express");
const router = express.Router();

const categoryRoutes = require("./Inventory/Category.routes");
const subcategoryRoutes = require("./Inventory/SubCategory.routes");
const brandRoutes = require("./Inventory/Brand.routes");
const unitRoutes = require("./Inventory/Unit.routes");
const attributeRoutes = require("./Inventory/Attribute.Routes");
const warrantyRoutes = require("./Inventory/Warranty.routes");
const customerRoutes = require("./People/customer.Routes");
const supplierRoutes = require("./People/supplier.route");
const productRoutes = require("./Inventory/Product.Routes");
//stock
const stockRoutes = require("./Stock/Stock.Routes");
router.use("/category", categoryRoutes);
router.use("/subcategory", subcategoryRoutes);
router.use("/brand", brandRoutes);
router.use("/unit", unitRoutes);
router.use("/attribute", attributeRoutes);
router.use("/warranty", warrantyRoutes);
router.use("/product", productRoutes);

router.use("/customer", customerRoutes);
router.use("/supplier", supplierRoutes);

router.use("/stock", stockRoutes);
module.exports = router;
