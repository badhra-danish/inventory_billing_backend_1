const { DataTypes } = require("sequelize");
const Sequelize = require("../../config/database");

const Brand = Sequelize.define(
  "Brand",
  {
    brand_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    brandName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
    },
    status: {
      type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
      defaultValue: "ACTIVE",
    },
  },
  {
    tableName: "brands",
    timestamps: true,
    paranoid: true,
  }
);
module.exports = Brand;
