import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { aiApi } from "@/api/aiApi";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";
import api from "@/api/axiosInstance";

export default function BudgetAdvisor({ onClose }) {
  const [income, setIncome] = useState("");
  const [suggestions, setSuggestions] = useState(null);
  const qc = useQueryClient();
  const { format } = useCurrencyFormat();
  const now = new Date();

  const suggestMutation = useMutation({
    mutationFn: () => aiApi.suggestBudget({ monthlyIncome: Number(income) }),
    onSuccess: ({ data }) => setSuggestions(data.data.suggestions),
    onError: () => toast.error("Failed to generate budget suggestions"),
  });

  const saveMutation = useMutation({
    mutationFn: () =>
      api.post("/budgets/bulk", {
        budgets: suggestions,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["budgets"] });
      toast.success("Budget plan saved!");
      onClose?.();
    },
  });

  return (
    <div className="space-y-4">
      {!suggestions ? (
        <>
          <p className="text-sm text-text-muted">
            Enter your monthly income and AI will generate a personalized budget plan using the 50/30/20 rule.
          </p>
          <Input
            label="Monthly Income (₹)"
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="e.g. 75000"
            min="1"
          />
          <Button
            className="w-full"
            onClick={() => suggestMutation.mutate()}
            isLoading={suggestMutation.isPending}
            disabled={!income || Number(income) <= 0}
          >
            ✨ Generate AI Budget Plan
          </Button>
        </>
      ) : (
        <>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {suggestions.map((s, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-surface-2">
                <span className="text-xl">{s.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary">{s.category}</p>
                  <p className="text-xs text-text-muted">{s.reasoning}</p>
                </div>
                <span className="text-sm font-bold text-accent">{format(s.amount)}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setSuggestions(null)}>
              Regenerate
            </Button>
            <Button
              className="flex-1"
              onClick={() => saveMutation.mutate()}
              isLoading={saveMutation.isPending}
            >
              Save All Budgets
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
