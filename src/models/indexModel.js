// user --- //
const user = require("./Users/User.Model");
const Shop = require("./Users/Shop.Model");

const Category = require("./Inventory/CategoryModel");
const SubCategory = require("./Inventory/SubCategoryModel");
const Brand = require("./Inventory/BrandModel");
const Unit = require("./Inventory/UnitModel");
const Attribute = require("./Inventory/Attributemodel");
const AttributeValues = require("./Inventory/Attrubute_values");
const Warranty = require("./Inventory/WarrantyModel");

////----------People Table Models--------///
const Customer = require("./People/CustomerModel");
const Supplier = require("./People/SupplierModel");
const Warehouse = require("./People/WareHouse");
//----------Product Table Models--------///

const Product = require("./Inventory/ProductModel/ProductModel");
const Product_Variant = require("./Inventory/ProductModel/ProductVariantModel");
const Product_variant_Attribute = require("./Inventory/ProductModel/ProductVariantAttributeModel");

//----------stock Table Models--------///

const Stock = require("./Stock/Stock.Model");

//----------Sales Table Models--------///

const Sale = require("./Sales/Sales.Model");
const SaleItem = require("./Sales/Sales_item.Model");
const SalesPayment = require("./Sales/Salespayment.Model");
const SaleReturn = require("./SalesReturn/SalesReturn.Model");
const SaleReturnItems = require("./SalesReturn/SalesReturn_item.Model");

const User = require("./Users/User.Model");
const StockMovement = require("./Stock/StockMovement.Model");

//----------Purchase Table Models--------///
const PurchaseOrder = require("./Purchase/PurchaseOrder.model");
const PurchaseOrderItem = require("./Purchase/PurchaseOrder_item.model");
const Purchase = require("./Purchase/PurchaseModel");
const PurchaseItems = require("./Purchase/Purchase_item_model");
const PurchasePayment = require("./Purchase/PurchasePayment.Model");

/// ---------  relationship or the Assosiation of the models Users .. --------////
Shop.hasMany(User, { foreignKey: "shop_id", as: "users" });
User.belongsTo(Shop, { foreignKey: "shop_id", as: "shop" });
/// ---------  relationship or the Assosiation of the models --------////

Category.hasMany(SubCategory, {
  foreignKey: "category_id",
  as: "subcategories",
});
SubCategory.belongsTo(Category, {
  foreignKey: "category_id",
  as: "category",
});

Attribute.hasMany(AttributeValues, {
  foreignKey: "attribute_id",
  as: "attributeValues",
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});
AttributeValues.belongsTo(Attribute, {
  foreignKey: "attribute_id",
  as: "attribute",
  onDelete: "RESTRICT",
});

//-------- Product Model Relationship----------//
Brand.hasMany(Product, { foreignKey: "brand_id", as: "products" });
Product.belongsTo(Brand, { foreignKey: "brand_id", as: "brand" });

Unit.hasMany(Product, { foreignKey: "unit_id", as: "products" });
Product.belongsTo(Unit, { foreignKey: "unit_id", as: "unit" });

Category.hasMany(Product, { foreignKey: "category_id", as: "products" });
Product.belongsTo(Category, { foreignKey: "category_id", as: "category" });

SubCategory.hasMany(Product, { foreignKey: "subcategory_id", as: "products" });
Product.belongsTo(SubCategory, {
  foreignKey: "subcategory_id",
  as: "subcategory",
});

Warranty.hasMany(Product, { foreignKey: "warranty_id", as: "products" });
Product.belongsTo(Warranty, { foreignKey: "warranty_id", as: "warranty" });

Product.hasMany(Product_Variant, { foreignKey: "product_id", as: "variants" });
Product_Variant.belongsTo(Product, { foreignKey: "product_id", as: "product" });

Product_Variant.hasMany(Product_variant_Attribute, {
  foreignKey: "product_variant_id",
  as: "variant_attributes",
});
Product_variant_Attribute.belongsTo(Product_Variant, {
  foreignKey: "product_variant_id",
  as: "variant",
});

AttributeValues.hasMany(Product_variant_Attribute, {
  foreignKey: "attribute_value_id",
  as: "value_links",
});
Product_variant_Attribute.belongsTo(AttributeValues, {
  foreignKey: "attribute_value_id",
  as: "value",
});

//-------------stock Model Relationship-------------/////

// Product_Variant.hasOne(Stock, {
//   foreignKey: "product_variant_id",
//   as: "stock",
// });
// Stock.belongsTo(Product_Variant, {
//   foreignKey: "product_variant_id",
//   as: "variant",
// });

// stock variant --
Product_Variant.hasMany(Stock, {
  foreignKey: "product_variant_id",
  as: "stocks",
});

Stock.belongsTo(Product_Variant, {
  foreignKey: "product_variant_id",
  as: "variant",
});

// stock warehouse
Warehouse.hasMany(Stock, {
  foreignKey: "warehouse_id",
  as: "stocks",
});

