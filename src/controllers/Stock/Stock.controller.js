const { stockService } = require("../../services/Stock/Stock.service");
const { success, error } = require("../../utils/response");
const { getPagination, getPageMetaData } = require("../../utils/Pagination");

exports.createStock = async (req, res) => {
  try {
    const shop_id = req.user.shop_id;
    const stock = await stockService.createStock(req.body, shop_id);
    return success(res, "Stock Created SuccessFully", stock);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.updateStockQuantity = async (req, res) => {
  try {
    const { stock_id } = req.params;
    const updateStock = await stockService.updateStockQuantity(
      stock_id,
      req.body,
    );
    return success(res, "Quantity Updated Successfully", updateStock);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.getAllStockPage = async (req, res) => {
  try {
    const shop_id = req.user.shop_id;
    const { page, limit, offset } = getPagination(req.query);
    const stockVarint = await stockService.getAllStockVariant(
      limit,
      offset,
      shop_id,
    );
    return success(
      res,
      `${stockVarint.count} Stock Fetch Successfully`,
      stockVarint.data,
      getPageMetaData(page, limit, stockVarint.count),
    );
  } catch (err) {
    return error(res, err.message);
  }
};
exports.getAllVariantInStock = async (req, res) => {
  try {
    const variant = await stockService.getVariantInStock(req.query);
    return success(res, "Variant Are Fetch", variant);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.deleteStockVariant = async (req, res) => {
  try {
    const { stock_id } = req.params;
    await stockService.deleteStockVariant(stock_id);
    return success(res, "Stock Delete Successfully");
  } catch (err) {
    return error(res, err.message, 400);
  }
};
