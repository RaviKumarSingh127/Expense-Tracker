import { useQuery } from "@tanstack/react-query";
import CountUp from "react-countup";
import { TrendingUp, TrendingDown, Wallet, Percent } from "lucide-react";
import api from "@/api/axiosInstance";
import { transactionApi } from "@/api/transactionApi";
import Card from "@/components/ui/Card";
import { SkeletonKPI } from "@/components/ui/Skeleton";
import IncomeExpenseBar from "@/components/charts/IncomeExpenseBar";
import SpendingPieChart from "@/components/charts/SpendingPieChart";
import BudgetProgress from "@/components/charts/BudgetProgress";
import TransactionCard from "@/components/transactions/TransactionCard";
import InsightsPanel from "@/components/ai/InsightsPanel";
import AnomalyAlert from "@/components/ai/AnomalyAlert";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";

const KPICard = ({ label, value, subLabel, subValue, icon: Icon, color, isLoading, formatter }) => {
  const { format } = useCurrencyFormat();
  const displayFn = formatter || format;
  if (isLoading) return <SkeletonKPI />;
  return (
    <Card className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm text-text-muted">{label}</p>
        <div className={`p-2 rounded-xl`} style={{ backgroundColor: `${color}20` }}>
          <Icon size={16} style={{ color }} />
        </div>
      </div>
      <p className="text-2xl font-bold text-text-primary">
        <CountUp end={value} duration={1.2} formattingFn={(v) => displayFn(v)} />
      </p>
      {subLabel && subValue != null && (
        <p className={`text-xs font-medium ${subValue >= 0 ? "text-accent" : "text-danger"}`}>
          {subValue >= 0 ? "↑" : "↓"} {Math.abs(subValue)}% {subLabel}
        </p>
      )}
    </Card>
  );
};

export default function Dashboard() {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  const { data: overview, isLoading: ovLoading } = useQuery({
    queryKey: ["analytics", "overview"],
    queryFn: () => api.get("/analytics/overview").then((r) => r.data.data),
  });

  const { data: trend } = useQuery({
    queryKey: ["analytics", "trend"],
    queryFn: () => api.get("/analytics/trends").then((r) => r.data.data.trend),
  });

  const { data: categories } = useQuery({
    queryKey: ["analytics", "categories", month, year],
    queryFn: () => api.get("/analytics/categories", { params: { month, year } }).then((r) => r.data.data.categories),
  });

  const { data: budgetStatus } = useQuery({
    queryKey: ["budgets", "status"],
    queryFn: () => api.get("/budgets/status").then((r) => r.data.data.status),
  });

  const { data: recentData } = useQuery({
    queryKey: ["transactions", "recent"],
    queryFn: () => transactionApi.getAll({ limit: 8, page: 1 }).then((r) => r.data.data),
  });

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Total Balance"
          value={overview?.balance || 0}
          subLabel="vs last month"
          subValue={overview?.changeVsLastMonth?.income || 0}
          icon={Wallet}
          color="#7C3AED"
          isLoading={ovLoading}
        />
        <KPICard
          label="Monthly Income"
          value={overview?.thisMonth?.income || 0}
          subLabel="vs last month"
          subValue={overview?.changeVsLastMonth?.income || 0}
          icon={TrendingUp}
          color="#06D6A0"
          isLoading={ovLoading}
        />
        <KPICard
          label="Monthly Expense"
          value={overview?.thisMonth?.expense || 0}
          subLabel="vs last month"
          subValue={-(overview?.changeVsLastMonth?.expense || 0)}
          icon={TrendingDown}
          color="#EF4444"
          isLoading={ovLoading}
        />
        <KPICard
          label="Savings Rate"
          value={overview?.savingsRate || 0}
          subLabel={overview?.savingsRate >= 20 ? "Excellent" : "Needs work"}
          subValue={overview?.savingsRate || 0}
          formatter={(v) => `${Math.round(v)}%`}
          icon={Percent}
          color="#F59E0B"
          isLoading={ovLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <Card className="lg:col-span-3">
          <h3 className="text-base font-semibold text-text-primary mb-4">Income vs Expense</h3>
          <IncomeExpenseBar data={trend || []} />
        </Card>
        <Card className="lg:col-span-2">
          <h3 className="text-base font-semibold text-text-primary mb-4">Spending Breakdown</h3>
          <SpendingPieChart data={categories || []} />
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Recent Transactions */}
        <Card className="lg:col-span-3">
          <h3 className="text-base font-semibold text-text-primary mb-4">Recent Transactions</h3>
          <div className="space-y-2">
            {(recentData || []).slice(0, 8).map((t, i) => (
              <TransactionCard key={t._id} transaction={t} index={i} />
            ))}
            {!recentData?.length && (
              <p className="text-text-muted text-sm text-center py-6">No transactions yet</p>
            )}
          </div>
        </Card>

        {/* Budget + AI */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <h3 className="text-base font-semibold text-text-primary mb-4">Budget Status</h3>
            <BudgetProgress budgets={(budgetStatus || []).slice(0, 5)} />
          </Card>

          <Card>
            <h3 className="text-base font-semibold text-text-primary mb-4">AI Insights</h3>
            <AnomalyAlert />
            <InsightsPanel />
          </Card>
        </div>
      </div>
    </div>
  );
}
