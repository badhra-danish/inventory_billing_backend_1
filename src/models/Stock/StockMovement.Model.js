const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");
const { fa } = require("zod/locales");

const StockMovement = sequelize.define(
  "StockMovement",
  {
    stock_movement_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    stock_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "stock_id",
    },

    type: {
      type: DataTypes.ENUM("IN", "OUT"),
      allowNull: false,
    },

    reason: {
      type: DataTypes.ENUM(
        "PURCHASE",
        "SALE",
        "SALE_UPDATE",
        "PURCHASE_UPDATE",
        "SALE_WAREHOUSE_CHANGE",
        "PURCHASE_WAREHOUSE_CHANGE",
        "SALE_DELETE",
        "PURCHASE_DELETE",
        "SALE_RETURN",
        "PURCHASE_RETURN",
        "SALE_RETURN_UPDATE",
        "SALE_RETURN_UPDATE_REVERSE",
        "RETURN",
        "INITIAL",
        "DAMAGE",
        "ADJUSTMENT",
        "TRANSFER",
      ),
    },

    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    before_qty: DataTypes.INTEGER,
    after_qty: DataTypes.INTEGER,

    reference_id: DataTypes.STRING,

    note: DataTypes.STRING,

    shop_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "stockmovements",
    timestamps: true,
  },
);

module.exports = StockMovement;
