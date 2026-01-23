const buildVariantLabel = (variantAttributes) => {
  if (!variantAttributes || variantAttributes.length === 0) return "—";

  return variantAttributes
    .map((va) => va.value?.value)
    .filter(Boolean)
    .join(" | ");
};
module.exports = { buildVariantLabel };
