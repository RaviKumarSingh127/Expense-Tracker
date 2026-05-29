import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { useCurrencyFormat } from "@/hooks/useCurrencyFormat";

export default function TrendLine({ data = [], dataKey = "savings", color = "#7C3AED", label = "Savings" }) {
  const { formatCompact, format } = useCurrencyFormat();

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="#1E1E2E" strokeDasharray="4 4" />
        <XAxis dataKey="month" tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tickFormatter={formatCompact} tick={{ fill: "#6B7280", fontSize: 11 }} axisLine={false} tickLine={false} width={52} />
        <Tooltip
          contentStyle={{ background: "#13131A", border: "1px solid #1E1E2E", borderRadius: 12, fontSize: 12 }}
          formatter={(value) => [format(value), label]}
          labelStyle={{ color: "#F1F0FF" }}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#gradient-${dataKey})`}
          animationDuration={600}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
