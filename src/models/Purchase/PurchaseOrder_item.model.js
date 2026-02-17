const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const PurchaseOrderItem = sequelize.define(
  "PurchaseOrderItem",
  {
    purchase_order_item_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false,
    },

    purchase_order_id: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        isUUID: 4,
        notEmpty: {
          msg: "Purchase Order ID is required",
        },
      },
    },

    product_variant_id: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        isUUID: 4,
        notEmpty: {
          msg: "Product Variant is required",
        },
      },
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: {
          args: [1],
          msg: "Quantity must be at least 1",
        },
        isInt: {
          msg: "Quantity must be an integer",
        },
      },
    },

    received_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        isInt: true,
      },
    },

    unit_price: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },

    tax: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },

    tax_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },

    discount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },

    total_amount: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
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
    tableName: "purchase_order_items",
    timestamps: true,
    indexes: [
      {
        fields: ["purchase_order_id"],
      },
      {
        fields: ["product_variant_id"],
      },
    ],
  },
);

module.exports = PurchaseOrderItem;
