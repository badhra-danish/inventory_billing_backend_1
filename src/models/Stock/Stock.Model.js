const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const Stock = sequelize.define(
  "Stock",
  {
    stock_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    product_variant_id: {
      type: DataTypes.UUID,
      allowNull: false,
      feild: "product_variant_id",
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    shop_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("INSTOCK", "OUTSTOCK"),
      defaultValue: "INSTOCK",
      allowNull: false,
    },
  },
  {
    tableName: "stocks",
    timestamps: true,
  },
);

module.exports = Stock;
