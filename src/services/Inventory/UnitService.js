const { Unit } = require("../../models/indexModel");

exports.unitService = {
  createUnit: async (unitData) => {
    try {
      const { unitName, unitShortName, status } = unitData;
      if (!unitName || !status || !unitShortName) {
        throw new Error("All Feild Are Required");
      }
      const exists = await Unit.findOne({ where: { unitName } });
      if (exists) throw new Error("Unit_Exits");

      const unit = await Unit.create({
        unitName: unitName,
        unitShortName: unitShortName,
        status: status,
      });
      return unit;
    } catch (error) {
      throw error;
    }
  },
  updateUnit: async (unitID, updateData) => {
    try {
      const { unitName, unitShortName, status } = updateData;
      const unit = await Unit.findByPk(unitID);
      if (!unit) throw new Error("Unit Not Found");
      const updatedunit = await unit.update({
        unitName: unitName ?? unit.unitName,
        unitShortName: unitShortName ?? unit.unitShortName,
        status: status ?? unit.status,
      });
      return updatedunit;
    } catch (error) {
      throw error;
    }
  },
  deleteUnit: async (unitID) => {
    try {
      const unit = await Unit.findByPk(unitID);
      if (!unit) throw new Error("unit Not Found");
      await unit.destroy();
      return;
    } catch (error) {
      throw error;
    }
  },
};
