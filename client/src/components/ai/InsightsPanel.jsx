import { useQuery } from "@tanstack/react-query";
import { aiApi } from "@/api/aiApi";
import Skeleton from "@/components/ui/Skeleton";

export default function InsightsPanel() {
  const { data, isLoading } = useQuery({
    queryKey: ["ai-insights"],
    queryFn: () => aiApi.getInsights().then((r) => r.data.data.insights),
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="w-8 h-8 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {(data || []).map((insight, i) => (
        <div key={i} className="flex gap-3 p-3 rounded-xl bg-surface-2 hover:bg-border transition-colors">
          <div className="w-9 h-9 rounded-xl bg-primary/15 flex items-center justify-center text-lg flex-shrink-0">
            {insight.icon}
          </div>
          <div>
            <p className="text-sm font-semibold text-text-primary">{insight.title}</p>
            <p className="text-xs text-text-muted mt-0.5 leading-relaxed">{insight.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
