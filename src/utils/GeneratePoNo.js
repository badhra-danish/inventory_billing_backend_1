const { Op } = require("sequelize");
const { PurchaseOrder } = require("../models/indexModel");

exports.generatePONumber = async () => {
  const year = new Date().getFullYear();

  const count = await PurchaseOrder.count({
    where: {
      createdAt: {
        [Op.gte]: new Date(`${year}-01-01`),
      },
    },
  });

  const sequence = String(count + 1).padStart(5, "0");

  return `PO-${year}-${sequence}`;
};
