const { success, error } = require("../../utils/response");
const { getPagination, getPageMetaData } = require("../../utils/Pagination");
const { purchaseService } = require("../../services/Purchase/Purchase.Service");

exports.createPurchase = async (req, res) => {
  try {
    const shop_id = req.user.shop_id;
    const purchase = await purchaseService.createPurchase(req.body, shop_id);
    return success(res, "Purchase Created Successfully", purchase);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.updatePurchase = async (req, res) => {
  try {
    const shop_id = req.user.shop_id;
    const { purchase_id } = req.params;

    const updatePurchase = await purchaseService.updatePurchase(
      purchase_id,
      req.body,
      shop_id,
    );
    return success(res, "Purchase Updated Successfully", updatePurchase);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.getAllPurchaseInfo = async (req, res) => {
  try {
    const shop_id = req.user.shop_id;
    const { page, limit, offset } = getPagination(req.query);
    const purchase = await purchaseService.getAllPurchaseInfo(
      offset,
      limit,
      shop_id,
    );
    return success(
      res,
      `${purchase.count} Purchase Fetch Successfully`,
      purchase.data,
      getPageMetaData(page, limit, purchase.count),
    );
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.getPurchaseById = async (req, res) => {
  try {
    const shop_id = req.user.shop_id;
    const { purchase_id } = req.params;

    const purchase = await purchaseService.getPurchaseById(
      purchase_id,
      shop_id,
    );

    return success(res, "Purchse Get Successfully", purchase);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.createPaymentofPurchase = async (req, res) => {
  try {
    const { purchase_id } = req.params;
    const shop_id = req.user.shop_id;
    const payment = await purchaseService.createPaymentOfPurchase(
      purchase_id,
      req.body,
      shop_id,
    );
    return success(res, "Payment Created SuccessFully", payment);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
