const DataTypes = require("sequelize");
const sequelize = require("../../config/database");

const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    role: {
      type: DataTypes.ENUM("SUPER_ADMIN", "SHOP_ADMIN", "MANAGER", "CASHIER"),
      allowNull: false,
    },

    shop_id: {
      type: DataTypes.UUID,
      allowNull: true,
      field: "shop_id",
    },
  },
  {
    tableName: "users",
    timestamps: true,
  },
);

module.exports = User;
