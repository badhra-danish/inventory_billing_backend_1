const { Product_Variant, Product } = require("../../models/indexModel");
const Stock = require("../../models/Stock/Stock.Model");

const sequelize = require("../../config/database");
const { Op } = require("sequelize");

exports.stockService = {
  createStock: async (stockData, shop_id) => {
    try {
      const { product_variant_id, quantity, status } = stockData;

      if (!product_variant_id) {
        throw new Error("product_variant_id is required");
      }

      const parsedQty = Number(quantity);

      if (isNaN(parsedQty) || parsedQty < 0) {
        throw new Error("Quantity must be a valid non-negative number");
      }

      // Prevent duplicate stock entry
      const existingStock = await Stock.findOne({
        where: { product_variant_id },
      });

      if (existingStock) {
        throw new Error("Stock already exists for this variant");
      }

      const stock = await Stock.create({
        product_variant_id,
        quantity: parsedQty,
        status,
        shop: shop_id,
      });

      return stock;
    } catch (error) {
      console.error("Create stock error:", error);
      throw error;
    }
  },
  updateStockQuantity: async (stock_id, updatedData) => {
    try {
      const { quantity, type } = updatedData;

      if (quantity === undefined || isNaN(quantity) || quantity < 0) {
        throw new Error("Invalid quantity");
      }

      const stock = await Stock.findByPk(stock_id);

      if (!stock) {
        throw new Error("Stock not found");
      }
      let newQuantity = stock.quantity;
      if (type === "add") {
        // newQuantity = stock.quantity + quantity;
        await stock.increment("quantity", { by: quantity });
      } else if (type == "remove") {
        if (stock.quantity < quantity) {
          throw new Error("Insufficient stock");
        }
        // newQuantity = stock.quantity - quantity;
        await stock.decrement("quantity", { by: quantity });
      } else {
        throw new Error("Invalid stock update type");
      }
      await stock.reload();
      const newStatus = stock.quantity === 0 ? "OUTSTOCK" : "INSTOCK";

      await stock.update({
        status: newStatus,
      });

      return stock;
    } catch (error) {
      throw error;
    }
  },
  getAllStockVariant: async (limit, offset, shop_id) => {
    try {
      const stockVariant = await Stock.findAll({
        limit,
        offset,
        distinct: true,
        where: { shop_id },
        attributes: [
          ["stock_id", "stock_id"],
          ["quantity", "quantity"],
          ["status", "status"],
          [sequelize.col("variant.skuCode"), "skuCode"],
          [sequelize.col("variant.price"), "price"],
          [sequelize.col("variant.variant_label"), "variant_label"],
          [sequelize.col("variant->product.productName"), "productName"],
        ],

        include: [
          {
            model: Product_Variant,
            as: "variant",

            attributes: [],
            include: [
              {
                model: Product,
                as: "product",
                attributes: [],
              },
            ],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      const totalStock = await Stock.count({
        distinct: true,
        include: [
          {
            model: Product_Variant,
            as: "variant",
            include: [
              {
                model: Product,
                as: "product",
              },
            ],
          },
        ],
      });

      return {
        data: stockVariant,
        count: totalStock,
      };
    } catch (error) {
      throw error;
    }
  },
  deleteStockVariant: async (stock_id) => {
    try {
      const stock = await Stock.findByPk(stock_id);
      if (!stock) {
        throw new Error("Stock Not Found");
      }
      await stock.destroy();
      return;
    } catch (error) {
      throw error;
    }
  },
  getVariantInStock: async (query) => {
    try {
      const { q } = query;
      const variant = await Product_Variant.findAll({
        where: {
          [Op.or]: [
            { skuCode: { [Op.like]: `%${q}%` } },
            { variant_label: { [Op.like]: `%${q}%` } },
            { "$product.productName$": { [Op.like]: `%${q}%` } },
          ],
        },
        attributes: [
          ["product_variant_id", "product_variant_id"],
          ["skuCode", "skuCode"],
          ["price", "price"],
          ["variant_label", "variant_label"],
          [sequelize.col("stock.quantity"), "quantity"],
          [sequelize.col("product.productName"), "productName"],
        ],
        include: [
          {
            model: Product,
            as: "product",
            attributes: [],
          },
          {
            model: Stock,
            as: "stock",
            attributes: [],
            where: {
              quantity: { [Op.gt]: 0 },
            },
          },
        ],
        order: [["createdAt", "DESC"]],
        limit: 20,
      });
      return variant;
    } catch (error) {
      console.log(error);

      throw error;
    }
  },
};
