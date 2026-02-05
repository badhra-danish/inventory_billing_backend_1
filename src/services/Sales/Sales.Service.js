const { da } = require("zod/locales");
const sequelize = require("../../config/database");
const Sale = require("../../models/Sales/Sales.Model");
const { generateInvoiceNo } = require("../../utils/GenereteInvoiceNo");
const {
  SaleItem,
  Stock,
  Payment,
  Customer,
  Product_Variant,
  Product,
} = require("../../models/indexModel");
const { or } = require("sequelize");

exports.salesService = {
  createSale: async (salesData, shop_id) => {
    const transaction = await sequelize.transaction();
    try {
      const { invoiceNo } = await generateInvoiceNo(transaction);

      const {
        customer_id,
        date,
        order_tax,
        discount,
        shipping,
        status,
        salesItems,
      } = salesData;

      const summary = salesItems.reduce(
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

      const sale = await Sale.create(
        {
          customer_id,
          invoice_no: invoiceNo,
          sale_date: date,
          order_tax: orderTaxPercent,
          discount: orderDiscount,
          shipping: shippingCharge,
          status,
          sub_total: summary.items_total,
          grand_total: grand_total,
          paid_amount: 0,
          due_amount: grand_total,
          shop: shop_id,
          payment_status: "UNPAID",
        },
        { transaction },
      );

      const salesItemsToCreate = salesItems.map((s) => ({
        sale_id: sale.sale_id,
        product_variant_id: s.product_variant_id,
        quantity: s.quantity,
        discount: s.discount || 0,
        tax: s.tax || 0,
        tax_amount: s.tax_amount || 0,
        total: s.total,
        shop: shop_id,
      }));

      await SaleItem.bulkCreate(salesItemsToCreate, { transaction });

      //------stock decrease---//

      for (const item of salesItems) {
        const stock = await Stock.findOne({
          where: { product_variant_id: item.product_variant_id },
          transaction,
          lock: transaction.LOCK.UPDATE,
        });
        if (!stock) {
          throw new Error(
            `Stock not found for variant ${item.product_variant_id}`,
          );
        }
        if (stock.quantity < item.quantity) {
          throw new Error(
            `Insufficient stock for variant ${item.product_variant_id}`,
          );
        }

        await stock.update(
          {
            quantity: stock.quantity - item.quantity,
          },
          { transaction },
        );
      }
      await transaction.commit();
      return sale;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  createPaymentOfSale: async (sale_id, paymentData) => {
    const transaction = await sequelize.transaction();
    try {
      const { amount, payment_method, payment_date, note } = paymentData;

      if (!amount || amount <= 0) {
        throw new Error("Invalid payment amount");
      }

      const sale = await Sale.findByPk(sale_id, {
        transaction,
        lock: true,
      });

      if (!sale) {
        throw new Error("Sale not found");
      }

      if (Number(sale.paid_amount) + amount > Number(sale.grand_total)) {
        throw new Error("Payment exceeds due amount");
      }

      const paid_amount = Number(sale.paid_amount) + Number(amount);
      const due_amount = Number(sale.grand_total) - paid_amount;

      let payment_status = "UNPAID";
      if (Number(paid_amount) === Number(sale.grand_total)) {
        payment_status = "PAID";
      } else if (Number(paid_amount) > 0) {
        payment_status = "PARTIALLY_PAID";
      }

      const payment = await Payment.create(
        {
          sale_id,
          amount,
          payment_method,
          payment_date,
          reference_no: sale.invoice_no,
          note,
          shop: req.shop_id,
        },
        { transaction },
      );

      await sale.update(
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
  updateSale: async (sale_id, updatedData) => {
    const transaction = await sequelize.transaction();
    try {
      const {
        customer_id,
        date,
        order_tax,
        discount,
        shipping,
        status,
        sales_items,
      } = updatedData;

      const summary = sales_items.reduce(
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

      let payment_status = "UNPAID";
      const sale = await Sale.findByPk(sale_id, { transaction });
      if (Number(sale.paid_amount) === Number(sale.grand_total)) {
        payment_status = "PAID";
      } else if (Number(sale.paid_amount) > 0) {
        payment_status = "PARTIALLY_PAID";
      }

      await sale.update(
        {
          customer_id,
          sale_date: date,
          order_tax: orderTaxPercent,
          discount: orderDiscount,
          shipping: shippingCharge,
          status,
          sub_total: summary.items_total,
          grand_total: grand_total,
          paid_amount: sale.paid_amount,
          due_amount: grand_total - sale.paid_amount,
          payment_status: payment_status,
        },
        { where: { sale_id }, transaction },
      );

      const existingItems = await SaleItem.findAll({
        where: { sale_id },
        transaction,
      });

      const existingMap = new Map(
        existingItems.map((item) => [item.sales_item_id, item]),
      );
      console.log(existingMap);

      const incomingIds = [];

      for (const item of sales_items) {
        if (item.sales_item_id && existingMap.has(item.sales_item_id)) {
          const oldItem = existingMap.get(item.sales_item_id);
          const qtyDiff = oldItem.quantity - item.quantity;

          // Update stock
          await Stock.increment(
            { quantity: qtyDiff },
            {
              where: { product_variant_id: item.product_variant_id },
              transaction,
            },
          );

          // Update sale item
          await SaleItem.update(
            {
              product_variant_id: item.product_variant_id,
              quantity: item.quantity,
              discount: item.discount,
              tax: item.tax,
              tax_amount: item.tax_amount,
              total: item.total,
            },
            { where: { sales_item_id: item.sales_item_id }, transaction },
          );

          incomingIds.push(item.sales_item_id);
        } else {
          // Reduce stock
          await Stock.decrement(
            { quantity: item.quantity },
            {
              where: { product_variant_id: item.product_variant_id },
              transaction,
            },
          );

          const newItem = await SaleItem.create(
            {
              sale_id,
              product_variant_id: item.product_variant_id,
              quantity: item.quantity,
              tax_amount: item.tax_amount,
              discount: item.discount,
              tax: item.tax,
              total: item.total,
            },
            { transaction },
          );

          incomingIds.push(newItem.sales_item_id);
        }
      }

      const itemsToDelete = existingItems.filter(
        (item) => !incomingIds.includes(item.sales_item_id),
      );

      for (const item of itemsToDelete) {
        // Restore stock
        await Stock.increment(
          { quantity: item.quantity },
          {
            where: { product_variant_id: item.product_variant_id },
            transaction,
          },
        );

        await SaleItem.destroy({
          where: { sales_item_id: item.sales_item_id },
          transaction,
        });
      }

      await transaction.commit();
      return sale;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  updatePaymentOfSale: async (payment_id, paymentData) => {
    const transaction = await sequelize.transaction();
    try {
      const { amount, payment_method, payment_date, note } = paymentData;

      if (!amount || amount <= 0) {
        throw new Error("Invalid payment amount");
      }

      const payment = await Payment.findByPk(payment_id, { transaction });

      if (!payment) {
        throw new Error("Payment not found");
      }

      const sale = await Sale.findByPk(payment.sale_id, {
        transaction,
        lock: true,
      });

      if (!sale) {
        throw new Error("Sale not found");
      }

      const oldAmount = Number(payment.amount);
      const newAmount = Number(amount);

      const recalculatedPaid = Number(sale.paid_amount) - oldAmount + newAmount;

      if (recalculatedPaid > Number(sale.grand_total)) {
        throw new Error("Payment exceeds sale total");
      }

      const due_amount = Number(sale.grand_total) - recalculatedPaid;

      let payment_status = "UNPAID";
      if (recalculatedPaid === Number(sale.grand_total)) {
        payment_status = "PAID";
      } else if (recalculatedPaid > 0) {
        payment_status = "PARTIALLY_PAID";
      }

      await payment.update(
        {
          amount: newAmount,
          payment_method,
          payment_date,
          note,
        },
        { transaction },
      );

      await sale.update(
        {
          paid_amount: recalculatedPaid,
          due_amount,
          payment_status,
        },
        { transaction },
      );

      await transaction.commit();
      return payment;
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      throw error;
    }
  },
  deletePaymentOfSale: async (payment_id) => {
    const transaction = await sequelize.transaction();
    try {
      const payment = await Payment.findByPk(payment_id, { transaction });

      if (!payment) {
        throw new Error("Payment not found");
      }

      const sale = await Sale.findByPk(payment.sale_id, {
        transaction,
        lock: true,
      });

      if (!sale) {
        throw new Error("Sale not found");
      }

      const paymentAmount = Number(payment.amount);

      const paid_amount = Number(sale.paid_amount) - paymentAmount;

      const safePaidAmount = paid_amount < 0 ? 0 : paid_amount;

      const due_amount = Number(sale.grand_total) - safePaidAmount;

      let payment_status = "UNPAID";
      if (safePaidAmount === Number(sale.grand_total)) {
        payment_status = "PAID";
      } else if (safePaidAmount > 0) {
        payment_status = "PARTIALLY_PAID";
      }

      await payment.destroy({ transaction });

      await sale.update(
        {
          paid_amount: safePaidAmount,
          due_amount,
          payment_status,
        },
        { transaction },
      );

      await transaction.commit();

      return;
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      throw error;
    }
  },

  getAllPaymentBySale: async (sale_id) => {
    try {
      if (!sale_id) {
        throw new Error("Sale id is required");
      }

      const payments = await Payment.findAll({
        where: {
          sale_id: sale_id,
        },
        order: [["createdAt", "DESC"]],
      });

      return payments;
    } catch (error) {
      throw error;
    }
  },

  getAllSaleInfo: async (offset = 0, limit = 10, shop_id) => {
    try {
      const sales = await Sale.findAll({
        limit,
        offset,
        distinct: true,
        where: { shop_id },
        attributes: [
          "sale_id",
          "invoice_no",
          "sale_date",
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
            model: Customer,
            as: "customer",
            // attributes: ["firstName", "lastName", "phone",""],
          },
          {
            model: SaleItem,
            as: "sales_items",
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

        order: [["sale_date", "DESC"]],
      });

      const totalSale = await Sale.count();
      const formattedSales = sales.map((sale) => {
        const saleJson = sale.toJSON();

        return {
          sale_id: saleJson.sale_id,
          invoice_no: saleJson.invoice_no,
          sale_date: saleJson.sale_date,
          status: saleJson.status,
          grand_total: saleJson.grand_total,
          order_tax: saleJson.order_tax,
          shipping: saleJson.shipping,
          discount: saleJson.discount,
          paid_amount: saleJson.paid_amount,
          due_amount: saleJson.due_amount,
          payment_status: saleJson.payment_status,

          customer: saleJson.customer
            ? {
                // firstName: saleJson.customer.firstName,
                // lastName: saleJson.customer.lastName,
                // phone: saleJson.customer.phone,
                ...saleJson.customer,
              }
            : null,

          sales_items: saleJson.sales_items?.map((item) => ({
            sales_item_id: item.sales_item_id,
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
        data: formattedSales,
        count: totalSale,
      };
    } catch (error) {
      console.error("getAllSaleInfo error:", error);
      throw error;
    }
  },
  getAllInvoiceInfo: async (offset = 0, limit = 10, shop_id) => {
    try {
      const sales = await Sale.findAll({
        limit,
        offset,
        distinct: true,
        where: { shop_id },
        attributes: [
          "sale_id",
          "invoice_no",
          "sale_date",
          "grand_total",
          "paid_amount",
          "due_amount",
          "payment_status",
        ],

        include: [
          {
            model: Customer,
            as: "customer",
            attributes: ["firstName", "lastName"],
          },
        ],

        order: [["sale_date", "DESC"]],
      });

      const totalSale = await Sale.count();
      const formattedSales = sales.map((sale) => {
        const saleJson = sale.toJSON();

        return {
          sale_id: saleJson.sale_id,
          invoice_no: saleJson.invoice_no,
          sale_date: saleJson.sale_date,
          grand_total: saleJson.grand_total,
          paid_amount: saleJson.paid_amount,
          due_amount: saleJson.due_amount,
          payment_status: saleJson.payment_status,
          customer: saleJson.customer
            ? {
                firstName: saleJson.customer.firstName,
                lastName: saleJson.customer.lastName,
              }
            : null,
        };
      });

      return {
        data: formattedSales,
        count: totalSale,
      };
    } catch (error) {
      console.error("getAllSaleInfo error:", error);
      throw error;
    }
  },
  getSaleById: async (sale_id) => {
    try {
      const sale = await Sale.findOne({
        where: { sale_id },

        attributes: [
          "sale_id",
          "invoice_no",
          "sale_date",
          "sub_total",
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
            model: Customer,
            as: "customer",
          },
          {
            model: SaleItem,
            as: "sales_items",
            attributes: [
              "sales_item_id",
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

      if (!sale) {
        throw new Error("Sale not found");
      }

      const saleJson = sale.toJSON();

      const formattedSale = {
        sale_id: saleJson.sale_id,
        invoice_no: saleJson.invoice_no,
        sale_date: saleJson.sale_date,
        status: saleJson.status,
        sub_total: Number(saleJson.sub_total),
        grand_total: Number(saleJson.grand_total),
        order_tax: Number(saleJson.order_tax),
        shipping: Number(saleJson.shipping),
        discount: Number(saleJson.discount),
        paid_amount: Number(saleJson.paid_amount),
        due_amount: Number(saleJson.due_amount),
        payment_status: saleJson.payment_status,

        customer: saleJson.customer ? { ...saleJson.customer } : null,

        sales_items: saleJson.sales_items?.map((item) => ({
          sales_item_id: item.sales_item_id,
          product_variant_id: item.product_variant_id,
          quantity: Number(item.quantity),
          discount: Number(item.discount),
          tax: Number(item.tax),
          tax_amount: Number(item.tax_amount),
          total: Number(item.total),
          variant: {
            skuCode: item.variant?.skuCode || null,
            variant_label: item.variant?.variant_label || null,
            price: Number(item.variant?.price) || null,
            productName: item.variant?.product?.productName || null,
          },
        })),
      };

      return formattedSale;
    } catch (error) {
      console.error("getSaleById error:", error);
      throw error;
    }
  },
};
