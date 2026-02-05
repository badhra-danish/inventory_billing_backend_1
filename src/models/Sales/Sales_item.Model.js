const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const SaleItem = sequelize.define(
  "SaleItem",
  {
    sales_item_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },
    sale_id: {
      type: DataTypes.UUID,
      field: "sale_id",
      allowNull: false,
    },
    product_variant_id: {
      type: DataTypes.UUID,
      field: "product_variant_id",
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    discount: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    tax: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    tax_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    shop_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "sale_items",
    timestamps: true,
  },
);
module.exports = SaleItem;
