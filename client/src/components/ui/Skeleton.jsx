import { clsx } from "clsx";

export default function Skeleton({ className = "", ...props }) {
  return (
    <div
      className={clsx("bg-surface-2 animate-pulse rounded-xl", className)}
      {...props}
    />
  );
}

export function SkeletonCard({ rows = 3 }) {
  return (
    <div className="glass-card p-6 space-y-3">
      <Skeleton className="h-5 w-1/3" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className={`h-4 ${i % 2 === 0 ? "w-full" : "w-3/4"}`} />
      ))}
    </div>
  );
}

export function SkeletonKPI() {
  return (
    <div className="glass-card p-6 space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}
