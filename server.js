// const app = require("./app");
const sequelize = require("./src/config/database");
const express = require("express");
const app = express();
app.use(express.json());
const cors = require("cors");
const PORT = process.env.PORT || 5000;
const routes = require("./src/routes/index.routes");
const { seedSuperAdmin } = require("./src/seeds/superAdmin");
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  }),
);
(async () => {
  try {
    await sequelize.authenticate();
    console.log(" Database connected");

    await sequelize.sync();
    console.log(" Models synced");

    app.listen(PORT, async () =>
      console.log(
        ` Server running on  http://localhost:${PORT}/api
`,
        await seedSuperAdmin(),
      ),
    );
    app.use("/api/v1", routes);
  } catch (error) {
    console.error(" Server error:", error);
  }
})();
