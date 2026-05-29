import { clsx } from "clsx";

const variants = {
  income: "bg-accent/15 text-accent border border-accent/20",
  expense: "bg-danger/15 text-danger border border-danger/20",
  warning: "bg-warning/15 text-warning border border-warning/20",
  primary: "bg-primary/15 text-primary border border-primary/20",
  muted: "bg-surface-2 text-text-muted border border-border",
};

export default function Badge({ children, variant = "muted", className = "" }) {
  return (
    <span className={clsx("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", variants[variant], className)}>
      {children}
    </span>
  );
}
