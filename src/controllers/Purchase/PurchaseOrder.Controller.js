const { success, error } = require("../../utils/response");
const { getPagination, getPageMetaData } = require("../../utils/Pagination");
const {
  purchaseOrderService,
} = require("../../services/Purchase/PurchaseOrder.service");

exports.createPurchaseOrder = async (req, res) => {
  try {
    const shop_id = req.user.shop_id;
    const purchaseOrder = await purchaseOrderService.createPurchaseOrder(
      req.body,
      shop_id,
    );
    return success(res, "Purchase Order Created Successfully", purchaseOrder);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.getAllPurchaseOrder = async (req, res) => {
  try {
    const shop_id = req.user.shop_id;
    const { page, limit, offset } = getPagination(req.query);

    const purchaseOrders = await purchaseOrderService.getAllPurchaseOrder(
      offset,
      limit,
      shop_id,
    );
    return success(
      res,
      `${purchaseOrders.count} Purchase Orders Fetch Successfully`,
      purchaseOrders.data,
      getPageMetaData(page, limit, purchaseOrders.count),
    );
  } catch (err) {
    return error(res, err.message, 400);
  }
};
