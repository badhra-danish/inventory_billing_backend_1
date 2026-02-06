const { Supplier } = require("../../models/indexModel");

exports.supplierService = {
  createSupplier: async (supplierData, shop_id) => {
    try {
      const { firstName, lastName, email, phone, address, location, status } =
        supplierData;
      if (!firstName) throw new Error("First name is required");
      if (!lastName) throw new Error("Last name is required");
      if (!email) throw new Error("Email is required");
      if (!phone) throw new Error("Phone is required");
      if (!address) throw new Error("Address is required");

      if (!location) throw new Error("Location is required");
      if (!location.city) throw new Error("City is required");
      if (!location.state) throw new Error("State is required");
      if (!location.country) throw new Error("Country is required");
      if (!location.postalCode) throw new Error("Postal code is required");

      if (!status) throw new Error("Status is required");

      const supplier = await Supplier.create({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email,
        phone: phone,
        address: address,
        shop_id: shop_id,
        location: {
          city: location.city,
          state: location.state,
          country: location.country,
          postalCode: location.postalCode,
        },
        status: status,
      });
      return supplier;
    } catch (error) {
      console.log(error);

      throw error;
    }
  },
  updateSupplier: async (supplierID, updateData) => {
    try {
      const { firstName, lastName, email, phone, address, location, status } =
        updateData;

      const supplier = await Supplier.findOne({
        where: {
          supplierID: supplierID,
          shop_id,
        },
      });
      if (!supplier) throw new Error("Customer Not Found");

      if (!firstName) throw new Error("First name is required");
      if (!lastName) throw new Error("Last name is required");
      if (!email) throw new Error("Email is required");
      if (!phone) throw new Error("Phone is required");
      if (!address) throw new Error("Address is required");

      if (!location) throw new Error("Location is required");
      if (!location.city) throw new Error("City is required");
      if (!location.state) throw new Error("State is required");
      if (!location.country) throw new Error("Country is required");
      if (!location.postalCode) throw new Error("Postal code is required");

      if (!status) throw new Error("Status is required");

      const updatedSupplier = await supplier.update({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email,
        phone: phone,
        address: address,
        location: {
          city: location.city,
          state: location.state,
          country: location.country,
          postalCode: location.postalCode,
        },
        status: status,
      });
      return updatedSupplier;
    } catch (error) {
      console.log(error);

      throw error;
    }
  },
  deleteSupplier: async (supplierID) => {
    try {
      const supplier = await Supplier.findOne({
        where: {
          supplierID: supplierID,
          shop_id,
        },
      });
      if (!supplier) throw new Error("Customer Not Found");

      await supplier.destroy();
      return;
    } catch (error) {
      throw error;
    }
  },
};