Stock.belongsTo(Warehouse, {
  foreignKey: "warehouse_id",
  as: "warehouse",
});

// Stock Movements
Stock.hasMany(StockMovement, {
  foreignKey: "stock_id",
  as: "movements",
});

StockMovement.belongsTo(Stock, {
  foreignKey: "stock_id",
  as: "stock",
});

//-------------Sales Model Relationship-------------/////
// Sale → Items
Sale.hasMany(SaleItem, {
  foreignKey: "sale_id",
  as: "sales_items",
});
SaleItem.belongsTo(Sale, {
  foreignKey: "sale_id",
  as: "sale",
});

// Sale → Payments
Sale.hasMany(SalesPayment, {
  foreignKey: "sale_id",
  as: "payments",
});
SalesPayment.belongsTo(Sale, {
  foreignKey: "sale_id",
  as: "sale",
});

// Customer → Sale
Customer.hasMany(Sale, {
  foreignKey: "customer_id",
  as: "sales",
});
Sale.belongsTo(Customer, {
  foreignKey: "customer_id",
  as: "customer",
});

// Variant → SaleItem
Product_Variant.hasMany(SaleItem, {
  foreignKey: "product_variant_id",
  as: "sale_items",
});
SaleItem.belongsTo(Product_Variant, {
  foreignKey: "product_variant_id",
  as: "variant",
});

// Sale → Returns
Sale.hasMany(SaleReturn, {
  foreignKey: "sale_id",
  as: "returns",
});
SaleReturn.belongsTo(Sale, {
  foreignKey: "sale_id",
  as: "sale",
});

// Return → Items
SaleReturn.hasMany(SaleReturnItems, {
  foreignKey: "sale_return_id",
  as: "items",
});
SaleReturnItems.belongsTo(SaleReturn, {
  foreignKey: "sale_return_id",
  as: "sale_return",
});

// SaleItem → ReturnItems
SaleItem.hasMany(SaleReturnItems, {
  foreignKey: "sale_item_id",
  as: "return_items",
});
SaleReturnItems.belongsTo(SaleItem, {
  foreignKey: "sale_item_id",
  as: "sale_item",
});

// Variant → ReturnItems
Product_Variant.hasMany(SaleReturnItems, {
  foreignKey: "product_variant_id",
  as: "return_items",
});
SaleReturnItems.belongsTo(Product_Variant, {
  foreignKey: "product_variant_id",
  as: "variant",
});
// Purchase Realtionship

Purchase.hasMany(PurchaseItems, {
  foreignKey: "purchase_id",
  as: "purchase_items",
});
PurchaseItems.belongsTo(Purchase, {
  foreignKey: "purchase_id",
  as: "purchase",
});
PurchaseItems.belongsTo(Product_Variant, {
  foreignKey: "product_variant_id",
  as: "variant",
});
Purchase.hasMany(PurchasePayment, {
  foreignKey: "purchase_id",
  as: "purchasepayments",
});

PurchasePayment.belongsTo(Purchase, {
  foreignKey: "purchase_id",
  as: "purchase",
});

Supplier.hasMany(Purchase, {
  foreignKey: "supplier_id",
  as: "purchases",
});
Purchase.belongsTo(Supplier, {
  foreignKey: "supplier_id",
  as: "supplier",
});
Warehouse.hasMany(PurchaseItems, {
  foreignKey: "warehouse_id",
  as: "purchase_items",
});
PurchaseItems.belongsTo(Warehouse, {
  foreignKey: "warehouse_id",
  as: "warehouse",
});

// Purchase Order Relationships

PurchaseOrder.hasMany(PurchaseOrderItem, {
  foreignKey: "purchase_order_id",
  as: "items",
});

PurchaseOrderItem.belongsTo(PurchaseOrder, {
  foreignKey: "purchase_order_id",
});
PurchaseOrder.belongsTo(Supplier, {
  foreignKey: "supplier_id",
  as: "supplier",
});

Supplier.hasMany(PurchaseOrder, {
  foreignKey: "supplier_id",
});
PurchaseOrder.belongsTo(Warehouse, {
  foreignKey: "warehouse_id",
  as: "warehouse",
});

Warehouse.hasMany(PurchaseOrder, {
  foreignKey: "warehouse_id",
});
PurchaseOrderItem.belongsTo(Product_Variant, {
  foreignKey: "product_variant_id",
  as: "variant",
});

Product_Variant.hasMany(PurchaseOrderItem, {
  foreignKey: "product_variant_id",
});
module.exports = {
  Shop,
  user,
  Category,
  SubCategory,
  Brand,
  Unit,
  Attribute,
  AttributeValues,
  Warranty,
  Customer,
  Supplier,
  Product,
  Product_Variant,
  Product_variant_Attribute,
  Stock,
  Sale,
  SaleItem,
  SalesPayment,
  Warehouse,
  StockMovement,
  PurchaseOrder,
  PurchaseOrderItem,
  SaleReturn,
  SaleReturnItems,
  Purchase,
  PurchaseItems,
  PurchasePayment,
};
