const DataTypes = require("sequelize");
const sequelize = require("../../config/database");

const Shop = sequelize.define("Shop", {
  shop_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  shop_name: { type: DataTypes.STRING },
  address: { type: DataTypes.STRING },
  phone: { type: DataTypes.STRING },
});

module.exports = Shop;
