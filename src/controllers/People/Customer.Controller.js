const { Customer } = require("../../models/indexModel");
const { customerService } = require("../../services/People/Customer.Service");
const { success, error } = require("../../utils/response");
const { getPagination, getPageMetaData } = require("../../utils/Pagination");
const sequelize = require("../../config/database");

exports.createCustomer = async (req, res) => {
  try {
    const shop_id = req.user.shop_id;
    const customer = await customerService.createCustomer(req.body, shop_id);
    return success(res, "Customer created Successfully", customer);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.updateCustomer = async (req, res) => {
  try {
    const { customerID } = req.params;
    const shop_id = req.user.shop_id;

    const updatedCustomer = await customerService.updateCustomer(
      customerID,
      req.body,
      shop_id,
    );
    return success(res, "Customer Updated Successfully", updatedCustomer);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.deleteCustomer = async (req, res) => {
  try {
    const { customerID } = req.params;
    const shop_id = req.user.shop_id;

    await customerService.deleteCustomer(customerID, shop_id);
    return success(res, "Customer Deleted Successfully");
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.getCustomerPage = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);
    const shop_id = req.user.shop_id;
    const customerData = await Customer.findAndCountAll({
      limit,
      offset,
      where: { shop_id },
      order: [["createdAt", "DESC"]],
    });

    const formattedRows = customerData.rows.map((customer) => {
      const data = customer.toJSON();

      return {
        ...data,
        city: data.location?.city || null,
        state: data.location?.state || null,
        postalCode: data.location?.postalCode || null,
        location: undefined,
      };
    });

    return success(
      res,
      `${limit} Customers fetched`,
      formattedRows,
      getPageMetaData(page, limit, customerData.count),
    );
  } catch (err) {
    return error(res, err.message);
  }
};
exports.getAllCustomer = async (req, res) => {
  try {
    const shop_id = req.user.shop_id;
    const customer = await customerService.getAllCustomer(shop_id);
    return success(res, "All Customer Fetched", customer);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
