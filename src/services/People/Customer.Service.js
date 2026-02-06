const { Customer } = require("../../models/indexModel");

exports.customerService = {
  createCustomer: async (customerData, shop_id) => {
    try {
      const { firstName, lastName, email, phone, address, location, status } =
        customerData;
      if (!firstName) throw new Error("First name is required");
      if (!lastName) throw new Error("Last name is required");
      if (!email) throw new Error("Email is required");
      if (!phone) throw new Error("Phone is required");
      if (!address) throw new Error("Address is required");

      if (!location) throw new Error("Location is required");
      if (!location.city) throw new Error("City is required");
      if (!location.state) throw new Error("State is required");
      // if (!location.country) throw new Error("Country is required");
      if (!location.postalCode) throw new Error("Postal code is required");

      if (!status) throw new Error("Status is required");

      const customer = await Customer.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email,
        phone: phone,
        address: address,
        shop_id: shop_id,
        location: {
          city: location.city,
          state: location.state,
          //  country: location.country,
          postalCode: location.postalCode,
        },
        status: status,
      });
      return customer;
    } catch (error) {
      console.log(error);

      throw error;
    }
  },
  updateCustomer: async (customerID, updateData, shop_id) => {
    try {
      const { firstName, lastName, email, phone, address, location, status } =
        updateData;
      console.log("update", updateData);

      const customer = await Customer.findOne({
        where: {
          customer_id: customerID,
          shop_id,
        },
      });
      if (!customer) throw new Error("Customer Not Found");

      if (!firstName) throw new Error("First name is required");
      if (!lastName) throw new Error("Last name is required");
      if (!email) throw new Error("Email is required");
      if (!phone) throw new Error("Phone is required");
      if (!address) throw new Error("Address is required");

      if (!location) throw new Error("Location is required");
      if (!location.city) throw new Error("City is required");
      if (!location.state) throw new Error("State is required");
      //if (!location.country) throw new Error("Country is required");
      if (!location.postalCode) throw new Error("Postal code is required");

      if (!status) throw new Error("Status is required");

      const updatedCustomer = await customer.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email,
        phone: phone,
        address: address,
        location: {
          city: location.city,
          state: location.state,
          postalCode: location.postalCode,
        },
        status: status,
      });
      return updatedCustomer;
    } catch (error) {
      throw error;
    }
  },
  deleteCustomer: async (customerID, shop_id) => {
    try {
      const customer = await Customer.findOne({
        where: {
          customer_id: customerID,
          shop_id,
        },
      });
      if (!customer) throw new Error("Customer Not Found");

      await customer.destroy();
      return;
    } catch (error) {
      throw error;
    }
  },
  getAllCustomer: (shop_id) => {
    try {
      const customer = Customer.findAll({
        where: { shop_id },
        attributes: ["customer_id", "firstName", "lastName"],
      });
      return customer;
    } catch (error) {
      throw error;
    }
  },
};
