const bcrypt = require("bcrypt");
const User = require("../../models/Users/User.Model");
const { generateToken } = require("../../utils/GenereteToken");
const {
  Shop,
  Sale,
  Purchase,
  Customer,
  Supplier,
} = require("../../models/indexModel");
const sequelize = require("../../config/database");
const { email } = require("zod");
const { Op } = require("sequelize");

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
  updateShopAdminWithShop: async (id, updateData) => {
    const transaction = await sequelize.transaction();

    try {
      const { shopName, address, phone, adminName, adminEmail, adminPassword } =
        updateData;

      // 1. Find existing shop
      const shop = await Shop.findByPk(id, { transaction });

      if (!shop) {
        throw new Error("Shop not found");
      }

      // 2. Update shop details
      await shop.update(
        {
          shop_name: shopName ?? shop.shop_name,
          address: address ?? shop.address,
          phone: phone ?? shop.phone,
        },
        { transaction },
      );

      // 3. Find shop admin
      const shopAdmin = await User.findOne({
        where: {
          shop_id: shop.shop_id,
          role: "SHOP_ADMIN",
        },
        transaction,
      });

      if (!shopAdmin) {
        throw new Error("Shop admin not found");
      }

      // 4. Prepare updated fields
      const updatedFields = {
        name: adminName ?? shopAdmin.name,
        email: adminEmail ?? shopAdmin.email,
      };

      // 5. If password is provided → hash it
      if (adminPassword) {
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        updatedFields.password = hashedPassword;
      }

      // 6. Update admin
      await shopAdmin.update(updatedFields, { transaction });

      // 7. Commit transaction
      await transaction.commit();

      return {
        message: "Shop and Admin updated successfully",
        shop,
        shopAdmin,
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
  getAllShopAdmins: async () => {
    try {
      const shopAdmins = await User.findAll({
        where: {
          role: "SHOP_ADMIN",
        },
        attributes: ["user_id", "name", "email", "createdAt"],

        include: [
          {
            model: Shop,
            as: "shop",
            attributes: ["shop_id", "shop_name", "address", "phone"],
          },
        ],

        order: [["createdAt", "DESC"]],
      });

      return shopAdmins;
    } catch (error) {
      console.log(error);
      throw error;
    }
  },
  getSuperAdminDashboardStats: async () => {
    const totalShops = await Shop.count();

    const totalAdmins = await User.count({
      where: { role: "SHOP_ADMIN" },
    });

    const newShops = await Shop.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    });

    return {
      totalShops,
      totalAdmins,
      newShops,
    };
  },

  getShopDashboardStats: async (shopId) => {
    try {
      const totalSales = await Sale.sum("grand_total", {
        where: { shop_id: shopId },
      });

      const totalPurchase = await Purchase.sum("grand_total", {
        where: { shop_id: shopId },
      });

      const totalSalesDue = await Sale.sum("due_amount", {
        where: { shop_id: shopId },
      });

      const totalPurchaseDue = await Purchase.sum("due_amount", {
        where: { shop_id: shopId },
      });

      const totalCustomers = await Customer.count({
        where: { shop_id: shopId },
      });

      const totalSuppliers = await Supplier.count({
        where: { shop_id: shopId },
      });

      const totalSalesInvoices = await Sale.count({
        where: { shop_id: shopId },
      });

      const totalPurchaseInvoices = await Purchase.count({
        where: { shop_id: shopId },
      });

      return {
        totalSales: totalSales || 0,
        totalPurchase: totalPurchase || 0,
        totalSalesDue: totalSalesDue || 0,
        totalPurchaseDue: totalPurchaseDue || 0,
        totalCustomers,
        totalSuppliers,
        totalSalesInvoices,
        totalPurchaseInvoices,
      };
    } catch (error) {
      throw error;
    }
  },

  getSalesPurchaseAnalytics: async (shopId) => {
    try {
      const currentYear = new Date().getFullYear();

      // SALES DATA
      const salesData = await Sale.findAll({
        attributes: [
          [sequelize.fn("MONTH", sequelize.col("createdAt")), "month"],
          [sequelize.fn("SUM", sequelize.col("grand_total")), "total"],
        ],
        where: {
          shop_id: shopId,
          createdAt: {
            [Op.gte]: new Date(`${currentYear}-01-01`),
            [Op.lte]: new Date(`${currentYear}-12-31`),
          },
        },
        group: [sequelize.fn("MONTH", sequelize.col("createdAt"))],
        raw: true,
      });

      // PURCHASE DATA
      const purchaseData = await Purchase.findAll({
        attributes: [
          [sequelize.fn("MONTH", sequelize.col("createdAt")), "month"],
          [sequelize.fn("SUM", sequelize.col("grand_total")), "total"],
        ],
        where: {
          shop_id: shopId,
          createdAt: {
            [Op.gte]: new Date(`${currentYear}-01-01`),
            [Op.lte]: new Date(`${currentYear}-12-31`),
          },
        },
        group: [sequelize.fn("MONTH", sequelize.col("createdAt"))],
        raw: true,
      });

      // 🧠 Merge into 12 months format
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];

      const result = months.map((month, index) => {
        const monthIndex = index + 1;

        const sale = salesData.find((s) => s.month == monthIndex);
        const purchase = purchaseData.find((p) => p.month == monthIndex);

        return {
          month,
          sales: sale ? Number(sale.total) : 0,
          purchase: purchase ? Number(purchase.total) : 0,
        };
      });

      return result;
    } catch (error) {
      throw error;
    }
  },
};
