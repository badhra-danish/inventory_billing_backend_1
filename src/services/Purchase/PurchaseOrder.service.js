const { date } = require("zod");
const sequelize = require("../../config/database");
const {
  PurchaseOrder,
  PurchaseOrderItem,
  Product_Variant,
  Supplier,
  Warehouse,
  Product,
} = require("../../models/indexModel");
const { generatePONumber } = require("../../utils/GeneratePoNo");
const { it, tr } = require("zod/locales");

exports.purchaseOrderService = {
  createPurchaseOrder: async (purchaseOrderData, shop_id) => {
    const transaction = await sequelize.transaction();

    try {
      const {
        supplier_id,
        po_date,
        status = "PENDING",
        warehouse_id,
        order_tax = 0,
        discount = 0,
        shipping = 0,
        purchaseOrderItems,
      } = purchaseOrderData;

      // =============================
      // BASIC VALIDATION
      // =============================

      if (!supplier_id) throw new Error("Supplier is required");
      if (!warehouse_id) throw new Error("Warehouse is required");
      if (!po_date) throw new Error("PO Date is required");
      if (!Array.isArray(purchaseOrderItems) || purchaseOrderItems.length === 0)
        throw new Error("At least one purchase item is required");

      // =============================
      // CALCULATE SUMMARY (SAFE)
      // =============================
      const summary = purchaseOrderItems.reduce(
        (acc, item) => {
          const itemSubTotal = item.price * item.quantity;
          acc.sub_total += itemSubTotal;
          acc.item_tax += item.tax_amount || 0;
          acc.item_discount += item.discount || 0;
          acc.items_total += item.total;
          return acc;
        },
        { sub_total: 0, item_tax: 0, item_discount: 0, items_total: 0 },
      );

      const orderTaxPercent = order_tax || 0;
      const orderDiscount = discount || 0;
      const shippingCharge = shipping || 0;

      const orderTaxAmount = (summary.items_total * orderTaxPercent) / 100;

      const grand_total =
        summary.items_total + orderTaxAmount + shippingCharge - orderDiscount;

      // =============================
      // GENERATE PO NUMBER
      // =============================

      const po_number = await generatePONumber(transaction);

      // =============================
      // CREATE PURCHASE ORDER
      // =============================

      const purchaseOrder = await PurchaseOrder.create(
        {
          supplier_id,
          po_number,
          warehouse_id,
          po_date,
          status,
          order_tax: orderTaxPercent,
          discount_amt: orderDiscount,
          shipping: shippingCharge,
          sub_total: Number(summary.sub_total.toFixed(2)),
          grand_total: Number(grand_total.toFixed(2)),
          shop_id,
        },
        { transaction },
      );

      // =============================
      // ATTACH PURCHASE ORDER ID
      // =============================

      const finalItems = purchaseOrderItems.map((item) => ({
        product_variant_id: item.product_variant_id,
        unit_price: Number(item.price),
        quantity: Number(item.quantity),
        received_quantity: Number(item.received_quantity),
        tax: Number(item.tax),
        tax_amount: Number(item.tax_amount),
        total_amount: Number(item.total),
        discount: Number(item.discount),
        purchase_order_id: purchaseOrder.purchase_order_id,
        shop_id: shop_id,
      }));

      await PurchaseOrderItem.bulkCreate(finalItems, {
        transaction,
      });

      // =============================
      // COMMIT
      // =============================

      await transaction.commit();

      return await PurchaseOrder.findOne({
        where: {
          purchase_order_id: purchaseOrder.purchase_order_id,
          shop_id,
        },
        include: ["items", "supplier", "warehouse"],
      });
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  updatePurchaseOrder: async (
    purchase_order_id,
    purchaseOrderData,
    shop_id,
  ) => {
    const transaction = await sequelize.transaction();

    try {
      const {
        supplier_id,
        po_date,
        warehouse_id,
        status,
        order_tax,
        discount,
        shipping,
        purchase_order_items,
      } = purchaseOrderData;

      if (!supplier_id) throw new Error("Supplier is required");
      if (!po_date) throw new Error("PO Date is required");

      const summary = purchase_order_items.reduce(
        (acc, item) => {
          const itemSubTotal = item.price * item.quantity;
          acc.sub_total += itemSubTotal;
          acc.item_tax += item.tax_amount || 0;
          acc.item_discount += item.discount || 0;
          acc.items_total += item.total;
          return acc;
        },
        { sub_total: 0, item_tax: 0, item_discount: 0, items_total: 0 },
      );

      const orderTaxPercent = order_tax || 0;
      const orderDiscount = discount || 0;
      const shippingCharge = shipping || 0;

      const orderTaxAmount = (summary.items_total * orderTaxPercent) / 100;

      const grand_total =
        summary.items_total + orderTaxAmount + shippingCharge - orderDiscount;

      const purchaseOrder = await PurchaseOrder.findOne({
        where: { purchase_order_id, shop_id },
        transaction,
      });

      if (!purchaseOrder) throw new Error("Purchase Order not found");

      await purchaseOrder.update(
        {
          supplier_id,
          po_date,
          warehouse_id,
          order_tax: orderTaxPercent,
          discount: orderDiscount,
          shipping: shippingCharge,
          sub_total: summary.sub_total,
          grand_total,
          status,
        },
        { transaction },
      );

      const existingItems = await PurchaseOrderItem.findAll({
        where: { purchase_order_id, shop_id },
        transaction,
      });

      const existingMap = new Map(
        existingItems.map((item) => [item.purchase_order_item_id, item]),
      );

      const incomingIds = [];

      for (const item of purchase_order_items) {
        if (
          item.purchase_order_item_id &&
          existingMap.has(item.purchase_order_item_id)
        ) {
          const oldItem = existingMap.get(item.purchase_order_item_id);

          await oldItem.update(
            {
              product_variant_id: item.product_variant_id,
              quantity: item.quantity,
              discount: item.discount,
              unit_price: item.price,
              tax: item.tax,
              tax_amount: item.tax_amount,
              total_amount: item.total,
            },
            { transaction },
          );

          incomingIds.push(item.purchase_order_item_id);
        } else {
          const newItem = await PurchaseOrderItem.create(
            {
              purchase_order_id,
              product_variant_id: item.product_variant_id,
              quantity: item.quantity,
              unit_price: item.price,
              tax_amount: item.tax_amount,
              discount: item.discount,
              tax: item.tax,
              total_amount: item.total,
              shop_id,
            },
            { transaction },
          );

          incomingIds.push(newItem.purchase_order_item_id);
        }
      }

      const itemsToDelete = existingItems.filter(
        (item) => !incomingIds.includes(item.purchase_order_item_id),
      );

      for (const item of itemsToDelete) {
        await item.destroy({ transaction });
      }

      await transaction.commit();
      return purchaseOrder;
    } catch (e) {
      console.log(e);

      await transaction.rollback();
      throw e;
    }
  },

  getAllPurchaseOrder: async (offset = 0, limit = 10, shop_id) => {
    try {
      const { count, rows } = await PurchaseOrder.findAndCountAll({
        where: { shop_id },

        limit: Number(limit),
        offset: Number(offset),

        order: [["createdAt", "DESC"]],

        distinct: true,

        include: [
          {
            model: Supplier,
            as: "supplier",
            attributes: [
              "supplierID",
              "firstName",
              "lastName",
              "email",
              "phone",
            ],
          },
          {
            model: Warehouse,
            as: "warehouse",
            attributes: ["warehouse_id", "warehouseName"],
          },
          {
            model: PurchaseOrderItem,
            as: "items",
            include: [
              {
                model: Product_Variant,
                as: "variant",
                attributes: [
                  "product_variant_id",
                  "skuCode",
                  "price",
                  "variant_label",
                ],
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

      return {
        data: rows,
        count: count,
      };
    } catch (error) {
      console.error("Error fetching purchase orders:", error);
      throw error;
    }
  },
  getPurchaseOrderByID: async (shop_id, purchase_order_id) => {
    try {
      const purchaseOrder = await PurchaseOrder.findOne({
        where: { shop_id, purchase_order_id },
        subQuery: false,
        distinct: true,
        include: [
          {
            model: Supplier,
            as: "supplier",
            attributes: [], // keep empty if you don't need supplier fields
          },
          {
            model: Warehouse,
            as: "warehouse",
            attributes: [], // keep empty if not needed
          },
          {
            model: PurchaseOrderItem,
            as: "items",
            attributes: [
              "purchase_order_item_id",
              "purchase_order_id",
              "product_variant_id",
              "quantity",
              "received_quantity",
              "unit_price",
              "tax",
              "tax_amount",
              "discount",
              "total_amount",
              "shop_id",
              "createdAt",
              "updatedAt",
            ],
            include: [
              {
                model: Product_Variant,
                as: "variant",
                attributes: ["product_variant_id", "skuCode", "variant_label"],
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

      const formatPurchaseOrder = (purchaseOrder) => {
        const result = purchaseOrder.toJSON();

        result.items = result.items.map(({ variant, ...item }) => ({
          ...item,
          product_variant_name: variant?.variant_label || null,
          skuCode: variant?.skuCode || null,
          productName: variant?.product?.productName || null,
        }));

        return result;
      };
      return formatPurchaseOrder(purchaseOrder);
    } catch (error) {
      console.error("Error fetching purchase order:", error);
      throw error;
    }
  },
  getPurchaseOrderNO: async (shop_id) => {
    try {
      const purchaseOrderNo = await PurchaseOrder.findAll({
        where: { shop_id },
        attributes: ["purchase_order_id", "po_number"],
      });

      return purchaseOrderNo;
    } catch (error) {
      console.error(error);
      throw error;
    }
  },
};
