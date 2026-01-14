const { DataTypes } = require("sequelize");
const Sequelize = require("../../config/database");

const Attribute = Sequelize.define(
  "Attribute",
  {
    attribute_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    attributeName: {
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
    tableName: "attributes",
    timestamps: true,
  }
);

module.exports = Attribute;
