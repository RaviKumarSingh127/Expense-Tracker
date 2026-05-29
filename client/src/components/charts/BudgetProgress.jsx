import { motion } from "framer-motion";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";
import { getCategoryMeta } from "@/utils/exportHelpers";
import Badge from "@/components/ui/Badge";

export default function BudgetProgress({ budgets = [] }) {
  const { format } = useCurrencyFormat();

  if (!budgets.length) {
    return <p className="text-text-muted text-sm text-center py-8">No budgets set for this month</p>;
  }

  return (
    <div className="space-y-4">
      {budgets.map((b) => {
        const meta = getCategoryMeta(b.category);
        const pct = Math.min(b.percent || 0, 100);
        const barColor = pct >= 100 ? "#EF4444" : pct >= 80 ? "#F59E0B" : "#06D6A0";

        return (
          <div key={b._id} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span>{meta.icon}</span>
                <span className="font-medium text-text-primary">{b.category}</span>
                {b.isOverBudget && <Badge variant="expense">Over</Badge>}
              </div>
              <div className="text-right">
                <span className={pct >= 100 ? "text-danger" : pct >= 80 ? "text-warning" : "text-text-muted"}>
                  {format(b.spent)}
                </span>
                <span className="text-text-muted"> / {format(b.limit)}</span>
              </div>
            </div>
            <div className="h-2 bg-surface-2 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                style={{ backgroundColor: barColor }}
                className="h-full rounded-full"
              />
            </div>
            <div className="flex justify-between text-xs text-text-muted">
              <span>{pct}% used</span>
              <span>{b.daysRemaining}d left</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
