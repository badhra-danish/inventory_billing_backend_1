const { Category, SubCategory } = require("../../models/indexModel");
const {
  SubCategoryService,
} = require("../../services/Inventory/SubCategory.Service");
const { getPagination, getPageMetaData } = require("../../utils/Pagination");
const { success, error } = require("../../utils/response");

exports.createSubcategory = async (req, res) => {
  try {
    const subcategoryData = await SubCategoryService.createSubcategory(
      req.body
    );
    return success(res, "SubCategory Created Successfully", subcategoryData);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

exports.updateSubcategory = async (req, res) => {
  try {
    const { subCategoryID } = req.params;
    const updateSubCategory = await SubCategoryService.updateSubCategory(
      subCategoryID,
      req.body
    );

    return success(res, "subCategory Updated Successfully", updateSubCategory);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.deleteSubCategory = async (req, res) => {
  try {
    const { subCategoryID } = req.params;
    await SubCategoryService.deletesubCategory(subCategoryID);
    return success(res, "SubCategory Deleted Successfully");
  } catch (err) {
    error(res, err.message);
  }
};
exports.getSubCategoryPage = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);

    const SubCategoryData = await SubCategory.findAndCountAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return success(
      res,
      `${limit} SubCategory Fetched`,
      SubCategoryData.rows,
      getPageMetaData(page, limit, SubCategoryData.count)
    );
  } catch (err) {
    return error(res, err.message);
  }
};
