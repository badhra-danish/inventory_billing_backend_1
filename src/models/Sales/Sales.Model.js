const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const Sale = sequelize.define(
  "Sale",
  {
    sale_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    invoice_no: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    customer_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    sale_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
    },

    order_tax: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      validate: { min: 0 },
    },

    shipping: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      validate: { min: 0 },
    },

    discount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      validate: { min: 0 },
    },

    status: {
      type: DataTypes.ENUM("INPROGRESS", "COMPLETED", "CANCELLED"),
      allowNull: false,
      defaultValue: "INPROGRESS",
    },

    sub_total: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    grand_total: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    paid_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    due_amount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },

    payment_status: {
      type: DataTypes.ENUM("PAID", "UNPAID", "PARTIALLY_PAID", "OVERDUE"),
      defaultValue: "UNPAID",
    },
    shop_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "sales",
    timestamps: true,
  },
);

module.exports = Sale;
