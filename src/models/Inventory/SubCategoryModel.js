const { DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

const SubCategory = sequelize.define(
  "subcategory",
  {
    subCategory_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "categories",
        key: "category_id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    },
    subCategoryName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
    },
    categoryCode: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [2, 50],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      set(value) {
        if (value) {
          this.setDataValue("description", value.trim());
        }
      },
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "ACTIVE",
    },
  },
  {
    tableName: "subcategories",
    timestamps: true,
  }
);
module.exports = SubCategory;
