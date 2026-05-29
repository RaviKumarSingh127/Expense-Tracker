import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { getCategoryMeta } from "@/utils/exportHelpers";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";

const RADIAN = Math.PI / 180;
const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function SpendingPieChart({ data = [] }) {
  const { format } = useCurrencyFormat();
  const chartData = data.map((d) => ({
    name: d._id || d.name,
    value: d.total || d.value,
    color: getCategoryMeta(d._id || d.name).color,
  }));

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-64 text-text-muted text-sm">
        No spending data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={110}
          dataKey="value"
          labelLine={false}
          label={renderLabel}
          animationBegin={0}
          animationDuration={600}
        >
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.color} stroke="transparent" />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: "#13131A", border: "1px solid #1E1E2E", borderRadius: 12, fontSize: 12 }}
          formatter={(value) => [format(value), "Spent"]}
          labelStyle={{ color: "#F1F0FF" }}
        />
        <Legend
          formatter={(value) => <span style={{ color: "#9CA3AF", fontSize: 12 }}>{value}</span>}
          iconType="circle"
          iconSize={8}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
