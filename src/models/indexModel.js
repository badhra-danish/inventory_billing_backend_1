const Category = require("./Inventory/CategoryModel");
const SubCategory = require("./Inventory/SubCategoryModel");
const Brand = require("./Inventory/BrandModel");
const Unit = require("./Inventory/UnitModel");
const Attribute = require("./Inventory/Attributemodel");
const AttributeValues = require("./Inventory/Attrubute_values");
const Warranty = require("./Inventory/WarrantyModel");
const Customer = require("./People/CustomerModel");
const Supplier = require("./People/SupplierModel");

//Product Model and there Relations Model
const Product = require("./Inventory/ProductModel/ProductModel");
const Product_Variant = require("./Inventory/ProductModel/ProductVariantModel");
const Product_variant_Attribute = require("./Inventory/ProductModel/ProductVariantAttributeModel");

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

// Product Model Relationship
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

module.exports = {
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
};
