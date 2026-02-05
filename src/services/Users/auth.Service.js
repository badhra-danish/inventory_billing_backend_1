const bcrypt = require("bcrypt");
const User = require("../../models/Users/User.Model");
const { generateToken } = require("../../utils/GenereteToken");
const { Shop } = require("../../models/indexModel");

exports.authService = {
  login: async ({ email, password }) => {
    if (!email || !password) {
      throw new Error("Email and password are required");
    }

    const user = await User.findOne({
      where: { email },
      include: {
        model: Shop,
        as: "shop",
        attributes: ["shop_id", "shop_name", "address", "phone"],
      },
    });

    if (!user) {
      throw new Error("Invalid email or password");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new Error("Invalid email or password");
    }

    const token = generateToken(user);

    const safeUser = user.toJSON();
    delete safeUser.password;

    return {
      user: safeUser,
      token,
    };
  },
};
