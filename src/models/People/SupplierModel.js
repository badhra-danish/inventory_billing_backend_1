const { DataTypes } = require("sequelize");

const sequelize = require("../../config/database");

const Supplier = sequelize.define(
  "Supplier",
  {
    supplierID: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [2, 100],
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "Email is required" },
        isEmail: { msg: "Please enter a valid email address" },
        len: {
          args: [5, 255],
          msg: "Email must be between 5–255 characters",
        },
      },
    },
    phone: {
      type: DataTypes.STRING(15),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: { msg: "Phone number is required" },
        is: {
          args: /^[0-9]{7,15}$/,
          msg: "Phone number must contain only digits (7–15 digits)",
        },
      },
      set(value) {
        if (value) {
          this.setDataValue("phone", value.trim());
        }
      },
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Address is required" },
        len: {
          args: [5, 500],
          msg: "Address must be between 5–500 characters",
        },
      },
      set(value) {
        if (value) {
          this.setDataValue("address", value.trim());
        }
      },
    },
    location: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        notEmpty: { msg: "Location is required" },
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
    tableName: "suppliers",
    timestamps: true,
  },
);

module.exports = Supplier;
