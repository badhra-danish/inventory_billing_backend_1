const { Category } = require("../../models/indexModel");
const {
  categoryService,
} = require("../../services/Inventory/Category.Service");
const { getPagination, getPageMetaData } = require("../../utils/Pagination");
const { success, error } = require("../../utils/response");

exports.createCategory = async (req, res) => {
  try {
    const shop_id = req.user.shop_id;
    const category = await categoryService.createCategory(req.body, shop_id);
    return success(res, "Category Created", category, 201);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.updateCategory = async (req, res) => {
  try {
    const { category_id } = req.params;
    console.log("id --", category_id);

    const updatedCategory = await categoryService.updateCategory(
      category_id,
      req.body,
    );
    return success(res, "Category Updated", updatedCategory, 200);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.deleteCategory = async (req, res) => {
  try {
    const { category_id } = req.params;
    await categoryService.deleteCategory(category_id);
    return success(res, "Category Deleted");
  } catch (err) {
    return error(res, err.message);
  }
};
exports.getCategoryPage = async (req, res) => {
  try {
    const shop_id = req.user.shop_id;
    const { page, limit, offset } = getPagination(req.query);

    const category = await Category.findAndCountAll({
      limit,
      offset,
      where: { shop_id },
      order: [["createdAt", "DESC"]],
    });

    return success(
      res,
      `${limit} Category Fetched`,
      category.rows,
      getPageMetaData(page, limit, category.count),
    );
  } catch (err) {
    return error(res, err.message);
  }
};
