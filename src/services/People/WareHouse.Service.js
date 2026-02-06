const { Warehouse } = require("../../models/indexModel");

exports.wareHouseService = {
  createWareHouse: async (wareHouseData) => {
    try {
      const { warehouseName, code, address, status } = wareHouseData;

      const wareHouse = await Warehouse.create({
        warehouseName: warehouseName,
        code: code,
        address: address,
        status: status,
      });

      return wareHouse;
    } catch (error) {}
  },
};
