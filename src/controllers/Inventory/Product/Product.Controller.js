const {
  productService,
} = require("../../../services/Inventory/Product/Product.Service");
const { success, error } = require("../../../utils/response");
const { getPagination, getPageMetaData } = require("../../../utils/Pagination");
const {
  Product,
  Product_Variant,
  Product_variant_Attribute,
  Attribute,
  AttributeValues,
  Brand,
  Category,
  SubCategory,
  Warranty,
  Unit,
} = require("../../../models/indexModel");
exports.createProduct = async (req, res) => {
  try {
    const product = await productService.createProduct(req.body);
    return success(res, "Product Create Successfully", product);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.getProductPage = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);

    const product = await Product.findAndCountAll({
      limit,
      offset,
      distinct: true,
      include: [
        { model: Brand, attributes: ["brandName"], as: "brand" },
        { model: Unit, attributes: ["unitName"], as: "unit" },
        { model: Category, attributes: ["name"], as: "category" },
        {
          model: SubCategory,
          attributes: ["subCategoryName"],
          as: "subcategory",
        },
        { model: Warranty, as: "warranty", attributes: ["warrantyName"] },

        {
          model: Product_Variant,
          as: "variants",
          include: [
            {
              model: Product_variant_Attribute,
              as: "variant_attributes",
              include: [
                {
                  model: AttributeValues,
                  as: "value",
                  attributes: ["value"],
                  include: [
                    {
                      model: Attribute,
                      as: "attribute",
                      attributes: ["attributeName"],
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    return success(
      res,
      `${limit} Product Fetched`,
      product.rows,
      getPageMetaData(page, limit, product.count)
    );
  } catch (err) {
    return error(res, err.message);
  }
};
