const { Customer } = require("../../models/indexModel");
const { customerService } = require("../../services/People/Customer.Service");
const { success, error } = require("../../utils/response");
const { getPagination, getPageMetaData } = require("../../utils/Pagination");
const sequelize = require("../../config/database");

exports.createCustomer = async (req, res) => {
  try {
    const customer = await customerService.createCustomer(req.body);
    return success(res, "Customer created Successfully", customer);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.updateCustomer = async (req, res) => {
  try {
    const { customerID } = req.params;
    const updatedCustomer = await customerService.updateCustomer(
      customerID,
      req.body,
    );
    return success(res, "Customer Updated Successfully", updatedCustomer);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.deleteCustomer = async (req, res) => {
  try {
    const { customerID } = req.params;
    await customerService.deleteCustomer(customerID);
    return success(res, "Customer Deleted Successfully");
  } catch (err) {
    return error(res, err.message, 400);
  }
};
exports.getCustomerPage = async (req, res) => {
  try {
    const { page, limit, offset } = getPagination(req.query);

    const customerData = await Customer.findAndCountAll({
      limit,
      offset,
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
    const customer = await customerService.getAllCustomer();
    return success(res, "All Customer Fetched", customer);
  } catch (err) {
    return error(res, err.message, 400);
  }
};
