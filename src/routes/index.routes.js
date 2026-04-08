const express = require("express");
const router = express.Router();
// user
const userRoutes = require("./users/user.Routes");
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
const warehouseRoutes = require("./People/warehouse.route");
// Sales
const salesRoutes = require("./Sales/sale.Route");
const saleReturnRoutes = require("./SaleReturn/SaleReturn.route");

const PurchaseOrderRoutes = require("./Purchase/PurchaseOrder.routes");
const PurchaseRoutes = require("./Purchase/Purchase.Route");
router.use("/auth", userRoutes);
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

router.use("/sale", salesRoutes);
router.use("/salereturn", saleReturnRoutes);

router.use("/purchaseorder", PurchaseOrderRoutes);
router.use("/purchase", PurchaseRoutes);

router.use("/warehouse", warehouseRoutes);
module.exports = router;
