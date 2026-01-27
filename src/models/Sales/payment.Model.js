const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const { tr, fa } = require("zod/locales");

const Payment = sequelize.define(
  "Payment",
  {
    payment_id: {
      type: DataTypes.UUID,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4,
    },
    sale_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "sale_id",
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
    note: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    tableName: "payments",
    timestamps: true,
  },
);
module.exports = Payment;
