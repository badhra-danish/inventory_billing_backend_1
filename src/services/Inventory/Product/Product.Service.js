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
  updateVariant: async (variant_id, upadateVatiantData) => {
    try {
      const {
        skuCode,
        price,
        tax_type,
        tax_value,
        discount_type,
        discount_value,
      } = upadateVatiantData;
      const product_variant = await Product_Variant.findByPk(variant_id);
      if (!product_variant) {
        throw new Error("Variant Not Found");
      }
      const upadtedVariant = await product_variant.update({
        skuCode,
        price,
        tax_type,
        tax_value,
        discount_type,
        discount_value,
      });
      return upadtedVariant;
    } catch (error) {
      throw error;
    }
  },
  getAllProduct: async (limit, offset) => {
    try {
      const product = await Product.findAll({
        limit,
        offset,
        distinct: true,
        attributes: [
          ["product_id", "product_id"],
          ["productName", "productName"],
          ["product_type", "product_type"],
          ["manufacturer_date", "manufacturer_date"],
          ["expiry_date", "expiry_date"],
          [
            sequelize.fn("COUNT", sequelize.col("variants.product_variant_id")),
            "variant_count",
          ],
          [sequelize.col("category.name"), "categoryName"],
          [sequelize.col("brand.brandName"), "brandName"],
          [sequelize.col("unit.unitName"), "unitName"],
          [sequelize.col("subcategory.subCategoryName"), "subCategoryName"],
          [sequelize.col("warranty.warrantyName"), "warrantyName"],
        ],
        include: [
          {
            model: Category,
            as: "category",
            attributes: [],
          },
          {
            model: SubCategory,
            as: "subcategory",
            attributes: [],
          },
          {
            model: Brand,
            as: "brand",
            attributes: [],
            required: false,
          },
          {
            model: Unit,
            as: "unit",
            attributes: [],
            required: false,
          },
          {
            model: Warranty,
            as: "warranty",
            attributes: [],
            required: false,
          },
          {
            model: Product_Variant,
            as: "variants",
            attributes: [],
            required: false,
          },
        ],
        group: ["Product.product_id", "category.category_id", "brand.brand_id"],
        order: [["createdAt", "DESC"]],
        subQuery: false,
      });
      const totalProduct = await Product.count();
      return {
        data: product,
        count: totalProduct,
      };
    } catch (error) {
      throw error;
    }
  },

  getAllVariantByProduct: async (product_id) => {
    try {
      // const productVariants = await Product_Variant.findAll({
      //   where: { product_id: product_id },
      //   attributes: [
      //     "product_variant_id",
      //     "price",
      //     "skuCode",
      //     "tax_type",
      //     "tax_value",
      //     "discount_type",
      //     "discount_value",
      //     [
      //       sequelize.col("variant_attributes.product_varaint_attribute_id"),
      //       "product_varaint_attribute_id",
      //     ],
      //     [sequelize.col("variant_attributes->value.value"), "attributeValue"],
      //     [
      //       sequelize.col("variant_attributes->value->attribute.attributeName"),
      //       "attributeName",
      //     ],
      //   ],
      //   include: [
      //     {
      //       model: Product_variant_Attribute,
      //       as: "variant_attributes",
      //       attributes: [],
      //       required: false,
      //       include: [
      //         {
      //           model: AttributeValues,
      //           as: "value",
      //           attributes: [],
      //           include: [
      //             {
      //               model: Attribute,
      //               as: "attribute",
      //               attributes: [],
      //             },
      //           ],
      //         },
      //       ],
      //     },
      //   ],
      //   raw: true,
      // });
      const rows = await Product_Variant.findAll({
        where: { product_id },
        attributes: [
          "product_variant_id",
          "price",
          "skuCode",
          "tax_type",
          "tax_value",
          "discount_type",
          "discount_value",
          [sequelize.col("variant_attributes->value.value"), "attributeValue"],
          [
            sequelize.col("variant_attributes->value->attribute.attributeName"),
            "attributeName",
          ],
        ],
        include: [
          {
            model: Product_variant_Attribute,
            as: "variant_attributes",
            attributes: [],
            required: false,
            include: [
              {
                model: AttributeValues,
                as: "value",
                attributes: [],
                include: [
                  {
                    model: Attribute,
                    as: "attribute",
                    attributes: [],
                  },
                ],
              },
            ],
          },
        ],
        raw: true,
      });
      const variantsMap = {};

      for (const row of rows) {
        const variantId = row.product_variant_id;

        if (!variantsMap[variantId]) {
          variantsMap[variantId] = {
            product_variant_id: row.product_variant_id,
            price: row.price,
            skuCode: row.skuCode,
            tax_type: row.tax_type,
            tax_value: row.tax_value,
            discount_type: row.discount_type,
            discount_value: row.discount_value,
            attributes: [],
          };
        }

        if (row.attributeName && row.attributeValue) {
          variantsMap[variantId].attributes.push({
            attributeName: row.attributeName,
            attributeValue: row.attributeValue,
          });
        }
      }

      const variants = Object.values(variantsMap);

      return variants;
    } catch (error) {
      console.log(error);

      throw error;
    }
  },
};
