const { where } = require("sequelize");
const { SubCategory } = require("../../models/indexModel");
const { Category } = require("../../models/indexModel");
const { th } = require("zod/locales");

exports.SubCategoryService = {
  createSubcategory: async (subCategoryData, shop_id) => {
    const { category_id, subCategoryName, categoryCode, description, status } =
      subCategoryData;

    const category = await Category.findByPk(category_id);
    if (!category) throw new Error("Category Not Found");

    const exists = await SubCategory.findOne({ where: { subCategoryName } });
    if (exists) throw new Error("Sub_Category_Exits");

    const subcategory = await SubCategory.create({
      category_id,
      subCategoryName,
      categoryCode,
      description,
      shop_id: shop_id,
      status,
    });
    return subcategory;
  },
  updateSubCategory: async (SubCategoryID, updateSubCategoryData, shop_id) => {
    try {
      const { categoryID, subCategoryName, categoryCode, description, status } =
        updateSubCategoryData;
      const subCategory = await SubCategory.findOne({
        where: {
          subCategory_id: SubCategoryID,
          shop_id: shop_id,
        },
      });
      if (!subCategory) throw new Error("SubCategory Not Found");
      if (categoryID) {
        const category = await Category.findByPk(categoryID);
        if (!category) throw new Error("Category Not Found");
      }

      const updatedSubcategory = await subCategory.update({
        category_id: categoryID ?? subCategory.categoryID,
        subCategoryName: subCategoryName ?? subCategory.subCategoryName,
        categoryCode: categoryCode ?? subCategory.categoryCode,
        description: description ?? subCategory.description,
        status: status ?? subCategory.status,
      });
      return updatedSubcategory;
    } catch (error) {
      throw error;
    }
  },
  deletesubCategory: async (SubCategoryID, shop_id) => {
    try {
      const subCategory = await SubCategory.findOne({
        where: {
          subCategory_id: SubCategoryID,
          shop_id: shop_id,
        },
      });
      if (!subCategory) throw new Error("SubCategory Not Found");
      await subCategory.destroy();
      return;
    } catch (error) {
      throw error;
    }
  },
  getSubCategoryByCategory: async (categoryID, shop_id) => {
    try {
      const subCategories = await SubCategory.findAll({
        where: { category_id: categoryID, shop_id },
      });

      if (subCategories.length === 0) {
        throw new Error("SubCategory Not Found");
      }

      return subCategories;
    } catch (error) {
      throw error;
    }
  },
};
