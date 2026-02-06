const { Category } = require("../../models/indexModel");

exports.categoryService = {
  //create Service
  createCategory: async (data, shop_id) => {
    try {
      const { name, slug, status } = data;

      const exists = await Category.findOne({ where: { name, shop_id } });
      if (exists) throw new Error("Category_Exits");

      return await Category.create({
        name: name,
        slug: slug,
        status: status,
        shop_id: shop_id,
      });
    } catch (error) {
      throw error;
    }
  },

  updateCategory: async (id, updatedData, shop_id) => {
    try {
      const category = await Category.findOne({
        where: {
          category_id: id,
          shop_id: shop_id,
        },
      });
      if (!category) throw new Error("Category Not Found");
      await category.update(updatedData);
      return category;
    } catch (error) {
      throw error;
    }
  },

  deleteCategory: async (id, shop_id) => {
    try {
      const category = await Category.findOne({
        where: {
          category_id: id,
          shop_id: shop_id,
        },
      });
      if (!category) throw new Error("Category Not Found");
      await category.destroy();
      return;
    } catch (error) {
      throw error;
    }
  },
};
