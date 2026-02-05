const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const Product_Variant = sequelize.define(
  "Product_Variant",
  {
    product_variant_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    price: {
      type: DataTypes.DOUBLE,
      allowNull: false,
      min: {
        args: [0],
        msg: "Price must be greater than or equal to 0",
      },
    },
    skuCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    variant_label: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    barcode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    discount_type: {
      type: DataTypes.ENUM("FIXED", "PERCENTAGE", "NONE"),
      defaultValue: "NONE",
      allowNull: true,
    },
    discount_value: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    tax_type: {
      type: DataTypes.ENUM("INCLUSIVE", "EXCLUSIVE", "NONE"),
      defaultValue: "NONE",
      allowNull: true,
    },
    tax_value: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      allowNull: true,
    },
    product_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "product_id",
    },
    shop_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "product_variants",
    timestamps: true,
  },
);

module.exports = Product_Variant;
