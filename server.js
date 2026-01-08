// const app = require("./app");
const sequelize = require("./src/config/database");

const express = require("express");
const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000;
const routes = require("./src/routes/index.routes");

(async () => {
  try {
    await sequelize.authenticate();
    console.log(" Database connected");

    await sequelize.sync();
    console.log(" Models synced");

    app.listen(PORT, () =>
      console.log(` Server running on  http://localhost:${PORT}/api
`)
    );
    app.use("/api", routes);
  } catch (error) {
    console.error(" Server error:", error);
  }
})();
