const { SubCategory } = require("../../models/indexModel");
const { Category } = require("../../models/indexModel");

exports.SubCategoryService = {
  createSubcategory: async (subCategoryData) => {
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
      status,
    });
    return subcategory;
  },
  updateSubCategory: async (SubCategoryID, updateSubCategoryData) => {
    try {
      const { categoryID, subCategoryName, categoryCode, description, status } =
        updateSubCategoryData;
      const subCategory = await SubCategory.findByPk(SubCategoryID);
      if (!subCategory) throw new Error("SubCategory Not Found");
      if (categoryID) {
        const category = await Category.findByPk(categoryID);
        if (!category) throw new Error("Category Not Found");
      }

      const updatedSubcategory = await subCategory.update({
        categoryID: categoryID ?? subCategory.categoryID,
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
  deletesubCategory: async (SubCategoryID) => {
    try {
      const subCategory = await SubCategory.findByPk(SubCategoryID);
      if (!subCategory) throw new Error("SubCategory Not Found");
      await subCategory.destroy();
      return;
    } catch (error) {
      throw error;
    }
  },
};
