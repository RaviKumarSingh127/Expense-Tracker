import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";

export default function IncomeExpenseBar({ data = [] }) {
  const { formatCompact, format } = useCurrencyFormat();

  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-64 text-text-muted text-sm">
        No data available
      </div>
    );
  }

  const formatted = data.map((d) => ({
    ...d,
    month: d.month?.split("-").slice(0, 2).join("-") || d.month,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={formatted} margin={{ top: 4, right: 4, bottom: 0, left: 0 }} barGap={4}>
        <CartesianGrid vertical={false} stroke="#1E1E2E" strokeDasharray="4 4" />
        <XAxis
          dataKey="month"
          tick={{ fill: "#6B7280", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatCompact}
          tick={{ fill: "#6B7280", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={52}
        />
        <Tooltip
          contentStyle={{ background: "#13131A", border: "1px solid #1E1E2E", borderRadius: 12, fontSize: 12 }}
          formatter={(value, name) => [format(value), name === "income" ? "Income" : "Expense"]}
          labelStyle={{ color: "#F1F0FF" }}
          cursor={{ fill: "rgba(124,58,237,0.05)" }}
        />
        <Legend
          formatter={(value) => (
            <span style={{ color: "#9CA3AF", fontSize: 12 }}>
              {value === "income" ? "Income" : "Expense"}
            </span>
          )}
        />
        <Bar dataKey="income" fill="#06D6A0" radius={[6, 6, 0, 0]} maxBarSize={28} />
        <Bar dataKey="expense" fill="#EF4444" radius={[6, 6, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );
}
