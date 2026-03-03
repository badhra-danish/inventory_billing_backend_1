const { it } = require("zod/locales");
const sequelize = require("../../config/database");
const Purchase = require("../../models/Purchase/PurchaseModel");
const PurchaseItem = require("../../models/Purchase/Purchase_item_model");
const { Stock, StockMovement } = require("../../models/indexModel");

exports.purchaseService = {
  createPurchase: async (purchaseData, shop_id) => {
    const transaction = await sequelize.transaction();
    try {
      const {
        supplier_id,
        purchase_date,
        warehouse_id,
        reference_no,
        order_tax,
        discount,
        shipping,
        status,
        purchase_items,
      } = purchaseData;

      const summary = purchase_items.reduce(
        (acc, item) => {
          const itemSubTotal = item.price * item.quantity;

          acc.sub_total += itemSubTotal;
          acc.item_tax += item.tax_amount || 0;
          acc.item_discount += item.discount || 0;
          acc.items_total += item.total; // item final total

          return acc;
        },
        {
          sub_total: 0,
          item_tax: 0,
          item_discount: 0,
          items_total: 0,
        },
      );

      const orderTaxPercent = order_tax || 0;
      const orderDiscount = discount || 0;
      const shippingCharge = shipping || 0;
      const orderTaxAmount = (summary.items_total * orderTaxPercent) / 100;
      const grand_total =
        summary.items_total + orderTaxAmount + shippingCharge - orderDiscount;

      const purchase = await Purchase.create(
        {
          supplier_id: supplier_id,
          purchase_date: purchase_date,
          warehouse_id: warehouse_id,
          reference_no: reference_no,
          order_tax: orderTaxPercent,
          discount: discount,
          shipping: shippingCharge,
          status: status,
          sub_total: summary.sub_total,
          paid_amount: 0,
          due_amount: grand_total,
          payment_status: "UNPAID",
          shop_id: shop_id,
        },
        { transaction },
      );

      const purchaseItemtoCreate = purchase_items.map((item) => ({
        purchase_id: purchase.purchase_id,
        product_variant_id: item.product_variant_id,
        quantity: item.quantity,
        discount: item.discount,
        tax: item.tax,
        tax_amount: item.tax_amount,
        total: item.total,
        shop_id: shop_id,
      }));

      await PurchaseItem.bulkCreate(purchaseItemtoCreate, { transaction });

      for (const item of purchase_items) {
        const stock = await Stock.findOne({
          where: {
            product_variant_id: item.product_variant_id,
            warehouse_id: warehouse_id,
            shop_id: shop_id,
          },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });

        if (!stock) {
          const newStock = await Stock.create(
            {
              product_variant_id: item.product_variant_id,
              warehouse_id: warehouse_id,
              quantity: item.quantity,
              status: "INSTOCK",
              shop_id: shop_id,
            },
            { transaction },
          );

          await StockMovement.create(
            {
              stock_id: newStock.stock_id,
              type: "IN",
              reason: "PURCHASE",
              quantity: item.quantity,
              before_qty: 0,
              after_qty: item.quantity,
              shop_id: shop_id,
            },
            { transaction },
          );
        } else {
          const beforeQty = stock.quantity;
          const afterQty = beforeQty + item.quantity;

          await stock.update(
            {
              quantity: afterQty,
              status: afterQty === 0 ? "OUTSTOCK" : "INSTOCK",
            },
            { transaction },
          );

          await StockMovement.create(
            {
              stock_id: stock.stock_id,
              type: "IN",
              reason: "PURCHASE",
              quantity: item.quantity,
              before_qty: beforeQty,
              after_qty: afterQty,
              shop_id: shop_id,
            },
            { transaction },
          );
        }
      }

      await transaction.commit();
      return purchase;
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      throw error;
    }
  },
};
