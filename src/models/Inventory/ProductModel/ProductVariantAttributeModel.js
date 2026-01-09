const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const Product_variant_Attribute = sequelize.define(
  "Product_variant_Attribute",
  {
    product_varaint_attribute_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    attribute_value_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "attribute_value_id",
    },
    product_variant_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "product_variant_id",
    },
  },
  {
    tableName: "product_variant_attributes",
    timestamps: true,
    paranoid: true,
  }
);
module.exports = Product_variant_Attribute;
