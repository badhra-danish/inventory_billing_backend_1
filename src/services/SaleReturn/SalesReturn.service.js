const sequelize = require("../../config/database");
const {
  SaleItem,
  Sale,
  Stock,
  StockMovement,
  SaleReturn,
  SaleReturnItems,
  Customer,
  Product_Variant,
  Product,
  Warehouse,
} = require("../../models/indexModel");

exports.saleReturnService = {
  createSaleReturn: async (returnData, shop_id) => {
    const transaction = await sequelize.transaction();
    try {
      const {
        srn_no,
        sale_return_date,
        status,
        payment_status,
        sale_id,
        salesReturnItems,
        order_tax = 0,
        discount = 0,
        shipping = 0,
      } = returnData;

      // ---------------------------
      // Basic Validation
      // ---------------------------
      if (!salesReturnItems || salesReturnItems.length === 0) {
        throw new Error("Return items are required");
      }

      // ---------------------------
      // Check Sale Exists
      // ---------------------------
      const sale = await Sale.findOne({
        where: { sale_id, shop_id },
        transaction,
      });

      if (!sale) {
        throw new Error("Sale not found");
      }

      // ---------------------------
      // Create Sale Return Header
      // ---------------------------
      const saleReturn = await SaleReturn.create(
        {
          srn_no,
          sale_return_date,
          sale_id,
          status,
          payment_status,
          total_amount: 0,
          shop_id,
        },
        { transaction },
      );

      let grandTotal = 0;
      const returnItemsData = [];

      // ---------------------------
      // Process Each Return Item
      // ---------------------------
      for (const item of salesReturnItems) {
        // if (!item.sale_item_id) {
        //   throw new Error("Sale item id is required");
        // }

        // ---------------------------
        // Find Original Sale Item
        // ✅ Never modify this quantity
        // ---------------------------
        const saleItem = await SaleItem.findOne({
          where: { sales_item_id: item.sale_item_id, shop_id },
          transaction,
        });
        const variant = await Product_Variant.findOne({
          where: {
            product_variant_id: item.product_variant_id,
            shop_id,
          },
          attributes: ["variant_label"],
          include: [
            {
              model: Product,
              as: "product", // make sure this matches your association
              attributes: ["productName"], // correct field name
            },
          ],
          transaction,
        });
        console.log(variant);

        if (!saleItem) {
          throw new Error(
            `Sale item not found for variant: ${variant.product?.productName}-${variant.variant_label || "Unknown Variant"}`,
          );
        }

        // ---------------------------
        // Check Previous Returns
        // ---------------------------
        const previousReturned = await SaleReturnItems.sum("return_quantity", {
          where: { sale_item_id: item.sale_item_id },
          transaction,
        });

        const alreadyReturned = previousReturned || 0;
        const availableQty = saleItem.quantity - alreadyReturned;

        if (item.return_qty > availableQty) {
          throw new Error(
            `Return quantity (${item.return_qty}) exceeds available quantity (${availableQty}) for item ${item.sale_item_id}`,
          );
        }

        // ✅ DO NOT update saleItem.quantity — original qty must stay intact

        // ---------------------------
        // Calculate Return Item Total
        // ---------------------------
        const subTotal = item.price * item.return_qty;
        const taxAmount = (subTotal * (item.tax || 0)) / 100;
        const total = subTotal + taxAmount - (item.discount || 0);
        grandTotal += total;

        returnItemsData.push({
          sale_return_id: saleReturn.sale_return_id,
          sale_item_id: item.sale_item_id,
          product_variant_id: item.product_variant_id,
          warehouse_id: item.warehouse_id,
          return_quantity: item.return_qty,
          price: item.price,
          discount: item.discount || 0,
          tax: item.tax || 0,
          sub_total: total,
          shop_id: shop_id,
        });

        // ---------------------------
        // Update Stock
        // ---------------------------
        let stock = await Stock.findOne({
          where: {
            product_variant_id: item.product_variant_id,
            warehouse_id: item.warehouse_id,
            shop_id,
          },
          transaction,
        });

        if (!stock) {
          stock = await Stock.create(
            {
              product_variant_id: item.product_variant_id,
              warehouse_id: item.warehouse_id,
              quantity: item.return_qty,
              shop_id,
              status: "INSTOCK",
            },
            { transaction },
          );
        } else {
          const stockBefore = stock.quantity;
          const stockAfter = stock.quantity + item.return_qty;

          await stock.update(
            {
              quantity: stockAfter,
              status: stockAfter > 0 ? "INSTOCK" : "OUTSTOCK",
            },
            { transaction },
          );

          await StockMovement.create(
            {
              stock_id: stock.stock_id,
              type: "IN",
              reason: "SALE_RETURN",
              quantity: item.return_qty,
              before_qty: stockBefore,
              after_qty: stockAfter,
              shop_id,
            },
            { transaction },
          );
        }
      }

      // ---------------------------
      // Insert Return Items
      // ---------------------------
      await SaleReturnItems.bulkCreate(returnItemsData, { transaction });

      // ---------------------------
      // Final Return Total
      // ---------------------------
      const returnFinalTotal =
        grandTotal + (grandTotal * order_tax) / 100 - discount + shipping;

      await saleReturn.update(
        { total_amount: returnFinalTotal },
        { transaction },
      );

      // ---------------------------
      // ✅ Sync Sale Table After Return
      // Recalculate grand_total, due_amount, payment_status
      // ---------------------------

      // Step 1: Get total amount returned so far for this sale (including current return)
      const totalReturnedRaw = await SaleReturn.sum("total_amount", {
        where: { sale_id },
        transaction,
      });
      const totalReturnedAmount = totalReturnedRaw || 0;

      // Step 2: Recalculate effective grand total
      const effectiveGrandTotal = sale.grand_total - totalReturnedAmount;

      // Step 3: Recalculate effective due amount (never go below 0)
      const effectiveDueAmount = Math.max(
        effectiveGrandTotal - sale.paid_amount,
        0,
      );

      // Step 4: Determine new payment status
      let effectivePaymentStatus;
      if (sale.paid_amount <= 0) {
        effectivePaymentStatus = "UNPAID";
      } else if (sale.paid_amount >= effectiveGrandTotal) {
        effectivePaymentStatus = "PAID";
      } else {
        effectivePaymentStatus = "PARTIALLY_PAID";
      }

      // Step 5: ✅ Update Sale table with new calculated values
      await sale.update(
        {
          grand_total: effectiveGrandTotal,
          due_amount: effectiveDueAmount,
          payment_status: effectivePaymentStatus,
        },
        { transaction },
      );

      // ---------------------------
      // Commit Transaction
      // ---------------------------
      await transaction.commit();

      return {
        saleReturn,
        updatedSale: {
          sale_id,
          total_returned_amount: totalReturnedAmount,
          effective_grand_total: effectiveGrandTotal,
          effective_due_amount: effectiveDueAmount,
          effective_payment_status: effectivePaymentStatus,
          paid_amount: sale.paid_amount,
        },
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  updateSaleReturn: async (sale_return_id, returnData, shop_id) => {
    const transaction = await sequelize.transaction();
    try {
      const {
        srn_no,
        sale_return_date,
        status,
        payment_status,
        salesReturnItems,
        order_tax = 0,
        discount = 0,
        shipping = 0,
      } = returnData;

      if (!salesReturnItems || salesReturnItems.length === 0) {
        throw new Error("Return items are required");
      }

      // ---------------------------
      // Get Existing Sale Return
      // ---------------------------
      const saleReturn = await SaleReturn.findOne({
        where: { sale_return_id, shop_id },
        transaction,
      });

      if (!saleReturn) {
        throw new Error("Sale Return not found");
      }

      const sale_id = saleReturn.sale_id;

      const sale = await Sale.findOne({
        where: { sale_id, shop_id },
        transaction,
      });

      // ---------------------------
      // STEP 1: Reverse OLD RETURN EFFECT
      // ---------------------------
      const oldItems = await SaleReturnItems.findAll({
        where: { sale_return_id },
        transaction,
      });

      for (const item of oldItems) {
        const stock = await Stock.findOne({
          where: {
            product_variant_id: item.product_variant_id,
            warehouse_id: item.warehouse_id,
            shop_id,
          },
          transaction,
        });

        if (stock) {
          const before = stock.quantity;
          const after = stock.quantity - item.return_quantity;

          await stock.update(
            {
              quantity: after,
              status: after > 0 ? "INSTOCK" : "OUTSTOCK",
            },
            { transaction },
          );

          await StockMovement.create(
            {
              stock_id: stock.stock_id,
              type: "OUT",
              reason: "SALE_RETURN_UPDATE_REVERSE",
              quantity: item.return_quantity,
              before_qty: before,
              after_qty: after,
              shop_id,
            },
            { transaction },
          );
        }
      }

      // ---------------------------
      // STEP 2: Delete Old Items
      // ---------------------------
      await SaleReturnItems.destroy({
        where: { sale_return_id },
        transaction,
      });

      // ---------------------------
      // STEP 3: Process NEW Items
      // ---------------------------
      let grandTotal = 0;
      const returnItemsData = [];

      for (const item of salesReturnItems) {
        const saleItem = await SaleItem.findOne({
          where: { sales_item_id: item.sale_item_id, shop_id },
          transaction,
        });

        if (!saleItem) {
          throw new Error(`Sale item not found`);
        }

        const previousReturned = await SaleReturnItems.sum("return_quantity", {
          where: { sale_item_id: item.sale_item_id },
          transaction,
        });

        const availableQty = saleItem.quantity - (previousReturned || 0);

        if (item.return_qty > availableQty) {
          throw new Error("Return qty exceeds available qty");
        }

        const subTotal = item.price * item.return_qty;
        const taxAmount = (subTotal * (item.tax || 0)) / 100;
        const total = subTotal + taxAmount - (item.discount || 0);

        grandTotal += total;

        returnItemsData.push({
          sale_return_id,
          sale_item_id: item.sale_item_id,
          product_variant_id: item.product_variant_id,
          warehouse_id: item.warehouse_id,
          return_quantity: item.return_qty,
          price: item.price,
          discount: item.discount || 0,
          tax: item.tax || 0,
          sub_total: total,
          shop_id,
        });

        // ---------------------------
        // Update Stock AGAIN
        // ---------------------------
        let stock = await Stock.findOne({
          where: {
            product_variant_id: item.product_variant_id,
            warehouse_id: item.warehouse_id,
            shop_id,
          },
          transaction,
        });

        if (!stock) {
          stock = await Stock.create(
            {
              product_variant_id: item.product_variant_id,
              warehouse_id: item.warehouse_id,
              quantity: item.return_qty,
              shop_id,
              status: "INSTOCK",
            },
            { transaction },
          );
        } else {
          const before = stock.quantity;
          const after = stock.quantity + item.return_qty;

          await stock.update(
            {
              quantity: after,
              status: "INSTOCK",
            },
            { transaction },
          );

          await StockMovement.create(
            {
              stock_id: stock.stock_id,
              type: "IN",
              reason: "SALE_RETURN_UPDATE",
              quantity: item.return_qty,
              before_qty: before,
              after_qty: after,
              shop_id,
            },
            { transaction },
          );
        }
      }

      // ---------------------------
      // Insert New Items
      // ---------------------------
      await SaleReturnItems.bulkCreate(returnItemsData, { transaction });

      const finalTotal =
        grandTotal + (grandTotal * order_tax) / 100 - discount + shipping;

      await saleReturn.update(
        {
          srn_no,
          sale_return_date,
          status,
          payment_status,
          total_amount: finalTotal,
        },
        { transaction },
      );

      // ---------------------------
      // STEP 4: Recalculate Sale
      // ---------------------------
      const totalReturned = await SaleReturn.sum("total_amount", {
        where: { sale_id },
        transaction,
      });

      const effectiveGrandTotal = sale.grand_total - (totalReturned || 0);

      const effectiveDueAmount = Math.max(
        effectiveGrandTotal - sale.paid_amount,
        0,
      );

      let paymentStatus;
      if (sale.paid_amount <= 0) paymentStatus = "UNPAID";
      else if (sale.paid_amount >= effectiveGrandTotal) paymentStatus = "PAID";
      else paymentStatus = "PARTIALLY_PAID";

      await sale.update(
        {
          grand_total: effectiveGrandTotal,
          due_amount: effectiveDueAmount,
          payment_status: paymentStatus,
        },
        { transaction },
      );

      await transaction.commit();

      return {
        message: "Sale Return Updated Successfully",
        saleReturn,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  getAllSaleReturns: async (offset = 0, limit = 10, shop_id) => {
    try {
      // ---------------------------
      // Fetch Sale Returns
      // ---------------------------
      // ---------------------------
      // Fetch Sale Returns
      // ---------------------------
      const { rows: saleReturns, count: totalCount } =
        await SaleReturn.findAndCountAll({
          limit,
          offset,
          distinct: true,
          col: "sale_return_id",
          include: [
            {
              model: Sale,
              as: "sale",
              where: { shop_id },
              required: true,
              attributes: [
                "sale_id",
                "customer_id",
                "invoice_no",
                "sale_date",
                "grand_total",
                "paid_amount",
                "due_amount",
                "payment_status",
                "order_tax",
                "shipping",
                "discount",
              ],
              include: [
                {
                  model: Customer,
                  as: "customer",
                  required: false,
                  attributes: [
                    "customer_id",
                    "firstName",
                    "lastName",
                    "email",
                    "phone",
                    "address",
                  ],
                },
              ],
            },
            {
              model: SaleReturnItems,
              as: "items",
              required: false,
              attributes: [
                "sale_return_item_id",
                "sale_item_id",
                "product_variant_id",
                "warehouse_id",
                "return_quantity",
                "price",
                "discount",
                "tax",
                "sub_total",
              ],
              include: [
                {
                  model: SaleItem,
                  as: "sale_item",
                  required: false,
                  attributes: [
                    "sales_item_id",
                    "quantity",
                    "tax",
                    "discount",
                    "total",
                  ],
                },
                {
                  model: Product_Variant,
                  as: "variant",
                  required: false,
                  attributes: [
                    "product_variant_id",
                    "skuCode",
                    "variant_label",
                    "price",
                  ],
                  include: [
                    {
                      model: Product,
                      as: "product",
                      required: false,
                      attributes: ["product_id", "productName"],
                    },
                  ],
                },
              ],
            },
          ],

          order: [["sale_return_date", "DESC"]],
        });

      // ---------------------------
      // Format Response
      // ---------------------------
      const formattedReturns = saleReturns.map((saleReturn) => {
        const sr = saleReturn.toJSON();

        const totalAmount = Number(sr.total_amount) || 0;
        const grandTotal = Number(sr.sale?.grand_total) || 0;
        const paidAmount = Number(sr.sale?.paid_amount) || 0;
        const dueAmount = Number(sr.sale?.due_amount) || 0;
        const orderTax = Number(sr.sale?.order_tax) || 0;
        const shipping = Number(sr.sale?.shipping) || 0;
        const saleDiscount = Number(sr.sale?.discount) || 0;

        const toFloat = (val) => parseFloat(Number(val || 0).toFixed(2));

        // Per Item Calculations
        const returnItems = (sr.items || []).map((item) => {
          const price = Number(item.price) || 0;
          const returnQty = Number(item.return_quantity) || 0;
          const tax = Number(item.tax) || 0;
          const discount = Number(item.discount) || 0;
          const originalQty = Number(item.sale_item?.quantity) || 0;

          const subTotal = price * returnQty;
          const taxAmount = (subTotal * tax) / 100;
          const effectiveTotal = subTotal + taxAmount - discount;
          const remainingQty = Math.max(originalQty - returnQty, 0);
          const isFullyReturned = remainingQty === 0;

          return {
            sale_return_item_id: item.sale_return_item_id,
            sale_item_id: item.sale_item_id,
            product_variant_id: item.product_variant_id,
            warehouse_id: item.warehouse_id,

            product_id: item.variant?.product?.product_id || null,
            product_name: item.variant?.product?.productName || null,
            sku_code: item.variant?.skuCode || null,
            variant_label: item.variant?.variant_label || null,
            unit_price: toFloat(price),

            original_sold_qty: originalQty,
            return_quantity: returnQty,
            remaining_qty: remainingQty,
            is_fully_returned: isFullyReturned,

            discount: toFloat(discount),
            tax: toFloat(tax),
            tax_amount: toFloat(taxAmount),
            sub_total: toFloat(effectiveTotal),
          };
        });

        // Summary Totals
        const totalReturnQty = returnItems.reduce(
          (sum, i) => sum + i.return_quantity,
          0,
        );
        const totalTaxAmount = returnItems.reduce(
          (sum, i) => sum + i.tax_amount,
          0,
        );
        const totalDiscount = returnItems.reduce(
          (sum, i) => sum + i.discount,
          0,
        );
        const totalItemsCount = returnItems.length;
        const fullyReturnedCount = returnItems.filter(
          (i) => i.is_fully_returned,
        ).length;

        return {
          // ---------------------------
          // ✅ Return Header — payment_status added
          // ---------------------------
          sale_return_id: sr.sale_return_id,
          srn_no: sr.srn_no,
          sale_return_date: sr.sale_return_date,
          status: sr.status,
          payment_status: sr.payment_status ?? null, // ✅ from SaleReturn table
          total_amount: toFloat(totalAmount),

          // Summary
          summary: {
            total_items_count: totalItemsCount,
            fully_returned_count: fullyReturnedCount,
            total_return_qty: totalReturnQty,
            total_tax_amount: toFloat(totalTaxAmount),
            total_discount: toFloat(totalDiscount),
            net_return_amount: toFloat(totalAmount),
          },

          // Original Sale
          sale: sr.sale
            ? {
                sale_id: sr.sale.sale_id,
                invoice_no: sr.sale.invoice_no,
                sale_date: sr.sale.sale_date,
                grand_total: toFloat(grandTotal),
                paid_amount: toFloat(paidAmount),
                due_amount: toFloat(dueAmount),
                payment_status: sr.sale.payment_status, // ✅ sale payment status
                order_tax: toFloat(orderTax),
                shipping: toFloat(shipping),
                discount: toFloat(saleDiscount),
              }
            : null,

          // Customer
          customer: sr.sale?.customer
            ? {
                customer_id: sr.sale.customer.customer_id,
                full_name:
                  `${sr.sale.customer.firstName ?? ""} ${sr.sale.customer.lastName ?? ""}`.trim(),
                email: sr.sale.customer.email || null,
                phone: sr.sale.customer.phone || null,
                address: sr.sale.customer.address || null,
              }
            : null,

          // Return Items
          return_items: returnItems,
        };
      });

      return {
        data: formattedReturns,
        count: totalCount,
      };
    } catch (error) {
      console.error("getAllSaleReturns error:", error);
      throw error;
    }
  },
  getSalereturnById: async (sale_return_id, shop_id) => {
    try {
      const saleReturn = await SaleReturn.findOne({
        where: { sale_return_id, shop_id },
        include: [
          {
            model: Sale,
            as: "sale",
            where: { shop_id },
            required: true,
            attributes: [
              "sale_id",
              "customer_id",
              "invoice_no",
              "sale_date",
              "grand_total",
              "paid_amount",
              "due_amount",
              "payment_status",
              "order_tax",
              "shipping",
              "discount",
            ],
            include: [
              {
                model: Customer,
                as: "customer",
                required: false,
                attributes: [
                  "customer_id",
                  "firstName",
                  "lastName",
                  "email",
                  "phone",
                  "address",
                ],
              },
            ],
          },
          {
            model: SaleReturnItems,
            as: "items",
            required: false,
            attributes: [
              "sale_return_item_id",
              "sale_item_id",
              "product_variant_id",
              "warehouse_id",
              "return_quantity",
              "price",
              "discount",
              "tax",
              "sub_total",
            ],
            include: [
              {
                model: SaleItem,
                as: "sale_item",
                required: false,
                attributes: [
                  "sales_item_id",
                  "quantity",
                  "tax",
                  "discount",
                  "total",
                ],
              },
              {
                model: Product_Variant,
                as: "variant",
                required: false,
                attributes: [
                  "product_variant_id",
                  "skuCode",
                  "variant_label",
                  "price",
                ],
                include: [
                  {
                    model: Product,
                    as: "product",
                    required: false,
                    attributes: ["product_id", "productName"],
                  },
                ],
              },
            ],
          },
        ],
      });

      const sr = saleReturn.toJSON();

      const toFloat = (val) => parseFloat(Number(val || 0).toFixed(2));

      // --------------------
      // STEP 1: Build Items
      // --------------------
      const returnItems = (sr.items || []).map((item) => {
        const price = Number(item.price) || 0;
        const returnQty = Number(item.return_quantity) || 0;
        const tax = Number(item.tax) || 0;
        const discount = Number(item.discount) || 0;
        const originalQty = Number(item.sale_item?.quantity) || 0;

        const subTotal = price * returnQty;
        const taxAmount = (subTotal * tax) / 100;
        const effectiveTotal = subTotal + taxAmount - discount;
        const remainingQty = Math.max(originalQty - returnQty, 0);

        return {
          sale_return_item_id: item.sale_return_item_id,
          sale_item_id: item.sale_item_id,
          product_variant_id: item.product_variant_id,
          warehouse_id: item.warehouse_id,

          product_id: item.variant?.product?.product_id || null,
          product_name: item.variant?.product?.productName || null,
          sku_code: item.variant?.skuCode || null,
          variant_label: item.variant?.variant_label || null,

          unit_price: toFloat(price),

          original_sold_qty: originalQty,
          return_quantity: returnQty,
          remaining_qty: remainingQty,
          is_fully_returned: remainingQty === 0,

          discount: toFloat(discount),
          tax: toFloat(tax),
          tax_amount: toFloat(taxAmount),
          sub_total: toFloat(effectiveTotal),
        };
      });

      // --------------------
      // STEP 2: Summary
      // --------------------
      const summary = {
        total_items_count: returnItems.length,
        fully_returned_count: returnItems.filter((i) => i.is_fully_returned)
          .length,
        total_return_qty: returnItems.reduce(
          (sum, i) => sum + i.return_quantity,
          0,
        ),
        total_tax_amount: toFloat(
          returnItems.reduce((sum, i) => sum + i.tax_amount, 0),
        ),
        total_discount: toFloat(
          returnItems.reduce((sum, i) => sum + i.discount, 0),
        ),
        net_return_amount: toFloat(sr.total_amount),
      };

      // --------------------
      // STEP 3: Final JSON
      // --------------------
      const formattedResponse = {
        // Header
        sale_return_id: sr.sale_return_id,
        srn_no: sr.srn_no,
        sale_return_date: sr.sale_return_date,
        status: sr.status,
        payment_status: sr.payment_status ?? null,
        total_amount: toFloat(sr.total_amount),

        // Summary
        summary,

        // Sale Info
        sale: sr.sale
          ? {
              sale_id: sr.sale.sale_id,
              invoice_no: sr.sale.invoice_no,
              sale_date: sr.sale.sale_date,
              grand_total: toFloat(sr.sale.grand_total),
              paid_amount: toFloat(sr.sale.paid_amount),
              due_amount: toFloat(sr.sale.due_amount),
              payment_status: sr.sale.payment_status,
              order_tax: toFloat(sr.sale.order_tax),
              shipping: toFloat(sr.sale.shipping),
              discount: toFloat(sr.sale.discount),
            }
          : null,

        // Customer
        customer: sr.sale?.customer
          ? {
              customer_id: sr.sale.customer.customer_id,
              full_name:
                `${sr.sale.customer.firstName ?? ""} ${sr.sale.customer.lastName ?? ""}`.trim(),
              email: sr.sale.customer.email || null,
              phone: sr.sale.customer.phone || null,
              address: sr.sale.customer.address || null,
            }
          : null,

        // Items
        return_items: returnItems,
      };

      if (!saleReturn) {
        throw new Error("Sale return not found");
      }
      return formattedResponse;
    } catch (error) {
      console.error("getSalereturnById error:", error);
      throw error;
    }
  },
};
