import { transactionApi } from "@/api/transactionApi";
import toast from "react-hot-toast";

export const downloadFile = (blob, filename) => {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportTransactions = async (params, format = "csv") => {
  const toastId = toast.loading(`Preparing ${format.toUpperCase()} export...`);
  try {
    const { data } = await transactionApi.export({ ...params, format });
    downloadFile(new Blob([data]), `flowfin-transactions.${format}`);
    toast.success("Export ready!", { id: toastId });
  } catch {
    toast.error("Export failed", { id: toastId });
  }
};

export const CATEGORY_META = {
  "Food & Dining":   { icon: "🍽️", color: "#F59E0B" },
  Transportation:    { icon: "🚗", color: "#3B82F6" },
  Shopping:          { icon: "🛍️", color: "#EC4899" },
  Entertainment:     { icon: "🎬", color: "#8B5CF6" },
  Healthcare:        { icon: "🏥", color: "#10B981" },
  Utilities:         { icon: "⚡", color: "#EF4444" },
  Housing:           { icon: "🏠", color: "#7C3AED" },
  Education:         { icon: "📚", color: "#06B6D4" },
  Travel:            { icon: "✈️", color: "#F97316" },
  "Personal Care":   { icon: "💆", color: "#A78BFA" },
  Salary:            { icon: "💼", color: "#06D6A0" },
  Freelance:         { icon: "💻", color: "#06D6A0" },
  Investment:        { icon: "📈", color: "#06D6A0" },
  Other:             { icon: "📦", color: "#6B7280" },
};

export const getCategoryMeta = (category) =>
  CATEGORY_META[category] || { icon: "📦", color: "#6B7280" };
