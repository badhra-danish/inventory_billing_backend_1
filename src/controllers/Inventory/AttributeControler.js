const {
  attributeService,
} = require("../../services/Inventory/AttributeService");
const { success, error } = require("../../utils/response");
const { getPagination, getPageMetaData } = require("../../utils/Pagination");
const { Attribute, AttributeValues } = require("../../models/indexModel");

exports.createAttribute = async (req, res) => {
  try {
    const attribute = await attributeService.createAttribute(req.body);
    return success(res, "Attribute created Successfully", attribute);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

exports.updateAttribute = async (req, res) => {
  try {
    const { attributeID } = req.params;
    const updatedAttribute = await attributeService.updateAttribute(
      attributeID,
      req.body
    );
    return success(res, "Attributed Updated Successfully", updatedAttribute);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

exports.deleteAttribute = async (req, res) => {
  try {
    const { attributeID } = req.params;
    await attributeService.deleteAttribute(attributeID);
    return success(res, "Attribute Delete Successfully");
  } catch (err) {
    return error(res, err.message || "Something Went Wrong", 400);
  }
};

exports.getAttributePage = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);

    const AttributePage = await Attribute.findAndCountAll({
      distinct: true,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: AttributeValues,
          as: "attributeValues",
          attributes: ["attribute_value_ID", "value"],
        },
      ],
    });
    console.log(AttributePage);

    return success(
      res,
      `${limit} Attribute Fetched`,
      AttributePage.rows,
      getPageMetaData(page, limit, AttributePage.count)
    );
  } catch (err) {
    return error(res, err.message);
  }
};
