const { da } = require("zod/locales");
const sequelize = require("../../config/database");
const Sale = require("../../models/Sales/Sales.Model");
const { generateInvoiceNo } = require("../../utils/GenereteInvoiceNo");
const { SaleItem } = require("../../models/indexModel");

exports.salesService = {
  createSale: async (salesData) => {
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

      const sale = await Sale.create(
        {
          customer_id,
          invoice_no: invoiceNo,
          sale_date: date,
          order_tax,
          discount,
          shipping,
          status,
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
      }));

      await SaleItem.bulkCreate(salesItemsToCreate, { transaction });

      await transaction.commit();

      return sale;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
};
