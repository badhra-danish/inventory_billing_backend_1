const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const PurchaseOrder = sequelize.define(
  "PurchaseOrder",
  {
    purchase_order_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    po_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: {
          msg: "PO number is required",
        },
      },
    },

    supplier_id: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Supplier is required",
        },
        isUUID: 4,
      },
    },

    warehouse_id: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "Warehouse is required",
        },
        isUUID: 4,
      },
    },

    po_date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        notEmpty: {
          msg: "PO date is required",
        },
        isDate: true,
      },
    },

    order_tax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },

    discount_amt: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },

    shipping: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },

    sub_total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },

    grand_total: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },

    status: {
      type: DataTypes.ENUM(
        "PENDING",
        "APPROVED",
        "PARTIALLY_RECEIVED",
        "RECEIVED",
        "CANCELLED",
      ),
      allowNull: false,
      defaultValue: "PENDING",
    },

    shop_id: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        isUUID: 4,
      },
    },
  },
  {
    tableName: "purchase_orders",
    timestamps: true,
    indexes: [
      {
        fields: ["po_number"],
      },
      {
        fields: ["supplier_id"],
      },
      {
        fields: ["shop_id"],
      },
    ],
  },
);

module.exports = PurchaseOrder;
