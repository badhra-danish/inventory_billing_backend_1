const jwt = require("jsonwebtoken");

exports.generateToken = (user) => {
  return jwt.sign(
    {
      user_id: user.id,
      role: user.role,
      shop_id: user.shop_id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );
};
