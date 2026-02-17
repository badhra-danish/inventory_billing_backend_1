const { Warehouse } = require("../../models/indexModel");

exports.wareHouseService = {
  //  CREATE
  createWareHouse: async (wareHouseData, shop_id) => {
    try {
      const { warehouseName, code, address, status } = wareHouseData;

      const wareHouse = await Warehouse.create({
        warehouseName,
        code,
        address,
        shop_id,
        status,
      });

      return wareHouse;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  //  READ (Pagination)
  getAllWarehouse: async (limit, offset, shop_id) => {
    try {
      const { rows, count } = await Warehouse.findAndCountAll({
        where: { shop_id },
        limit,
        offset,
        order: [["createdAt", "DESC"]],
      });

      return {
        count,
        data: rows,
      };
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
  getWarehouseById: async (warehouse_id, shop_id) => {
    const warehouse = await Warehouse.findOne({
      where: { warehouse_id, shop_id },
    });

    if (!warehouse) {
      throw new Error("Warehouse not found");
    }

    return warehouse;
  },

  //  UPDATE
  updateWarehouse: async (warehouse_id, wareHouseData, shop_id) => {
    try {
      const warehouse = await Warehouse.findOne({
        where: { warehouse_id: warehouse_id, shop_id },
      });

      if (!warehouse) {
        throw new Error("Warehouse not found");
      }

      await warehouse.update(wareHouseData);

      return warehouse;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },

  //  DELETE
  deleteWarehouse: async (warehouse_id, shop_id) => {
    try {
      const warehouse = await Warehouse.findOne({
        where: { warehouse_id: warehouse_id, shop_id },
      });

      if (!warehouse) {
        throw new Error("Warehouse not found");
      }

      await warehouse.destroy();

      return { message: "Warehouse deleted successfully" };
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};
