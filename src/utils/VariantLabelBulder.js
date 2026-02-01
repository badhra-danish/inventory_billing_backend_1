const buildVariantLabel = (variantAttributes) => {
  if (!variantAttributes || variantAttributes.length === 0) return "—";

  return variantAttributes
    .map((va) => va.value?.value)
    .filter(Boolean)
    .join(" | ");
};
const generateBarcode = (productCode, variantLabel) => {
  return `${productCode}-${Date.now()}`;
};
module.exports = { buildVariantLabel, generateBarcode };
