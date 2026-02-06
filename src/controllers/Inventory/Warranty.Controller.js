const { Warranty } = require("../../models/indexModel");
const {
  warrantyService,
} = require("../../services/Inventory/Warranty.Service");
const { success, error } = require("../../utils/response");
const { getPagination, getPageMetaData } = require("../../utils/Pagination");

exports.createWarranty = async (req, res) => {
  try {
    const shop_id = req.user.shop_id;
    const warranty = await warrantyService.createWarranty(req.body, shop_id);
    return success(res, "Warranty Created Sucessfully", warranty);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

exports.updateWarranty = async (req, res) => {
  try {
    const { warrantyID } = req.params;
    const shop_id = req.user.shop_id;
    const updatedWarranty = await warrantyService.updateWarranty(
      warrantyID,
      req.body,
      shop_id,
    );
    return success(res, "Warranty Updated Successully", updatedWarranty);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

exports.deleteWarranty = async (req, res) => {
  try {
    const shop_id = req.user.shop_id;
    const { warrantyID } = req.params;
    await warrantyService.deleteWarranty(warrantyID, shop_id);
    return success(res, "Warranty Deleted Successully");
  } catch (err) {
    return error(res, err.message, 400);
  }
};

exports.getWarrantyPage = async (req, res) => {
  try {
    const shop_id = req.user.shop_id;
    const { page, limit, offset } = getPagination(req.query);

    const warrantyData = await Warranty.findAndCountAll({
      where: { shop_id },
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return success(
      res,
      `${limit} Warranty Fetched`,
      warrantyData.rows,
      getPageMetaData(page, limit, warrantyData.count),
    );
  } catch (err) {
    return error(res, err.message);
  }
};
