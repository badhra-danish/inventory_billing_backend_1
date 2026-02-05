const { DataTypes } = require("sequelize");
const Sequelize = require("../../config/database");

const Attribute_values = Sequelize.define(
  "Attribute_values",
  {
    attribute_value_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    value: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    attribute_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "attribute_id",
    },
    shop_id: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "attributeValues",
    timestamps: true,
  },
);
module.exports = Attribute_values;
