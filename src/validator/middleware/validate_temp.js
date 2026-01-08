const { ZodError } = require("zod");

const validate =
  (schema, property = "body") =>
  (req, res, next) => {
    try {
      req[property] = schema.parse(req[property]);

      next();
    } catch (error) {
      // Check if it's Zod error
      if (error instanceof ZodError && Array.isArray(error.errors)) {
        return res.status(400).json({
          status: "Fail",
          message: "Validation failed",
          errors: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }

      // fallback for other errors
      return res.status(400).json({
        status: "Fail",
        message: error.message || "Validation failed",
      });
    }
  };

module.exports = { validate };
