import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/api/axiosInstance";
import Card from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import IncomeExpenseBar from "@/components/charts/IncomeExpenseBar";
import SpendingPieChart from "@/components/charts/SpendingPieChart";
import TrendLine from "@/components/charts/TrendLine";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";
import { getCategoryMeta } from "@/utils/exportHelpers";

const TABS = ["Overview", "Categories", "Trends"];

export default function Analytics() {
  const [activeTab, setActiveTab] = useState("Overview");
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  const { format } = useCurrencyFormat();

  const { data: trend, isLoading: trendLoading } = useQuery({
    queryKey: ["analytics", "trend"],
    queryFn: () => api.get("/analytics/trends", { params: { months: 6 } }).then((r) => r.data.data.trend),
  });

  const { data: categories, isLoading: catLoading } = useQuery({
    queryKey: ["analytics", "categories", month, year],
    queryFn: () => api.get("/analytics/categories", { params: { month, year } }).then((r) => r.data.data.categories),
  });

  const { data: heatmap } = useQuery({
    queryKey: ["analytics", "heatmap"],
    queryFn: () => api.get("/analytics/heatmap").then((r) => r.data.data.heatmap),
  });

  const trendWithSavings = (trend || []).map((d) => ({
    ...d,
    savings: Math.max((d.income || 0) - (d.expense || 0), 0),
  }));

  const maxHeat = Math.max(...(heatmap || []).map((d) => d.total), 1);

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface rounded-xl w-fit">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab ? "bg-primary text-white" : "text-text-muted hover:text-text-primary"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <h3 className="text-base font-semibold text-text-primary mb-4">Monthly Cash Flow</h3>
              {trendLoading ? <SkeletonCard rows={2} /> : <IncomeExpenseBar data={trend || []} />}
            </Card>
            <Card>
              <h3 className="text-base font-semibold text-text-primary mb-4">Savings Trend</h3>
              {trendLoading ? <SkeletonCard rows={2} /> : (
                <TrendLine data={trendWithSavings} dataKey="savings" color="#7C3AED" label="Savings" />
              )}
            </Card>
          </div>
        </div>
      )}

      {activeTab === "Categories" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <h3 className="text-base font-semibold text-text-primary mb-4">Spending by Category</h3>
              {catLoading ? <SkeletonCard rows={3} /> : <SpendingPieChart data={categories || []} />}
            </Card>
            <Card>
              <h3 className="text-base font-semibold text-text-primary mb-4">Category Breakdown</h3>
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {(categories || []).map((c) => {
                  const meta = getCategoryMeta(c._id);
                  const total = (categories || []).reduce((s, x) => s + x.total, 0);
                  const pct = total > 0 ? Math.round((c.total / total) * 100) : 0;
                  return (
                    <div key={c._id} className="flex items-center gap-3">
                      <span className="text-xl">{meta.icon}</span>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-text-primary">{c._id}</span>
                          <span className="text-text-muted">{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${pct}%`, backgroundColor: meta.color }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-text-primary w-20 text-right">
                        {format(c.total)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === "Trends" && (
        <div className="space-y-4">
          <Card>
            <h3 className="text-base font-semibold text-text-primary mb-4">Day of Week Spending</h3>
            <div className="grid grid-cols-7 gap-2">
              {(heatmap || []).map((d) => {
                const intensity = d.total / maxHeat;
                return (
                  <div key={d.day} className="text-center">
                    <p className="text-xs text-text-muted mb-2">{d.day}</p>
                    <div
                      className="h-16 rounded-lg transition-all"
                      style={{
                        backgroundColor: `rgba(124, 58, 237, ${0.1 + intensity * 0.9})`,
                        border: "1px solid rgba(124,58,237,0.2)",
                      }}
                      title={`${d.day}: ${format(d.total)}`}
                    />
                    <p className="text-xs text-text-muted mt-1">{format(d.total)}</p>
                  </div>
                );
              })}
            </div>
          </Card>
          <Card>
            <h3 className="text-base font-semibold text-text-primary mb-4">Income Trend (6 months)</h3>
            <TrendLine data={trend || []} dataKey="income" color="#06D6A0" label="Income" />
          </Card>
        </div>
      )}
    </div>
  );
}
