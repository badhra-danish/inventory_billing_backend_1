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
      getPageMetaData(page, limit, product.count),
    );
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getAllProduct = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);

    const product = await productService.getAllProduct(limit, offset);
    return success(
      res,
      `${limit} Product Fetched`,
      product.data,
      getPageMetaData(page, limit, product.count),
    );
  } catch (err) {
    return error(res, err.message);
  }
};

exports.getAllVariantByProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    const productVariant =
      await productService.getAllVariantByProduct(product_id);
    return success(res, "Fetch All Variant SuccessFully", productVariant);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.getAllVariantBySearch = async (req, res) => {
  try {
    const productVariant = await productService.getAllVariantBySearch(
      req.query,
    );
    return success(res, "Fetch All Variant SuccessFully", productVariant);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.updateProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    const updatedProduct = await productService.updateProductInfo(
      product_id,
      req.body,
    );
    return success(res, "Product Update Successfully", updatedProduct);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.updateVariant = async (req, res) => {
  try {
    const { variant_id } = req.params;
    const updateVariant = await productService.updateVariant(
      variant_id,
      req.body,
    );
    return success(res, "Variant Upadate Successfully", updateVariant);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.createVariantofProduct = async (req, res) => {
  try {
    const { product_id } = req.params;

    const newVariant = await productService.createVariantofProduct(
      product_id,
      req.body,
    );
    return success(res, "Variant Add SuccessFully", newVariant);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.deleteVariant = async (req, res) => {
  try {
    const { variant_id } = req.params;
    await productService.deleteVariant(variant_id);
    return success(res, "Variant Deleted SuccessFully");
  } catch (err) {
    return error(res, err.message);
  }
};
exports.deleteProduct = async (req, res) => {
  try {
    const { product_id } = req.params;
    await productService.deleteProduct(product_id);
    return success(res, "Product Deleted SuccessFully");
  } catch (err) {
    return error(res, err.message);
  }
};
