const { z, optional } = require("zod");

/**
 * UUID validator
 */
const uuidSchema = z.uuid({ message: "Invalid UUID format" });

/**
 * Product Variant Schema
 */
const productVariantSchema = z.object({
  skuCode: z.string().min(2, "SKU is required"),
  price: z.number().positive("Price must be greater than 0"),
  tax_type: z
    .enum(["INCLUSIVE", "EXCLUSIVE", "NONE"])
    .optional()
    .default("NONE"),
  tax_value: z.number().default(0).optional(),
  discount_type: z
    .enum(["PERCENTAGE", "FIXED", "NONE"])
    .optional()
    .default("NONE"),
  discount_value: z.number().default(0).optional(),

  // array of attribute_value_id UUIDs
  attribute_value_ids: z
    .array(uuidSchema)
    .min(1, "At least one attribute value is required")
    .optional()
    .default([]),
});

/**
 * Create Product Schema
 */

const createProductSchema = z.object({
  product: z.object({
    productName: z.string().min(2, "Product name is required"),
    slugName: z.string().min(2, "Slug name is required"),
    description: z.string().optional(),
    product_type: z.enum(["SINGLE", "VARIABLE"]),
    selling_type: z.enum(["RETAIL", "WHOLESALE", "BOTH"]),
    brand_id: uuidSchema,
    unit_id: uuidSchema,
    category_id: uuidSchema,
    subcategory_id: uuidSchema,
    warranty_id: uuidSchema,
    status: z.enum(["ACTIVE", "INACTIVE"]).default("ACTIVE"),
    manufacturer: z.string().optional(),
    manufacturer_date: z.coerce.date().optional(),
    expiry_date: z.coerce.date().optional(),
  }),
  productVariants: z
    .array(productVariantSchema)
    .min(1, "At least one product variant is required"),
});

module.exports = { createProductSchema };
