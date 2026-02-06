const { DataTypes } = require("sequelize");

const sequelize = require("../../config/database");

const Warehouse = sequelize.define("Warehouse", {
  warehouse_id: {
    type: DataTypes.UUID,
    dialectTypes: DataTypes.UUIDV4,
    primaryKey: true,
  },
  shop_id: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  warehouseName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  code: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  address: {
    type: DataTypes.TEXT,
  },
  status: {
    type: DataTypes.ENUM("ACTIVE" | "INACTIVE"),
    defaultValue: true,
  },
});

module.exports = Warehouse;
