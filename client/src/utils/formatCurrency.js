export const formatCurrency = (amount, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount || 0);

export const formatCompact = (amount) => {
  if (Math.abs(amount) >= 10_00_000) return `₹${(amount / 10_00_000).toFixed(1)}L`;
  if (Math.abs(amount) >= 1_000) return `₹${(amount / 1_000).toFixed(1)}K`;
  return formatCurrency(amount);
};
