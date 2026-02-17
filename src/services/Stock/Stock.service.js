const {
  Product_Variant,
  Product,
  StockMovement,
  Warehouse,
} = require("../../models/indexModel");
const Stock = require("../../models/Stock/Stock.Model");

const sequelize = require("../../config/database");
const { Op } = require("sequelize");

exports.stockService = {
  createStock: async (stockData, shop_id) => {
    const transaction = await sequelize.transaction();
    try {
      const { product_variant_id, warehouse_id, quantity } = stockData;

      if (!product_variant_id || !warehouse_id) {
        throw new Error("product_variant and warehouse required");
      }

      // prevent duplicate (variant + warehouse)
      const existing = await Stock.findOne({
        where: { product_variant_id, warehouse_id, shop_id },
      });

      if (existing) {
        throw new Error("Stock already exists for this warehouse");
      }

      const stock = await Stock.create(
        {
          product_variant_id,
          warehouse_id,
          quantity,
          status: quantity > 0 ? "INSTOCK" : "OUTSTOCK",
          shop_id,
        },
        { transaction },
      );

      // initial movement
      if (quantity > 0) {
        await StockMovement.create(
          {
            stock_id: stock.stock_id,
            type: "IN",
            reason: "INITIAL",
            quantity,
            before_qty: 0,
            after_qty: quantity,
            shop_id,
          },
          { transaction },
        );
      }

      await transaction.commit();
      return stock;
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
  updateStockQuantity: async (stock_id, stockData, shop_id) => {
    const transaction = await sequelize.transaction();

    try {
      const { quantity, type, reason } = stockData;

      const stock = await Stock.findOne({
        where: { stock_id, shop_id },
        transaction,
        lock: true,
      });

      if (!stock) throw new Error("Stock not found");

      const before = stock.quantity;

      let after;

      if (type === "add") {
        after = before + quantity;
      } else if (type === "remove") {
        if (before < quantity) throw new Error("Insufficient stock");
        after = before - quantity;
      } else {
        throw new Error("Invalid type");
      }

      await stock.update(
        {
          quantity: after,
          status: after === 0 ? "OUTSTOCK" : "INSTOCK",
        },
        { transaction },
      );

      // movement log
      await StockMovement.create(
        {
          stock_id,
          type: type === "add" ? "IN" : "OUT",
          reason,
          quantity,
          before_qty: before,
          after_qty: after,
          shop_id,
        },
        { transaction },
      );

      await transaction.commit();
      return stock;
    } catch (err) {
      await transaction.rollback();
      throw err;
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
          [sequelize.col("warehouse.warehouseName"), "warehouseName"],
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
          {
            model: Warehouse,
            as: "warehouse",
            attributes: [],
          },
        ],
        order: [["createdAt", "DESC"]],
      });

      const totalStock = await Stock.count({
        distinct: true,
        where: { shop_id },
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
  getAllStockMovementByStockId: async (stock_id, shop_id, limit, offset) => {
    try {
      const stock = await Stock.findOne({
        where: { stock_id, shop_id },
      });

      if (!stock) {
        throw new Error("Stock not found");
      }

      const movements = await StockMovement.findAll({
        where: { stock_id, shop_id },
        limit,
        offset,
        order: [["createdAt", "DESC"]],
        attributes: [
          "stock_movement_id",
          "type",
          "reason",
          "quantity",
          "before_qty",
          "after_qty",
          "createdAt",
        ],
      });

      const total = await StockMovement.count({
        where: { stock_id, shop_id },
      });

      return {
        data: movements,
        count: total,
      };
    } catch (error) {
      throw error;
    }
  },

  deleteStockVariant: async (stock_id, shop_id) => {
    try {
      const stock = await Stock.findOne({
        where: {
          stock_id: stock_id,
          shop_id: shop_id,
        },
      });
      if (!stock) {
        throw new Error("Stock Not Found");
      }
      await stock.destroy();
      return;
    } catch (error) {
      throw error;
    }
  },
  // getVariantInStock: async (query, shop_id) => {
  //   try {
  //     const { q } = query;
  //     const variant = await Product_Variant.findAll({
  //       where: {
  //         [Op.or]: [
  //           { skuCode: { [Op.like]: `%${q}%` } },
  //           { variant_label: { [Op.like]: `%${q}%` } },
  //           { "$product.productName$": { [Op.like]: `%${q}%` } },
  //         ],
  //         shop_id,
  //       },
  //       attributes: [
  //         ["product_variant_id", "product_variant_id"],
  //         ["skuCode", "skuCode"],
  //         ["price", "price"],
  //         ["variant_label", "variant_label"],
  //         [sequelize.col("stocks.quantity"), "quantity"],
  //         [sequelize.col("product.productName"), "productName"],
  //       ],
  //       include: [
  //         {
  //           model: Product,
  //           as: "product",
  //           attributes: [],
  //         },
  //         {
  //           model: Stock,
  //           as: "stocks",
  //           attributes: [],
  //           where: {
  //             quantity: { [Op.gt]: 0 },
  //           },
  //         },
  //       ],
  //       order: [["createdAt", "DESC"]],
  //       limit: 20,
  //     });
  //     return variant;
  //   } catch (error) {
  //     console.log(error);

  //     throw error;
  //   }
  // },

  getVariantInStock: async (query, shop_id) => {
    try {
      const { q } = query;

      const variant = await Product_Variant.findAll({
        subQuery: false,

        where: {
          [Op.or]: [
            { skuCode: { [Op.like]: `%${q}%` } },
            { variant_label: { [Op.like]: `%${q}%` } },
            { "$product.productName$": { [Op.like]: `%${q}%` } },
          ],
          shop_id,
        },

        attributes: [
          "product_variant_id",
          "skuCode",
          "price",
          "variant_label",
          [sequelize.fn("SUM", sequelize.col("stocks.quantity")), "quantity"],
          [sequelize.col("product.productName"), "productName"],
        ],

        include: [
          {
            model: Product,
            as: "product",
            attributes: [],
            required: false,
          },
          {
            model: Stock,
            as: "stocks",
            attributes: [],
            required: true,
          },
        ],

        group: ["Product_Variant.product_variant_id", "product.productName"],

        having: sequelize.literal("SUM(stocks.quantity) > 0"),

        order: [["createdAt", "DESC"]],
        limit: 20,
      });

      return variant;
    } catch (error) {
      throw error;
    }
  },
};
