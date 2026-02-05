const { Supplier } = require("../../models/indexModel");
const { supplierService } = require("../../services/People/Suppler.Service");
const { success, error } = require("../../utils/response");
const { getPagination, getPageMetaData } = require("../../utils/Pagination");

exports.createSupplier = async (req, res) => {
  try {
    const shop_id = req.user.shop_id;
    const supplier = await supplierService.createSupplier(req.body, shop_id);
    return success(res, "Supplier created Successfully", supplier);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.updateSupplier = async (req, res) => {
  try {
    const { supplierID } = req.params;
    const updatedSupplier = await supplierService.updateSupplier(
      supplierID,
      req.body,
    );
    return success(res, "Supplier Updated Successfully", updatedSupplier);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.deleteSupplier = async (req, res) => {
  try {
    const { supplierID } = req.params;
    await supplierService.deleteSupplier(supplierID);
    return success(res, "Supplier Deleted Successfully");
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.getSupplierPage = async (req, res) => {
  try {
    const shop_id = req.user.shop_id;
    const { page, limit, offset } = getPagination(req.query);

    const supplierData = await Supplier.findAndCountAll({
      limit,
      offset,
      where: { shop_id },
      order: [["createdAt", "DESC"]],
    });

    return success(
      res,
      `${limit} Warranty Fetched`,
      supplierData.rows,
      getPageMetaData(page, limit, supplierData.count),
    );
  } catch (err) {
    return error(res, err.message);
  }
};
