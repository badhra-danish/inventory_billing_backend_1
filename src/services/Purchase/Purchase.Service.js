const { it } = require("zod/locales");
const sequelize = require("../../config/database");
const Purchase = require("../../models/Purchase/PurchaseModel");
const PurchaseItem = require("../../models/Purchase/Purchase_item_model");
const {
  Stock,
  StockMovement,
  Supplier,
  Product_Variant,
  Product,
} = require("../../models/indexModel");
const { error } = require("../../utils/response");
const { Op } = require("sequelize");
const PurchasePayment = require("../../models/Purchase/PurchasePayment.Model");

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
          grand_total: grand_total,
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
  updatePurchase: async (purchase_id, updatedData, shop_id) => {
    const transaction = await sequelize.transaction();

    try {
      const {
        supplier_id,
        purchase_date,
        order_tax,
        discount,
        shipping,
        status,
        reference_no,
        warehouse_id,
        purchase_items,
      } = updatedData;

      /* ================= GET PURCHASE ================= */

      const purchase = await Purchase.findOne({
        where: { purchase_id, shop_id },
        transaction,
      });

      if (!purchase) throw new Error("Purchase not found");

      const oldWarehouseId = purchase.warehouse_id;

      /* ================= CALCULATE TOTAL ================= */

      const summary = purchase_items.reduce(
        (acc, item) => {
          const itemSubTotal = item.price * item.quantity;
          acc.sub_total += itemSubTotal;
          acc.items_total += item.total;
          return acc;
        },
        { sub_total: 0, items_total: 0 },
      );

      const orderTaxPercent = order_tax || 0;
      const orderDiscount = discount || 0;
      const shippingCharge = shipping || 0;

      const orderTaxAmount = (summary.items_total * orderTaxPercent) / 100;

      const grand_total =
        summary.items_total + orderTaxAmount + shippingCharge - orderDiscount;

      let payment_status = "UNPAID";

      if (Number(purchase.paid_amount) === Number(grand_total)) {
        payment_status = "PAID";
      } else if (Number(purchase.paid_amount) > 0) {
        payment_status = "PARTIALLY_PAID";
      }

      /* ================= UPDATE PURCHASE ================= */
      const existingReference = await Purchase.findOne({
        where: {
          reference_no,
          shop_id,
          purchase_id: { [Op.ne]: purchase_id }, // exclude current record
        },
        transaction,
      });

      if (existingReference) {
        throw new Error("Reference number already exists");
      }
      await purchase.update(
        {
          supplier_id,
          purchase_date,
          reference_no,
          order_tax: orderTaxPercent,
          discount: orderDiscount,
          shipping: shippingCharge,
          status,
          warehouse_id,
          sub_total: summary.sub_total,
          grand_total,
          due_amount: grand_total - purchase.paid_amount,
          payment_status,
        },
        { transaction },
      );

      /* ================= HANDLE ITEMS ================= */

      const existingItems = await PurchaseItem.findAll({
        where: { purchase_id, shop_id },
        transaction,
      });

      const existingMap = new Map(
        existingItems.map((item) => [item.purchase_item_id, item]),
      );

      const incomingIds = [];

      for (const item of purchase_items) {
        const existingItem = item.purchase_item_id
          ? existingMap.get(item.purchase_item_id)
          : null;

        /* =================================================
         CASE 1: UPDATE EXISTING ITEM
      ================================================= */
        if (existingItem) {
          incomingIds.push(existingItem.purchase_item_id);

          const qtyDiff = item.quantity - existingItem.quantity;

          /* ================= WAREHOUSE CHANGED ================= */
          if (warehouse_id !== oldWarehouseId) {
            // -------- REMOVE FROM OLD WAREHOUSE --------
            const oldStock = await Stock.findOne({
              where: {
                product_variant_id: existingItem.product_variant_id,
                warehouse_id: oldWarehouseId,
                shop_id,
              },
              transaction,
            });

            if (!oldStock) throw new Error("Old stock not found");

            const oldBefore = oldStock.quantity;
            const oldAfter = oldBefore - existingItem.quantity;

            await oldStock.update({ quantity: oldAfter }, { transaction });

            await StockMovement.create(
              {
                stock_id: oldStock.stock_id,
                purchase_id,
                type: "OUT",

                before_qty: oldBefore,
                after_qty: oldAfter,
                quantity: existingItem.quantity,
                reference_id: purchase_id,
                shop_id,
              },
              { transaction },
            );

            // -------- ADD TO NEW WAREHOUSE --------
            let newStock = await Stock.findOne({
              where: {
                product_variant_id: item.product_variant_id,
                warehouse_id,
                shop_id,
              },
              transaction,
            });

            if (!newStock) {
              newStock = await Stock.create(
                {
                  product_variant_id: item.product_variant_id,
                  warehouse_id,
                  quantity: 0,
                  status: "INSTOCK",
                  shop_id,
                },
                { transaction },
              );
            }

            const newBefore = newStock.quantity;
            const newAfter = newBefore + item.quantity;

            await newStock.update({ quantity: newAfter }, { transaction });

            await StockMovement.create(
              {
                stock_id: newStock.stock_id,
                purchase_id,
                type: "IN",
                reason: "PURCHASE_WAREHOUSE_CHANGE",
                before_qty: newBefore,
                after_qty: newAfter,
                quantity: item.quantity,
                reference_id: purchase_id,
                shop_id,
              },
              { transaction },
            );
          } else if (qtyDiff !== 0) {
            /* ================= QUANTITY UPDATED ================= */
            const stock = await Stock.findOne({
              where: {
                product_variant_id: item.product_variant_id,
                warehouse_id,
                shop_id,
              },
              transaction,
            });

            if (!stock) throw new Error("Stock not found");

            const before = stock.quantity;
            const after = before + qtyDiff;

            if (after < 0) throw new Error("Insufficient stock");

            await stock.update({ quantity: after }, { transaction });

            await StockMovement.create(
              {
                stock_id: stock.stock_id,
                purchase_id,
                type: qtyDiff > 0 ? "IN" : "OUT",
                reason: "PURCHASE_UPDATE",
                before_qty: before,
                after_qty: after,
                quantity: Math.abs(qtyDiff),
                reference_id: purchase_id,
                shop_id,
              },
              { transaction },
            );
          }

          await existingItem.update(
            {
              product_variant_id: item.product_variant_id,
              quantity: item.quantity,
              tax_amount: item.tax_amount,
              discount: item.discount,
              tax: item.tax,
              total: item.total,
            },
            { transaction },
          );
        } else {
          let stock = await Stock.findOne({
            where: {
              product_variant_id: item.product_variant_id,
              warehouse_id,
              shop_id,
            },
            transaction,
          });

          if (!stock) {
            stock = await Stock.create(
              {
                product_variant_id: item.product_variant_id,
                warehouse_id,
                quantity: 0,
                status: "INSTOCK",
                shop_id,
              },
              { transaction },
            );
          }

          const before = stock.quantity;
          const after = before + item.quantity;

          await stock.update({ quantity: after }, { transaction });

          await StockMovement.create(
            {
              stock_id: stock.stock_id,
              purchase_id,
              type: "IN",
              reason: "PURCHASE",
              before_qty: before,
              after_qty: after,
              quantity: item.quantity,
              reference_id: purchase_id,
              shop_id,
            },
            { transaction },
          );

          const newItem = await PurchaseItem.create(
            {
              purchase_id,
              product_variant_id: item.product_variant_id,
              quantity: item.quantity,
              tax_amount: item.tax_amount,
              discount: item.discount,
              tax: item.tax,
              total: item.total,
              shop_id,
            },
            { transaction },
          );

          incomingIds.push(newItem.purchase_item_id);
        }
      }

      /* =================================================
       CASE 3: DELETE REMOVED ITEMS
    ================================================= */

      const itemsToDelete = existingItems.filter(
        (item) => !incomingIds.includes(item.purchase_item_id),
      );
      for (const item of itemsToDelete) {
        const stock = await Stock.findOne({
          where: {
            product_variant_id: item.product_variant_id,
            warehouse_id: oldWarehouseId,
            shop_id,
          },
          transaction,
        });

        if (!stock) throw new Error("Stock not found");

        const before = stock.quantity;
        const after = before - item.quantity;

        await stock.update({ quantity: after }, { transaction });

        await StockMovement.create(
          {
            stock_id: stock.stock_id,
            purchase_id,
            type: "OUT",
            reason: "PURCHASE_DELETE",
            before_qty: before,
            after_qty: after,
            quantity: item.quantity,
            reference_id: purchase_id,
            shop_id,
          },
          { transaction },
        );

        await item.destroy({ transaction });
      }

      await transaction.commit();

      return purchase;
    } catch (error) {
      console.error(error);
      await transaction.rollback();
      throw error;
    }
  },

  getAllPurchaseInfo: async (offset = 0, limit = 10, shop_id) => {
    try {
      const purchases = await Purchase.findAll({
        limit,
        offset,
        distinct: true,
        where: { shop_id },
        attributes: [
          "purchase_id",
          "reference_no",
          "purchase_date",
          "status",
          "grand_total",
          "order_tax",
          "shipping",
          "discount",
          "paid_amount",
          "due_amount",
          "payment_status",
        ],

        include: [
          {
            model: Supplier,
            as: "supplier",
          },
          {
            model: PurchaseItem,
            as: "purchase_items",
            attributes: [
              "product_variant_id",
              "quantity",
              "discount",
              "tax",
              "tax_amount",
              "total",
            ],
            include: [
              {
                model: Product_Variant,
                as: "variant",
                attributes: ["skuCode", "variant_label", "price"],
                include: [
                  {
                    model: Product,
                    as: "product",
                    attributes: ["productName"],
                  },
                ],
              },
            ],
          },
        ],

        order: [["purchase_date", "DESC"]],
      });

      const totalPurchase = await Purchase.count({
        where: { shop_id },
      });

      const formattedPurchases = purchases.map((purchase) => {
        const purchaseJson = purchase.toJSON();

        return {
          purchase_id: purchaseJson.purchase_id,
          reference_no: purchaseJson.reference_no,
          purchase_date: purchaseJson.purchase_date,
          status: purchaseJson.status,
          grand_total: purchaseJson.grand_total,
          order_tax: purchaseJson.order_tax,
          shipping: purchaseJson.shipping,
          discount: purchaseJson.discount,
          paid_amount: purchaseJson.paid_amount,
          due_amount: purchaseJson.due_amount,
          payment_status: purchaseJson.payment_status,

          supplier: purchaseJson.supplier
            ? {
                ...purchaseJson.supplier,
              }
            : null,

          purchase_items: purchaseJson.purchase_items?.map((item) => ({
            purchase_item_id: item.purchase_item_id,
            product_variant_id: item.product_variant_id,
            quantity: item.quantity,
            discount: item.discount,
            tax: item.tax,
            tax_amount: item.tax_amount,
            total: item.total,

            variant: {
              skuCode: item.variant?.skuCode || null,
              variant_label: item.variant?.variant_label || null,
              price: item.variant?.price || null,
              productName: item.variant?.product?.productName || null,
            },
          })),
        };
      });

      return {
        data: formattedPurchases,
        count: totalPurchase,
      };
    } catch (error) {
      console.error("getAllPurchaseInfo error:", error);
      throw error;
    }
  },
  getPurchaseById: async (purchase_id, shop_id) => {
    try {
      const purchase = await Purchase.findOne({
        where: { purchase_id: purchase_id, shop_id },
        attributes: [
          "purchase_id",
          "reference_no",
          "purchase_date",
          "status",
          "grand_total",
          "warehouse_id",
          "order_tax",
          "shipping",
          "discount",
          "paid_amount",
          "due_amount",
          "payment_status",
        ],
        include: [
          {
            model: Supplier,
            as: "supplier",
          },
          {
            model: PurchaseItem,
            as: "purchase_items",
            attributes: [
              "purchase_item_id",
              "product_variant_id",
              "quantity",
              "discount",
              "tax",
              "tax_amount",
              "total",
            ],
            include: [
              {
                model: Product_Variant,
                as: "variant",
                attributes: ["skuCode", "variant_label", "price"],
                include: [
                  {
                    model: Product,
                    as: "product",
                    attributes: ["productName"],
                  },
                ],
              },
            ],
          },
        ],
      });

      if (!purchase) {
        throw new Error("Purchase not found");
      }

      const purchaseJson = purchase.toJSON();

      const formattedPurchase = {
        purchase_id: purchaseJson.purchase_id,
        reference_no: purchaseJson.reference_no,
        purchase_date: purchaseJson.purchase_date,
        status: purchaseJson.status,
        grand_total: purchaseJson.grand_total,
        warehouse_id: purchaseJson.warehouse_id,
        order_tax: purchaseJson.order_tax,
        shipping: purchaseJson.shipping,
        discount: purchaseJson.discount,
        paid_amount: purchaseJson.paid_amount,
        due_amount: purchaseJson.due_amount,
        payment_status: purchaseJson.payment_status,

        supplier: purchaseJson.supplier ? { ...purchaseJson.supplier } : null,

        purchase_items: purchaseJson.purchase_items?.map((item) => ({
          purchase_item_id: item.purchase_item_id,
          product_variant_id: item.product_variant_id,
          quantity: item.quantity,
          received_quantity: item.received_quantity,
          discount: item.discount,
          tax: item.tax,
          tax_amount: item.tax_amount,
          total: item.total,
          variant: {
            skuCode: item.variant?.skuCode || null,
            variant_label: item.variant?.variant_label || null,
            price: item.variant?.price || null,
            productName: item.variant?.product?.productName || null,
          },
        })),
      };

      return formattedPurchase;
    } catch (error) {
      console.error("getPurchaseById error:", error);
      throw error;
    }
  },
  createPaymentOfPurchase: async (purchase_id, paymentData, shop_id) => {
    const transaction = await sequelize.transaction();
    try {
      const { amount, payment_method, payment_date, note } = paymentData;

      if (!amount || amount <= 0) {
        throw new Error("Invalid payment amount");
      }

      const purchase = await Purchase.findOne({
        where: {
          purchase_id: purchase_id,
          shop_id,
        },
        transaction,
        lock: true,
      });

      if (!purchase) {
        throw new Error("Purchase not found");
      }

      if (
        Number(purchase.paid_amount) + amount >
        Number(purchase.grand_total)
      ) {
        throw new Error("Payment exceeds due amount");
      }

      const paid_amount = Number(purchase.paid_amount) + Number(amount);
      const due_amount = Number(purchase.grand_total) - paid_amount;

      let payment_status = "UNPAID";
      if (Number(paid_amount) === Number(purchase.grand_total)) {
        payment_status = "PAID";
      } else if (Number(paid_amount) > 0) {
        payment_status = "PARTIALLY_PAID";
      }

      const payment = await PurchasePayment.create(
        {
          purchase_id,
          amount,
          payment_method,
          payment_date,
          reference_no: purchase.reference_no,
          note,
          shop_id: shop_id,
        },
        { transaction },
      );

      await purchase.update(
        {
          paid_amount: paid_amount,
          due_amount: due_amount,
          payment_status: payment_status,
        },
        { transaction },
      );

      await transaction.commit();
      return payment;
    } catch (error) {
      await transaction.rollback();
      console.log(error);

      throw error;
    }
  },
};
