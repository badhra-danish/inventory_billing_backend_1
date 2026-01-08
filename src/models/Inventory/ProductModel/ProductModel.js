const { DataTypes } = require("sequelize");
const sequelize = require("../../../config/database");

const Product = sequelize.define(
  "Product",
  {
    product_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    productName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
    },
    slugName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    selling_type: {
      type: DataTypes.ENUM("RETAIL", "WHOLESALE", "BOTH"),
      defaultValue: "RETAIL",
      allowNull: false,
    },
    product_type: {
      type: DataTypes.ENUM("SINGLE", "VARIABLE"),
      allowNull: false,
    },
    brand_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "brand_id",
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "category_id",
    },
    subcategory_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "subcategory_id",
    },
    unit_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "unit_id",
    },
    warranty_id: {
      type: DataTypes.UUID,
      allowNull: false,
      field: "warranty_id",
    },
    manufacturer: {
      type: DataTypes.STRING(100),
    },
    manufacturer_date: {
      type: DataTypes.DATE,
    },
    expiry_date: {
      type: DataTypes.DATE,
    },
  },

  {
    tableName: "products",
    timestamps: true,
    paranoid: true,
  }
);

module.exports = Product;
