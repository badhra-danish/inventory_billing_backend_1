const sequelize = require("../../config/database");
const { Category, SubCategory } = require("../../models/indexModel");
const {
  SubCategoryService,
} = require("../../services/Inventory/SubCategory.Service");
const { getPagination, getPageMetaData } = require("../../utils/Pagination");
const { success, error } = require("../../utils/response");

exports.createSubcategory = async (req, res) => {
  try {
    const shop_id = req.user.shop_id;
    const subcategoryData = await SubCategoryService.createSubcategory(
      req.body,
      shop_id,
    );
    return success(res, "SubCategory Created Successfully", subcategoryData);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

exports.updateSubcategory = async (req, res) => {
  try {
    const { subCategoryID } = req.params;
    const shop_id = req.user.shop_id;
    const updateSubCategory = await SubCategoryService.updateSubCategory(
      subCategoryID,
      req.body,
      shop_id,
    );

    return success(res, "subCategory Updated Successfully", updateSubCategory);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

exports.deleteSubCategory = async (req, res) => {
  try {
    const { subCategoryID } = req.params;
    const shop_id = req.user.shop_id;
    await SubCategoryService.deletesubCategory(subCategoryID, shop_id);
    return success(res, "SubCategory Deleted Successfully");
  } catch (err) {
    error(res, err.message);
  }
};

exports.getSubCategoryPage = async (req, res) => {
  try {
    const shop_id = req.user.shop_id;
    const { page, limit, offset } = getPagination(req.query);

    const SubCategoryData = await SubCategory.findAndCountAll({
      limit,
      offset,
      distinct: true,
      where: { shop_id },
      order: [["createdAt", "DESC"]],
      attributes: {
        include: [[sequelize.col("category.name"), "categoryName"]],
      },
      include: [
        {
          model: Category,
          as: "category",
          attributes: [],
        },
      ],
    });

    return success(
      res,
      `${limit} SubCategory Fetched`,
      SubCategoryData.rows,
      getPageMetaData(page, limit, SubCategoryData.count),
    );
  } catch (err) {
    return error(res, err.message);
  }
};
exports.getSubcategoryByCategory = async (req, res) => {
  try {
    const { category_id } = req.params;
    const shop_id = req.user.shop_id;
    const subCategory = await SubCategoryService.getSubCategoryByCategory(
      category_id,
      shop_id,
    );
    return success(res, "SubCategory Fetch Successfully", subCategory);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
