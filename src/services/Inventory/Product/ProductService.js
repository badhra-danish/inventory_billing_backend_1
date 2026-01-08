const sequelize = require("../../../config/database");
const {
  Product,
  Product_Variant,
  Product_variant_Attribute,
  Brand,
  Unit,
  Category,
  SubCategory,
  Warranty,
  Attribute,
  AttributeValues,
} = require("../../../models/indexModel");

exports.productService = {
  createProduct: async (productData) => {
    const transaction = await sequelize.transaction();
    try {
      const { product, productVariants } = productData;

      const newProduct = await Product.create(
        {
          productName: product.productName,
          slugName: product.slugName,
          selling_type: product.selling_type,
          product_type: product.product_type,
          description: product.description,
          manufacturer: product.manufacturer,
          manufacturer_date: product.manufacturer_date,
          expiry_date: product.expiry_date,
          brand_id: product.brand_id,
          category_id: product.category_id,
          subcategory_id: product.subcategory_id,
          unit_id: product.unit_id,
          warranty_id: product.warranty_id,
        },
        { transaction }
      );
      //create Variant
      for (const v of productVariants) {
        const newVariant = await Product_Variant.create(
          {
            product_id: newProduct.product_id,
            price: v.price,
            skuCode: v.skuCode,
            discount_type: v.discount_type,
            discount_value: v.discount_value,
            tax_type: v.tax_type,
            tax_value: v.tax_value,
          },
          { transaction }
        );

        // create Attribute Values
        if (v.attribute_value_ids && v.attribute_value_ids.length > 0) {
          const attributeRow = v.attribute_value_ids.map((id) => ({
            product_variant_id: newVariant.product_variant_id,
            attribute_value_id: id,
          }));
          console.log("from tkrsng", attributeRow);

          await Product_variant_Attribute.bulkCreate(attributeRow, {
            transaction,
          });
        }
      }
      const createdProduct = await Product.findByPk(
        newProduct.product_id,

        {
          transaction,
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
        }
      );
      await transaction.commit();
      return createdProduct;
    } catch (error) {
      transaction.rollback();
      console.log(error);

      throw error;
    }
  },
};
