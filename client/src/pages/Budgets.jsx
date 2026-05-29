import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Plus, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import api from "@/api/axiosInstance";
import { useBudgetStore } from "@/store/useBudgetStore";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import { SkeletonCard } from "@/components/ui/Skeleton";
import BudgetProgress from "@/components/charts/BudgetProgress";
import BudgetAdvisor from "@/components/ai/BudgetAdvisor";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";
import { CATEGORY_META } from "@/utils/exportHelpers";
import { formatMonthYear, MONTHS } from "@/utils/dateHelpers";

const CATEGORIES = Object.keys(CATEGORY_META);

export default function Budgets() {
  const { selectedMonth, selectedYear, setMonth } = useBudgetStore();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [formData, setFormData] = useState({ category: "", limit: "", icon: "💰", color: "#7C3AED" });
  const qc = useQueryClient();
  const { format } = useCurrencyFormat();

  const { data: status, isLoading } = useQuery({
    queryKey: ["budgets", "status", selectedMonth, selectedYear],
    queryFn: () => api.get("/budgets/status").then((r) => r.data.data.status),
  });

  const createMutation = useMutation({
    mutationFn: (data) => api.post("/budgets", {
      ...data,
      limit: Number(data.limit),
      month: selectedMonth,
      year: selectedYear,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Budget created");
      setIsFormOpen(false);
      setFormData({ category: "", limit: "", icon: "💰", color: "#7C3AED" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/budgets/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Budget deleted");
    },
  });

  const navigateMonth = (dir) => {
    let m = selectedMonth + dir;
    let y = selectedYear;
    if (m > 12) { m = 1; y++; }
    if (m < 1) { m = 12; y--; }
    setMonth(m, y);
  };

  const totalBudget = (status || []).reduce((s, b) => s + b.limit, 0);
  const totalSpent = (status || []).reduce((s, b) => s + b.spent, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigateMonth(-1)} className="p-2 rounded-xl hover:bg-surface-2 text-text-muted transition-colors">
            <ChevronLeft size={18} />
          </button>
          <h2 className="text-lg font-bold text-text-primary">{formatMonthYear(selectedMonth, selectedYear)}</h2>
          <button onClick={() => navigateMonth(1)} className="p-2 rounded-xl hover:bg-surface-2 text-text-muted transition-colors">
            <ChevronRight size={18} />
          </button>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" onClick={() => setIsAIOpen(true)}>
            <Sparkles size={16} />
            AI Budget Plan
          </Button>
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus size={16} />
            Add Budget
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total Budget", value: format(totalBudget), color: "text-primary" },
          { label: "Total Spent", value: format(totalSpent), color: "text-danger" },
          { label: "Remaining", value: format(Math.max(totalBudget - totalSpent, 0)), color: "text-accent" },
        ].map((s) => (
          <Card key={s.label} className="text-center">
            <p className="text-xs text-text-muted">{s.label}</p>
            <p className={`text-xl font-bold mt-1 ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Budget Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(status || []).map((b) => {
            const meta = CATEGORY_META[b.category] || { icon: "📦", color: "#6B7280" };
            const pct = Math.min(b.percent, 100);
            const barColor = pct >= 100 ? "#EF4444" : pct >= 80 ? "#F59E0B" : "#06D6A0";

            return (
              <Card key={b._id} className="group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${meta.color}20` }}>
                      {meta.icon}
                    </div>
                    <div>
                      <p className="font-semibold text-text-primary">{b.category}</p>
                      <p className="text-xs text-text-muted">{b.daysRemaining}d left this month</p>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteMutation.mutate(b._id)}
                    className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-danger transition-all text-xs"
                  >
                    Remove
                  </button>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-semibold" style={{ color: barColor }}>{format(b.spent)}</span>
                    <span className="text-text-muted">{format(b.limit)}</span>
                  </div>
                  <div className="h-2.5 bg-surface-2 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: barColor }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-text-muted">
                    <span>{pct}% used</span>
                    <span>{b.isOverBudget ? "🔴 Over budget" : `${format(b.remaining)} left`}</span>
                  </div>
                </div>
              </Card>
            );
          })}

          {!(status?.length) && (
            <div className="col-span-2 text-center py-16 text-text-muted">
              <p className="text-4xl mb-3">📊</p>
              <p className="font-medium text-text-primary">No budgets set</p>
              <p className="text-sm">Add a budget or let AI suggest one for you</p>
            </div>
          )}
        </div>
      )}

      {/* Add Budget Modal */}
      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title="Add Budget">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-text-primary">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input-base"
            >
              <option value="">Select category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{CATEGORY_META[c].icon} {c}</option>
              ))}
            </select>
          </div>
          <Input
            label="Monthly Limit (₹)"
            type="number"
            value={formData.limit}
            onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
            placeholder="5000"
            min="1"
          />
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button
              className="flex-1"
              disabled={!formData.category || !formData.limit}
              onClick={() => createMutation.mutate(formData)}
              isLoading={createMutation.isPending}
            >
              Create Budget
            </Button>
          </div>
        </div>
      </Modal>

      {/* AI Budget Advisor */}
      <Modal isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} title="✨ AI Budget Plan">
        <BudgetAdvisor onClose={() => setIsAIOpen(false)} />
      </Modal>
    </div>
  );
}
