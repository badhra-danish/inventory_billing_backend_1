const { Unit } = require("../../models/indexModel");
const { unitService } = require("../../services/Inventory/Unit.Service");
const { success, error } = require("../../utils/response");
const { getPagination, getPageMetaData } = require("../../utils/Pagination");

exports.createUnit = async (req, res) => {
  try {
    const unit = await unitService.createUnit(req.body);

    return success(res, "Unit Create Successfully", unit);
  } catch (err) {
    return error(res, err.message || "Something Went Wrong", 400);
  }
};

exports.updateUnit = async (req, res) => {
  try {
    const { unitID } = req.params;
    const updatedUnit = await unitService.updateUnit(unitID, req.body);
    return success(res, "Unit Updated Successfully", updatedUnit);
  } catch (err) {
    return error(res, err.message || "something Went wrong", 400);
  }
};

exports.deleteUnit = async (req, res) => {
  try {
    const { unitID } = req.params;
    await unitService.deleteUnit(unitID);
    return success(res, "Unit Delete Successfully");
  } catch (err) {
    return error(res, err.message || "something Went wrong", 400);
  }
};

exports.getUnitPage = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);

    const unitData = await Unit.findAndCountAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    return success(
      res,
      `${limit} Unit Fetched`,
      unitData.rows,
      getPageMetaData(page, limit, unitData.count)
    );
  } catch (err) {
    return error(res, err.message);
  }
};
