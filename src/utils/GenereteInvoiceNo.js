//get financial Year
const { Op } = require("sequelize");
const Sale = require("../models/Sales/Sales.Model");

function getFinancialYear() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth() + 1;

  // India FY: April to March
  return month >= 4
    ? `${year}-${String(year + 1).slice(-2)}`
    : `${year - 1}-${String(year).slice(-2)}`;
}

// invoice no generete..
exports.generateInvoiceNo = async (transaction) => {
  const fy = getFinancialYear();

  const lastInvoice = await Sale.findOne({
    where: {
      invoice_no: {
        [Op.like]: `STR/${fy}/%`,
      },
    },
    order: [["createdAt", "DESC"]],
    transaction,
  });

  let nextNumber = 1;

  if (lastInvoice) {
    const lastNo = lastInvoice.invoice_no; // INV/24-25/0007
    const lastSeq = Number(lastNo.split("/").pop()); // 7
    nextNumber = lastSeq + 1;
  }

  const invoiceNo = `STR/${fy}/${String(nextNumber).padStart(4, "0")}`;

  return { invoiceNo, fy };
};
