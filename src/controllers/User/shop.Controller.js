const { shopService } = require("../../services/Users/shop.Service");
const { success, error } = require("../../utils/response");
const { getPagination, getPageMetaData } = require("../../utils/Pagination");
const { da } = require("zod/locales");

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
