const { NUMBER } = require("sequelize");
const { Warranty } = require("../../models/indexModel");

exports.warrantyService = {
  createWarranty: async (warrantyData, shop_id) => {
    try {
      const { warrantyName, duration, period, description, status } =
        warrantyData;
      console.log({ warrantyName, duration, period, description, status });

      if (!warrantyName?.trim()) throw new Error("Warranty name required");
      if (!duration) throw new Error("Duration required");
      if (!period) throw new Error("Period required");
      if (!status) throw new Error("Status required");

      if (!["MONTH", "YEAR"].includes(period)) {
        throw new Error("Period must be MONTH or YEAR");
      }

      return await Warranty.create({
        warrantyName: warrantyName.trim(),
        duration,
        period,
        description: description?.trim() ?? null,
        shop_id: shop_id,
        status,
      });
    } catch (error) {
      console.log(error);
      throw error;
    }
  },

  updateWarranty: async (warrantyID, updateData, shop_id) => {
    try {
      const { warrantyName, duration, period, description, status } =
        updateData;

      const warranty = await Warranty.findOne({
        where: {
          warranty_id: warrantyID,
          shop_id: shop_id,
        },
      });
      if (!warranty) throw new Error("Warranty Not Found");

      if (!warrantyName?.trim()) throw new Error("Warranty name required");
      if (!duration) throw new Error("Duration required");
      if (!period) throw new Error("Period required");
      if (!status) throw new Error("Status required");

      if (!["MONTH", "YEAR"].includes(period)) {
        throw new Error("Period must be MONTH or YEAR");
      }

      const updatedWarranty = await warranty.update({
        warrantyName: warrantyName.trim(),
        duration,
        period,
        description: description?.trim() ?? null,
        status,
      });
      return updatedWarranty;
    } catch (error) {
      throw error;
    }
  },
  deleteWarranty: async (warrantyID) => {
    try {
      const warranty = await Warranty.findOne({
        where: {
          warranty_id: warrantyID,
          shop_id: shop_id,
        },
      });
      if (!warranty) throw new Error("Warranty Not Found");
      await warranty.destroy();
      return;
    } catch (error) {
      throw error;
    }
  },
};
