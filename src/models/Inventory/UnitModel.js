const { DataTypes } = require("sequelize");
const Sequelize = require("../../config/database");

const Unit = Sequelize.define(
  "Unit",
  {
    unit_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    unitName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
    },
    unitShortName: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [1, 10],
      },
    },
    shop_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "ACTIVE",
    },
  },
  {
    tableName: "units",
    timestamps: true,
  },
);
module.exports = Unit;
