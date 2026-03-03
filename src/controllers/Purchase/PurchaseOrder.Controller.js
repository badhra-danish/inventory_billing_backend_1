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
exports.updatePurchaseOrder = async (req, res) => {
  try {
    const shop_id = req.user.shop_id;
    const { purcahse_order_id } = req.params;

    const updatePurchaseOrder = await purchaseOrderService.updatePurchaseOrder(
      purcahse_order_id,
      req.body,
      shop_id,
    );
    return success(
      res,
      "Purchase Order Update Successfully",
      updatePurchaseOrder,
    );
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.getPurchaseOrder = async (req, res) => {
  try {
    const shop_id = req.user.shop_id;
    const { purchase_order_id } = req.params;

    console.log("PARAMS:", req.params);
    console.log("ID:", req.params.purchase_order_id);
    console.log("TYPE:", typeof req.params.purchase_order_id);

    const purchaseOrder = await purchaseOrderService.getPurchaseOrderByID(
      shop_id,
      purchase_order_id,
    );
    return success(res, "Purchase Order get Successfully", purchaseOrder);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.getAllPurchaseOrderNo = async (req, res) => {
  try {
    const shop_id = req.user.shop_id;
    const purchaseOrderNo =
      await purchaseOrderService.getPurchaseOrderNO(shop_id);
    return success(res, "Fetch All Purchase Order No", purchaseOrderNo);
  } catch (error) {
    return error(res, err.message, 400);
  }
};
