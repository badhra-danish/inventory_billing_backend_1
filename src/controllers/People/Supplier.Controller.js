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
    console.error(err);
    return error(res, err.message, 400);
  }
};
exports.updateSupplier = async (req, res) => {
  try {
    const { supplierID } = req.params;
    const shop_id = req.user.shop_id;

    const updatedSupplier = await supplierService.updateSupplier(
      supplierID,
      req.body,
      shop_id,
    );
    return success(res, "Supplier Updated Successfully", updatedSupplier);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.deleteSupplier = async (req, res) => {
  try {
    const { supplierID } = req.params;
    const shop_id = req.user.shop_id;

    await supplierService.deleteSupplier(supplierID, shop_id);
    return success(res, "Supplier Deleted Successfully");
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.getSupplierPage = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const shop_id = req.user.shop_id;
    const supplierData = await Supplier.findAndCountAll({
      limit,
      offset,
      where: { shop_id },
      order: [["createdAt", "DESC"]],
    });

    const formattedRows = supplierData.rows.map((supplier) => {
      const data = supplier.toJSON();

      return {
        ...data,
        city: data.location?.city || null,
        state: data.location?.state || null,
        postalCode: data.location?.postalCode || null,
        location: undefined,
      };
    });

    return success(
      res,
      `${limit} Supplier fetched`,
      formattedRows,
      getPageMetaData(page, limit, supplierData.count),
    );
  } catch (err) {
    return error(res, err.message);
  }
};
