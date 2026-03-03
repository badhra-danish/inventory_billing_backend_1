const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const PurchasePayment = sequelize.define(
  "PurchasePayment",
  {
    payment_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    purchase_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "purchase_id",
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    payment_method: {
      type: DataTypes.ENUM("CASH", "UPI", "BANK", "CHEQUE"),
      allowNull: false,
    },
    payment_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },
    reference_no: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    shop_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "purchasepayments",
    timestamps: true,
  },
);
module.exports = PurchasePayment;
