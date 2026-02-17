const { success, error } = require("../../utils/response");
const { getPagination, getPageMetaData } = require("../../utils/Pagination");
const { wareHouseService } = require("../../services/People/WareHouse.Service");

// CREATE
exports.createWarehouse = async (req, res) => {
  try {
    const shop_id = req.user.shop_id;

    const wareHouse = await wareHouseService.createWareHouse(req.body, shop_id);

    return success(res, "Warehouse Created Successfully", wareHouse);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

// GET ALL (Pagination)
exports.getAllWarehouse = async (req, res) => {
  try {
    const shop_id = req.user.shop_id;

    const { page, limit, offset } = getPagination(req.query);

    const warehouses = await wareHouseService.getAllWarehouse(
      limit,
      offset,
      shop_id,
    );

    return success(
      res,
      `${warehouses.data.length} Warehouses Fetched`,
      warehouses.data,
      getPageMetaData(page, limit, warehouses.count),
    );
  } catch (err) {
    return error(res, err.message, 400);
  }
};

// GET SINGLE (very useful)
exports.getWarehouseById = async (req, res) => {
  try {
    const shop_id = req.user.shop_id;
    const { warehouse_id } = req.params;

    const warehouse = await wareHouseService.getWarehouseById(
      warehouse_id,
      shop_id,
    );

    return success(res, "Warehouse fetched successfully", warehouse);
  } catch (err) {
    return error(res, err.message, 404);
  }
};

// UPDATE
exports.updateWarehouse = async (req, res) => {
  try {
    const shop_id = req.user.shop_id;
    const { warehouse_id } = req.params;

    const updatedWarehouse = await wareHouseService.updateWarehouse(
      warehouse_id,
      req.body,
      shop_id,
    );

    return success(res, "Warehouse updated successfully", updatedWarehouse);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

// DELETE
exports.deleteWarehouse = async (req, res) => {
  try {
    const shop_id = req.user.shop_id;
    const { warehouse_id } = req.params;

    const result = await wareHouseService.deleteWarehouse(
      warehouse_id,
      shop_id,
    );

    return success(res, result.message);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
