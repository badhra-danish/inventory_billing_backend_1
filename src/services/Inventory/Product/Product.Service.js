const sequelize = require("../../../config/database");
const { Op } = require("sequelize");

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
const {
  buildVariantLabel,
  generateBarcode,
} = require("../../../utils/VariantLabelBulder");
exports.productService = {
  createProduct: async (productData, shop_id) => {
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
          shop_id: shop_id,
        },
        { transaction },
      );
      //create Variant
      // for (const v of productVariants) {
      //   const newVariant = await Product_Variant.create(
      //     {
      //       product_id: newProduct.product_id,
      //       price: v.price,
      //       skuCode: v.skuCode,
      //       discount_type: v.discount_type,
      //       discount_value: v.discount_value,
      //       tax_type: v.tax_type,
      //       tax_value: v.tax_value,
      //     },
      //     { transaction },
      //   );

      //   // create Attribute Values
      //   if (v.attribute_value_ids && v.attribute_value_ids.length > 0) {
      //     const attributeRow = v.attribute_value_ids.map((id) => ({
      //       product_variant_id: newVariant.product_variant_id,
      //       attribute_value_id: id,
      //     }));

      //     await Product_variant_Attribute.bulkCreate(attributeRow, {
      //       transaction,
      //     });
      //   }
      // }
      for (const v of productVariants) {
        const newVariant = await Product_Variant.create(
          {
            product_id: newProduct.product_id,
            price: v.price,
            skuCode: v.skuCode,
            discount_type: v.discount_type || "NONE",
            discount_value: v.discount_value || 0,
            tax_type: v.tax_type || "NONE",
            tax_value: v.tax_value || 0,
            barcode: "temp",
            variant_label: "temp",
            shop_id: shop_id,
          },
          { transaction },
        );

        if (v.attribute_value_ids && v.attribute_value_ids.length > 0) {
          const attributeRow = v.attribute_value_ids.map((id) => ({
            product_variant_id: newVariant.product_variant_id,
            attribute_value_id: id,
            shop_id: shop_id,
          }));

          await Product_variant_Attribute.bulkCreate(attributeRow, {
            transaction,
          });

          const variantAttributes = await Product_variant_Attribute.findAll({
            where: {
              product_variant_id: newVariant.product_variant_id,
            },
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
            transaction,
          });

          // Build Variant Label
          const variantLabel = buildVariantLabel(variantAttributes);
          const barCode = generateBarcode(newVariant.skuCode, variantLabel);

          await newVariant.update(
            { variant_label: variantLabel, barcode: barCode },
            { transaction },
          );
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
        },
      );
      await transaction.commit();
      return createdProduct;
    } catch (error) {
      transaction.rollback();
      console.log(error);

      throw error;
    }
  },
  updateProductInfo: async (product_id, productData) => {
    try {
      const { updateProductData } = productData;
      const product = await Product.findByPk(product_id);

      const updatedProduct = await product.update({
        productName: updateProductData.productName,
        slugName: updateProductData.slugName,
        selling_type: updateProductData.selling_type,
        product_type: updateProductData.product_type,
        description: updateProductData.description,
        manufacturer: updateProductData.manufacturer,
        manufacturer_date: updateProductData.manufacturer_date,
        expiry_date: updateProductData.expiry_date,
        brand_id: updateProductData.brand_id,
        category_id: updateProductData.category_id,
        subcategory_id: updateProductData.subcategory_id,
        unit_id: updateProductData.unit_id,
        warranty_id: updateProductData.warranty_id,
      });

      return updatedProduct;
    } catch (error) {
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
  getAllProduct: async (limit, offset, shop_id) => {
    try {
      const product = await Product.findAll({
        limit,
        offset,
        where: { shop_id },
        distinct: true,
        attributes: [
          ["product_id", "product_id"],
          ["productName", "productName"],
          ["slugName", "slugName"],
          ["selling_type", "selling_type"],
          ["product_type", "product_type"],
          ["description", "description"],
          ["manufacturer_date", "manufacturer_date"],
          ["manufacturer", "manufacturer"],
          ["expiry_date", "expiry_date"],
          [
            sequelize.fn("COUNT", sequelize.col("variants.product_variant_id")),
            "variant_count",
          ],
          [sequelize.col("category.name"), "categoryName"],
          [sequelize.col("category.category_id"), "category_id"],

          [sequelize.col("brand.brandName"), "brandName"],
          [sequelize.col("brand.brand_id"), "brand_id"],

          [sequelize.col("unit.unitName"), "unitName"],
          [sequelize.col("unit.unit_id"), "unit_id"],

          [sequelize.col("subcategory.subCategoryName"), "subCategoryName"],
          [sequelize.col("subcategory.subCategory_id"), "subCategory_id"],

          [sequelize.col("warranty.warrantyName"), "warrantyName"],
          [sequelize.col("warranty.warranty_id"), "warranty_id"],
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

  getAllVariantByProduct: async (product_id, shop_id) => {
    try {
      const rows = await Product_Variant.findAll({
        where: { product_id, shop_id },
        attributes: [
          "product_variant_id",
          "price",
          "skuCode",
          "variant_label",
          "tax_type",
          "barcode",
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
      if (rows.length === 0) {
        throw new Error("Product Variant Not Found");
      }
      const variantsMap = {};

      for (const row of rows) {
        const variantId = row.product_variant_id;

        if (!variantsMap[variantId]) {
          variantsMap[variantId] = {
            product_variant_id: row.product_variant_id,
            price: row.price,
            skuCode: row.skuCode,
            barcode: row.barcode,
            variant_label: row.variant_label,
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
  getAllVariantBySearch: async (q) => {
    try {
      const { query } = q;
      const variants = await Product_Variant.findAll({
        where: {
          [Op.or]: [
            { skuCode: { [Op.like]: `%${query}%` } },
            { variant_label: { [Op.like]: `%${query}%` } },
          ],
        },
        attributes: [
          "product_variant_id",
          "skuCode",
          "price",
          "variant_label",
          "tax_type",
          "tax_value",
          "discount_type",
          "discount_value",
          [sequelize.col("product.productName"), "productName"],
          [sequelize.col("product.product_id"), "product_id"],
        ],

        include: [
          {
            model: Product,
            as: "product",
            attributes: [],

            required: false,
          },
        ],
        limit: 20,
      });
      return variants;
    } catch (error) {
      throw error;
    }
  },
  createVariantofProduct: async (product_id, variantData) => {
    const transaction = await sequelize.transaction();
    try {
      const { productVariants } = variantData;
      const createdVariants = [];

      for (const v of productVariants) {
        // 1️⃣ Create variant with TEMP label
        const newVariant = await Product_Variant.create(
          {
            product_id,
            price: v.price,
            skuCode: v.skuCode,
            discount_type: v.discount_type,
            discount_value: v.discount_value,
            tax_type: v.tax_type,
            tax_value: v.tax_value,
            variant_label: "TEMP",
            barcode: "TEMP",
          },
          { transaction },
        );

        // 2️⃣ Create attribute relations (if any)
        if (v.attribute_value_ids && v.attribute_value_ids.length > 0) {
          const attributeRow = v.attribute_value_ids.map((id) => ({
            product_variant_id: newVariant.product_variant_id,
            attribute_value_id: id,
          }));

          await Product_variant_Attribute.bulkCreate(attributeRow, {
            transaction,
          });
        }

        // 3️⃣ Fetch attributes for label (ALWAYS)
        const variantAttributes = await Product_variant_Attribute.findAll({
          where: {
            product_variant_id: newVariant.product_variant_id,
          },
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
          transaction,
        });

        const variantLabel = buildVariantLabel(variantAttributes);
        const barCode = generateBarcode(newVariant.skuCode, variantLabel);

        await newVariant.update(
          { variant_label: variantLabel, barcode: barCode },
          { transaction },
        );
        createdVariants.push(newVariant);
      }

      await transaction.commit();
      return createdVariants;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  deleteVariant: async (variant_id) => {
    const transaction = await sequelize.transaction();

    try {
      const product_variant = await Product_Variant.findByPk(variant_id, {
        transaction,
      });

      if (!product_variant) {
        throw new Error("Product variant not found");
      }

      await Product_variant_Attribute.destroy({
        where: { product_variant_id: variant_id },
        transaction,
      });

      await product_variant.destroy({ transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  deleteProduct: async (product_id) => {
    const transaction = await sequelize.transaction();

    try {
      const product = await Product.findByPk(product_id, { transaction });

      if (!product) {
        throw new Error("Product not found");
      }

      const variants = await Product_Variant.findAll({
        where: { product_id },
        attributes: ["product_variant_id"],
        transaction,
      });

      const variantIds = variants.map((v) => v.product_variant_id);

      if (variantIds.length > 0) {
        await Product_variant_Attribute.destroy({
          where: {
            product_variant_id: variantIds,
          },
          transaction,
        });

        await Product_Variant.destroy({
          where: { product_id },
          transaction,
        });
      }

      await product.destroy({ transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
