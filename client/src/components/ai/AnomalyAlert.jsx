import { useQuery } from "@tanstack/react-query";
import { aiApi } from "@/api/aiApi";
import { AlertTriangle } from "lucide-react";
import Badge from "@/components/ui/Badge";

const severityVariant = { high: "expense", medium: "warning", low: "primary" };

export default function AnomalyAlert() {
  const { data } = useQuery({
    queryKey: ["ai-anomalies"],
    queryFn: () => aiApi.getAnomalies().then((r) => r.data.data.anomalies),
    staleTime: 1000 * 60 * 15,
  });

  if (!data?.length) return null;

  return (
    <div className="space-y-2">
      {data.map((a, i) => (
        <div key={i} className="flex gap-3 p-3 rounded-xl bg-warning/5 border border-warning/20">
          <AlertTriangle size={18} className="text-warning flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold text-text-primary">{a.title}</p>
              <Badge variant={severityVariant[a.severity] || "muted"}>{a.severity}</Badge>
            </div>
            <p className="text-xs text-text-muted mt-0.5">{a.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
