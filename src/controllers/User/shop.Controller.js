const { shopService } = require("../../services/Users/shop.Service");
const { success, error } = require("../../utils/response");
const { getPagination, getPageMetaData } = require("../../utils/Pagination");
const { da } = require("zod/locales");
const { emoji } = require("zod");

exports.createShopAdminWithShop = async (req, res) => {
  try {
    const ShopWithAdmin = await shopService.createShopAdminWithShop(req.body);
    if (ShopWithAdmin) {
      return success(res, "Shop + Admin Created Successfully", ShopWithAdmin);
    }
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.updateShopAdminWithShop = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return error(res, "Shop ID is required", 400);
    }

    const updatedData = await shopService.updateShopAdminWithShop(id, req.body);

    if (updatedData) {
      return success(res, "Shop + Admin Updated Successfully", updatedData);
    }
  } catch (err) {
    return error(res, err.message, 400);
  }
};

exports.loginShopAdmin = async (req, res) => {
  try {
    const shopAdmin = await shopService.loginShopAdmin(req.body);
    if (shopAdmin) {
      return success(res, "ShopAdmin Log SuccessFully", shopAdmin);
    }
  } catch (err) {
    return error(res, err.message, 400);
  }
};

exports.getAllShopAdmin = async (req, res) => {
  try {
    const data = await shopService.getAllShopAdmins();
    return success(res, "Shop Admin Fetch Successfully", data);
  } catch (err) {
    console.error(err);
    return error(res, err.message, 400);
  }
};

exports.getDashboardStats = async (req, res) => {
  try {
    const stats = await shopService.getSuperAdminDashboardStats();
    return success(res, "Dashboard stats fetched", stats);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.getShopDashboardStats = async (req, res) => {
  try {
    const { id } = req.params;

    const stats = await shopService.getShopDashboardStats(id);

    return success(res, "Dashboard stats fetched", stats);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.getSalesPurchaseAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await shopService.getSalesPurchaseAnalytics(id);

    return success(res, "Date  fetched", data);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
