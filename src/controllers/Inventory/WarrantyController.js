const { Warranty } = require("../../models/indexModel");
const { warrantyService } = require("../../services/Inventory/WarrantyService");
const { success, error } = require("../../utils/response");
const { getPagination, getPageMetaData } = require("../../utils/Pagination");

exports.createWarranty = async (req, res) => {
  try {
    const warranty = await warrantyService.createWarranty(req.body);
    return success(res, "Warranty Created Sucessfully", warranty);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

exports.updateWarranty = async (req, res) => {
  try {
    const { warrantyID } = req.params;
    const updatedWarranty = await warrantyService.updateWarranty(
      warrantyID,
      req.body
    );
    return success(res, "Warranty Updated Successully", updatedWarranty);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

exports.deleteWarranty = async (req, res) => {
  try {
    const { warrantyID } = req.params;
    await warrantyService.deleteWarranty(warrantyID);
    return success(res, "Warranty Deleted Successully");
  } catch (err) {
    return error(res, err.message, 400);
  }
};

exports.getWarrantyPage = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);

    const warrantyData = await Warranty.findAndCountAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return success(
      res,
      `${limit} Warranty Fetched`,
      warrantyData.rows,
      getPageMetaData(page, limit, warrantyData.count)
    );
  } catch (err) {
    return error(res, err.message);
  }
};
