const { Category } = require("../../models/indexModel");

exports.categoryService = {
  //create Service
  createCategory: async (data, shop_id) => {
    try {
      const { name, slug, status } = data;
      console.log(name);

      const exists = await Category.findOne({ where: { name } });
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
  updateCategory: async (id, updatedData) => {
    try {
      const category = await Category.findByPk(id);
      if (!category) throw new Error("Category Not Found");
      await category.update(updatedData);
      return category;
    } catch (error) {
      throw error;
    }
  },
  deleteCategory: async (id) => {
    try {
      const category = await Category.findByPk(id);
      if (!category) throw new Error("Category Not Found");
      await category.destroy();
      return;
    } catch (error) {
      throw error;
    }
  },
};
