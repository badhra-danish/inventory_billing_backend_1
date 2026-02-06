const {
  attributeService,
} = require("../../services/Inventory/Attribute.Service");
const { success, error } = require("../../utils/response");
const { getPagination, getPageMetaData } = require("../../utils/Pagination");
const { Attribute, AttributeValues } = require("../../models/indexModel");

exports.createAttribute = async (req, res) => {
  try {
    const shop_id = req.user.shop_id;
    const attribute = await attributeService.createAttribute(req.body, shop_id);
    return success(res, "Attribute created Successfully", attribute);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

exports.updateAttribute = async (req, res) => {
  try {
    const { attributeID } = req.params;
    const shop_id = req.user.shop_id;
    const updatedAttribute = await attributeService.updateAttribute(
      attributeID,
      req.body,
      shop_id,
    );
    return success(res, "Attributed Updated Successfully", updatedAttribute);
  } catch (err) {
    return error(res, err.message, 400);
  }
};

exports.deleteAttribute = async (req, res) => {
  try {
    const { attributeID } = req.params;
    const shop_id = req.user.shop_id;
    await attributeService.deleteAttribute(attributeID, shop_id);
    return success(res, "Attribute Delete Successfully");
  } catch (err) {
    return error(res, err.message || "Something Went Wrong", 400);
  }
};

exports.getAttributePage = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const shop_id = req.user.shop_id;
    const AttributePage = await Attribute.findAndCountAll({
      distinct: true,
      limit,
      offset,
      where: { shop_id },
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: AttributeValues,
          as: "attributeValues",
          attributes: ["attribute_value_id", "value"],
        },
      ],
    });
    console.log(AttributePage);

    return success(
      res,
      `${limit} Attribute Fetched`,
      AttributePage.rows,
      getPageMetaData(page, limit, AttributePage.count),
    );
  } catch (err) {
    return error(res, err.message);
  }
};
