const {
  saleReturnService,
} = require("../../services/SaleReturn/SalesReturn.service");
const { success, error } = require("../../utils/response");
const { getPagination, getPageMetaData } = require("../../utils/Pagination");

exports.createSaleReturn = async (req, res) => {
  try {
    const shop_id = req.user.shop_id;
    const salesReturn = await saleReturnService.createSaleReturn(
      req.body,
      shop_id,
    );
    return success(res, "SaleReturn Create SuccessFully", salesReturn);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.getAllSalesReturn = async (req, res) => {
  try {
    const shop_id = req.user.shop_id;
    const { page, limit, offset } = getPagination(req.query);
    const saleReturn = await saleReturnService.getAllSaleReturns(
      offset,
      limit,
      shop_id,
    );
    return success(
      res,
      `${saleReturn.count} saleReturn Fetch Successfully`,
      saleReturn.data,
      getPageMetaData(page, limit, saleReturn.count),
    );
  } catch (err) {
    return error(res, err.message, 400);
  }
};

exports.getSaleReturnById = async (req, res) => {
  try {
    const shop_id = req.user.shop_id;
    const sale_return_id = req.params.sale_return_id;
    const saleReturn = await saleReturnService.getSalereturnById(
      sale_return_id,
      shop_id,
    );
    if (!saleReturn) {
      return error(res, "SaleReturn Not Found", 404);
    }
    return success(res, "SaleReturn Fetch Successfully", saleReturn);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
