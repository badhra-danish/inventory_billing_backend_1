const { salesService } = require("../../services/Sales/Sales.Service");
const { success, error } = require("../../utils/response");

exports.createSale = async (req, res) => {
  try {
    const sale = await salesService.createSale(req.body);
    return success(res, "Sale Created SuccessFully", sale);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
