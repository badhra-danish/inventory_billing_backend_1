const { salesService } = require("../../services/Sales/Sales.Service");
const { success, error } = require("../../utils/response");
const { getPagination, getPageMetaData } = require("../../utils/Pagination");
exports.createSale = async (req, res) => {
  try {
    const shop_id = req.user.shop_id;
    const sale = await salesService.createSale(req.body, shop_id);
    return success(res, "Sale Created SuccessFully", sale);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.updateSales = async (req, res) => {
  try {
    const { sale_id } = req.params;
    const shop_id = req.user.shop_id;
    const sale = await salesService.updateSale(sale_id, req.body, shop_id);
    return success(res, "Sale Update SuccessFully", sale);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.getSaleById = async (req, res) => {
  try {
    const { sale_id } = req.params;
    const shop_id = req.user.shop_id;
    const sale = await salesService.getSaleById(sale_id, shop_id);
    return success(res, "Sale fetch SuccessFully", sale);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.getAllSalesInfo = async (req, res) => {
  try {
    const shop_id = req.user.shop_id;
    const { page, limit, offset } = getPagination(req.query);
    const sale = await salesService.getAllSaleInfo(offset, limit, shop_id);
    return success(
      res,
      `${sale.count} sale Fetch Successfully`,
      sale.data,
      getPageMetaData(page, limit, sale.count),
    );
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.getAllInvoiceInfo = async (req, res) => {
  try {
    const shop_id = req.user.shop_id;
    const { page, limit, offset } = getPagination(req.query);
    const invoice = await salesService.getAllInvoiceInfo(
      offset,
      limit,
      shop_id,
    );
    return success(
      res,
      `${invoice.count} Invoice Fetch Successfully`,
      invoice.data,
      getPageMetaData(page, limit, invoice.count),
    );
  } catch (err) {
    return error(res, err.message, 400);
  }
};

exports.createPayment = async (req, res) => {
  try {
    const { sale_id } = req.params;
    const shop_id = req.user.shop_id;
    const payment = await salesService.createPaymentOfSale(
      sale_id,
      req.body,
      shop_id,
    );
    return success(res, "Payment Created SuccessFully", payment);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.deletePayment = async (req, res) => {
  try {
    const { payment_id } = req.params;
    const shop_id = req.user.shop_id;

    const payment = await salesService.deletePaymentOfSale(payment_id, shop_id);
    return success(res, "Payment Deleted SuccessFully", payment);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.updatePayment = async (req, res) => {
  try {
    const { payment_id } = req.params;
    const shop_id = req.user.shop_id;

    const updatedpayment = await salesService.updatePaymentOfSale(
      payment_id,
      req.body,
      shop_id,
    );
    return success(res, "Payment UpdatedSS SuccessFully", updatedpayment);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.getAllPaymentSales = async (req, res) => {
  try {
    const { sale_id } = req.params;
    const shop_id = req.user.shop_id;
    const payment = await salesService.getAllPaymentBySale(sale_id, shop_id);
    return success(res, "Payment Fetch SuccessFully", payment);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
