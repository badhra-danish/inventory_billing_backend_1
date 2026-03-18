const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const { Sale } = require("../indexModel");

const SaleReturn = sequelize.define(
  "SalesReturn",
  {
    sale_return_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    srn_no: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: "SRN number cannot be empty",
        },
      },
    },

    sale_id: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Sale ID is required",
        },
      },
    },

    sale_return_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: {
          msg: "Sale return date must be a valid date",
        },
        notNull: {
          msg: "Sale return date is required",
        },
      },
    },

    status: {
      type: DataTypes.ENUM("PENDING", "RECEIVED"),
      allowNull: false,
      defaultValue: "PENDING",
    },
    payment_status: {
      type: DataTypes.ENUM("PAID", "UNPAID", "PARTIALY_PAID", "REFUNDED"),
      allowNull: false,
      defaultValue: "UNPAID",
    },

    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        isDecimal: {
          msg: "Total amount must be a valid number",
        },
        min: {
          args: [0],
          msg: "Total amount cannot be negative",
        },
      },
    },
    shop_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "sales_returns",
    timestamps: true,
  },
);

module.exports = SaleReturn;
