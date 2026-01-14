const { Brand } = require("../../models/indexModel");

exports.brandService = {
  createBrand: async (brandData) => {
    try {
      const { brandName, status } = brandData;
      if (!brandName || !status) {
        throw new Error("All Feild Are Required");
      }
      const exists = await Brand.findOne({ where: { brandName } });
      if (exists) throw new Error("Brand_Exits");

      const brand = await Brand.create({
        brandName: brandName,
        status: status,
      });
      return brand;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  updateBrand: async (brandID, updateData) => {
    try {
      const { brandName, status } = updateData;
      const brand = await Brand.findByPk(brandID);
      if (!brand) throw new Error("Brand Not Found");
      const updatedBrand = await brand.update({
        brandName: brandName ?? brand.brandName,
        status: status ?? brand.status,
      });
      return updatedBrand;
    } catch (error) {
      throw error;
    }
  },
  deleteBrand: async (brandID) => {
    try {
      const brand = await Brand.findByPk(brandID);
      if (!brand) throw new Error("Brand Not Found");
      await brand.destroy();
      return;
    } catch (error) {
      throw error;
    }
  },
};
