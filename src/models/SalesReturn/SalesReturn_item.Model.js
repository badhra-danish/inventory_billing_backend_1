const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const { SalesReturn, SaleItem } = require("../indexModel");

const SalesReturnItem = sequelize.define(
  "SalesReturnItem",
  {
    sale_return_item_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    sale_return_id: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Sale return ID is required",
        },
      },
    },

    sale_item_id: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Sale item ID is required",
        },
      },
    },

    product_variant_id: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Product variant is required",
        },
      },
    },
    warehouse_id: {
      type: DataTypes.UUID,
      allowNull: false,
      validate: {
        notNull: {
          msg: "Product variant is required",
        },
      },
    },
    return_quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        isInt: {
          msg: "Quantity must be an integer",
        },
        min: {
          args: [1],
          msg: "Quantity must be at least 1",
        },
      },
    },

    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: {
          msg: "Price must be a valid decimal",
        },
      },
    },

    discount: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    sub_total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        isDecimal: {
          msg: "Subtotal must be a valid number",
        },
      },
    },
  },
  {
    tableName: "sales_return_items",
    timestamps: true,
  },
);

module.exports = SalesReturnItem;
