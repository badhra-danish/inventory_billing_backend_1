const bcrypt = require("bcrypt");
const User = require("../models/Users/User.Model");

exports.seedSuperAdmin = async () => {
  const exists = await User.findOne({ where: { role: "SUPER_ADMIN" } });

  if (!exists) {
    await User.create({
      name: "System Admin",
      email: "admin@system.com",
      password: await bcrypt.hash("admin123", 10),
      role: "SUPER_ADMIN",
      shop_id: null,
    });

    console.log("Super admin created");
  }
};
