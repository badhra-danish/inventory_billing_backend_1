const { date } = require("zod");
const sequelize = require("../../config/database");
const {
  PurchaseOrder,
  PurchaseOrderItem,
  Product_Variant,
  Supplier,
  Warehouse,
} = require("../../models/indexModel");
const { generatePONumber } = require("../../utils/GeneratePoNo");

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

      // -----------------------------
      // BASIC VALIDATION
      // -----------------------------

      if (!supplier_id) {
        throw new Error("Supplier is required");
      }

      if (!warehouse_id) {
        throw new Error("Warehouse is required");
      }

      if (!po_date) {
        throw new Error("PO Date is required");
      }

      if (!purchaseOrderItems || purchaseOrderItems.length === 0) {
        throw new Error("At least one purchase item is required");
      }

      // -----------------------------
      // CALCULATE SUMMARY
      // -----------------------------

      const summary = purchaseOrderItems.reduce(
        (acc, item) => {
          if (!item.product_variant_id) {
            throw new Error("Product variant is required");
          }

          if (!item.quantity || item.quantity <= 0) {
            throw new Error("Quantity must be greater than 0");
          }

          if (!item.price || item.price < 0) {
            throw new Error("Unit price must be valid");
          }

          const itemSubTotal = Number(item.price) * Number(item.quantity);
          const taxAmount = Number(item.tax_amount || 0);
          const discountAmount = Number(item.discount || 0);

          const total = itemSubTotal + taxAmount - discountAmount;

          acc.sub_total += itemSubTotal;
          acc.item_tax += taxAmount;
          acc.item_discount += discountAmount;
          acc.items_total += total;

          return acc;
        },
        {
          sub_total: 0,
          item_tax: 0,
          item_discount: 0,
          items_total: 0,
        },
      );

      const orderTaxAmount = (summary.items_total * Number(order_tax)) / 100;

      const grand_total =
        summary.items_total +
        orderTaxAmount +
        Number(shipping) -
        Number(discount);

      // -----------------------------
      // GENERATE PO NUMBER (MUST BE AWAIT)
      // -----------------------------

      const po_number = await generatePONumber(transaction);

      // -----------------------------
      // CREATE PURCHASE ORDER
      // -----------------------------

      const purchaseOrder = await PurchaseOrder.create(
        {
          supplier_id,
          po_number,
          warehouse_id,
          po_date,
          status,
          order_tax,
          discount_amt: discount,
          shipping,
          sub_total: summary.sub_total,
          grand_total,
          shop_id,
        },
        { transaction },
      );

      // -----------------------------
      // PREPARE ITEMS
      // -----------------------------

      const purchaseOrdersItems = purchaseOrderItems.map((item) => ({
        purchase_order_id: purchaseOrder.purchase_order_id,
        product_variant_id: item.product_variant_id,
        quantity: item.quantity,
        received_quantity: 0,
        unit_price: item.price,
        tax: item.tax || 0,
        tax_amount: item.tax_amount || 0,
        discount: item.discount || 0,
        total_amount:
          item.price * item.quantity +
          (item.tax_amount || 0) -
          (item.discount || 0),
        shop_id,
      }));

      await PurchaseOrderItem.bulkCreate(purchaseOrdersItems, { transaction });

      // -----------------------------
      // COMMIT
      // -----------------------------

      await transaction.commit();

      return await PurchaseOrder.findOne({
        where: {
          purchase_order_id: purchaseOrder.purchase_order_id,
        },
        include: ["items", "supplier", "warehouse"],
      });
    } catch (error) {
      await transaction.rollback();
      console.log(error);

      throw error;
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
            attributes: ["supplierID", "firstName", "lastName", "email"],
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
                attributes: ["product_variant_id", "skuCode", "price"],
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
};
