const jwt = require("jsonwebtoken");

exports.auth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ message: "No token" });

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;
    req.shop_id = decoded.shop_id;
    req.role = decoded.role;

    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
