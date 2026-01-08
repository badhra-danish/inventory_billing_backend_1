const { Brand } = require("../../models/indexModel");
const { brandService } = require("../../services/Inventory/BrandService");
const { success, error } = require("../../utils/response");
const { getPagination, getPageMetaData } = require("../../utils/Pagination");

exports.createBrands = async (req, res) => {
  try {
    const brand = await brandService.createBrand(req.body);

    return success(res, "Brand Create Successfully", brand);
  } catch (err) {
    return error(res, err.message || "Something Went Wrong", 400);
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const { brandID } = req.params;
    const updatedBrand = await brandService.updateBrand(brandID, req.body);
    return success(res, "Brand Updated Successfully", updatedBrand);
  } catch (err) {
    return error(res.err.message || "something Went wrong", 400);
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const { brandID } = req.params;
    await brandService.deleteBrand(brandID);
    return success(res, "Brand Delete Successfully");
  } catch (err) {
    return error(res, err.message || "something Went wrong", 400);
  }
};
exports.getBrandPage = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);

    const BrandData = await Brand.findAndCountAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return success(
      res,
      `${limit} Brand Fetched`,
      BrandData.rows,
      getPageMetaData(page, limit, BrandData.count)
    );
  } catch (err) {
    return error(res, err.message);
  }
};
