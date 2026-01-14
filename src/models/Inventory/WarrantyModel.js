const { DataTypes } = require("sequelize");
const Sequelize = require("../../config/database");

const Warranty = Sequelize.define(
  "Warranty",
  {
    warranty_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    warrantyName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
    },
    duration: {
      type: DataTypes.INTEGER(10),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [1, 10],
      },
    },

    period: {
      type: DataTypes.ENUM("MONTH", "YEAR"),
      allowNull: false,
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
    tableName: "warranties",
    timestamps: true,
  }
);

module.exports = Warranty;
