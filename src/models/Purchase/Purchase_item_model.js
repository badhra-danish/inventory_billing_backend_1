const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const PurchaseItem = sequelize.define(
  "PurchaseItem",
  {
    purchase_item_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    purchase_id: {
      type: DataTypes.UUID,
      field: "purchase_id",
      allowNull: false,
    },

    product_variant_id: {
      type: DataTypes.UUID,
      field: "product_variant_id",
      allowNull: false,
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
  },
  {
    tableName: "purchase_items",
    timestamps: true,
  },
);

module.exports = PurchaseItem;
