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
