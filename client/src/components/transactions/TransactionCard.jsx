import { motion } from "framer-motion";
import { Edit2, Trash2 } from "lucide-react";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";
import { formatRelative } from "@/utils/dateHelpers";
import { getCategoryMeta } from "@/utils/exportHelpers";
import Badge from "@/components/ui/Badge";

export default function TransactionCard({ transaction, onEdit, onDelete, index = 0 }) {
  const { format } = useCurrencyFormat();
  const meta = getCategoryMeta(transaction.category);
  const isIncome = transaction.type === "income";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.25 }}
      className="flex items-center gap-4 p-4 rounded-xl bg-surface border border-border hover:border-primary/30 transition-all duration-200 group"
    >
      {/* Category bar */}
      <div
        className="w-1 h-10 rounded-full flex-shrink-0"
        style={{ backgroundColor: meta.color }}
      />

      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-lg"
        style={{ backgroundColor: `${meta.color}20` }}
      >
        {meta.icon}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-medium text-text-primary truncate">{transaction.title}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-text-muted">{formatRelative(transaction.date)}</span>
          <span className="text-text-muted">·</span>
          <Badge variant="muted">{transaction.category}</Badge>
          {transaction.paymentMethod !== "other" && (
            <Badge variant="muted">{transaction.paymentMethod}</Badge>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="text-right">
        <p className={`font-bold text-base ${isIncome ? "text-accent" : "text-danger"}`}>
          {isIncome ? "+" : "-"}{format(transaction.amount)}
        </p>
        {transaction.tags?.length > 0 && (
          <div className="flex gap-1 justify-end mt-1">
            {transaction.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="text-xs text-text-muted bg-surface-2 px-1.5 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
        <button
          onClick={() => onEdit?.(transaction)}
          className="p-1.5 rounded-lg hover:bg-primary/10 text-text-muted hover:text-primary transition-colors"
        >
          <Edit2 size={14} />
        </button>
        <button
          onClick={() => onDelete?.(transaction._id)}
          className="p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </motion.div>
  );
}
