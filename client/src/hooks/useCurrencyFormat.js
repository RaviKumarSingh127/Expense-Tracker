import { useAuthStore } from "@/store/useAuthStore";

export const useCurrencyFormat = () => {
  const currency = useAuthStore((s) => s.user?.currency || "INR");

  const format = (amount, options = {}) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
      ...options,
    }).format(amount || 0);
  };

  const formatCompact = (amount) => {
    if (Math.abs(amount) >= 10_00_000) return `₹${(amount / 10_00_000).toFixed(1)}L`;
    if (Math.abs(amount) >= 1_000) return `₹${(amount / 1_000).toFixed(1)}K`;
    return format(amount);
  };

  return { format, formatCompact, currency };
};
