const bcrypt = require("bcrypt");
const User = require("../../models/Users/User.Model");
const { generateToken } = require("../../utils/GenereteToken");
const { Shop } = require("../../models/indexModel");
const sequelize = require("../../config/database");
const { email } = require("zod");

exports.shopService = {
  createShopAdminWithShop: async (shopData) => {
    const transaction = await sequelize.transaction();
    try {
      const { shopName, address, phone, adminName, adminEmail, adminPassword } =
        shopData;

      const shop = await Shop.create(
        {
          shop_name: shopName,
          address: address,
          phone: phone,
        },
        { transaction },
      );
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      const shopAdmin = await User.create(
        {
          name: adminName,
          password: hashedPassword,
          email: adminEmail,
          role: "SHOP_ADMIN",
          shop_id: shop.shop_id,
        },
        { transaction },
      );

      await transaction.commit();
      return {
        shopAdmin,
        shop,
      };
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  loginShopAdmin: async (loginData) => {
    try {
      const { email, password } = loginData;

      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      const user = await User.findOne({
        where: { email },
        include: {
          model: Shop,
          as: "shop",
          attributes: ["shop_id", "shop_name"],
        },
      });

      if (!user) {
        throw new Error("Invalid email or password");
      }

      if (user.role !== "SHOP_ADMIN") {
        throw new Error("Access denied. Not a shop admin");
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        throw new Error("Invalid email or password");
      }

      const token = generateToken(user);

      const safeUser = user.toJSON();
      delete safeUser.password;

      return {
        user: safeUser,
        token,
      };
    } catch (error) {
      throw error;
    }
  },
};
