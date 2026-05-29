import { useLocation } from "react-router-dom";
import { Bell, Search } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { formatDate } from "@/utils/dateHelpers";

const PAGE_TITLES = {
  "/dashboard": "Dashboard",
  "/transactions": "Transactions",
  "/budgets": "Budgets",
  "/analytics": "Analytics",
  "/goals": "Goals",
  "/settings": "Settings",
};

export default function Topbar() {
  const { pathname } = useLocation();
  const { user } = useAuthStore();
  const title = PAGE_TITLES[pathname] || "FlowFin";

  return (
    <header className="h-16 bg-surface/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-6 sticky top-0 z-20">
      <div>
        <h1 className="text-xl font-bold text-text-primary">{title}</h1>
        <p className="text-xs text-text-muted">{formatDate(new Date(), "EEEE, dd MMMM yyyy")}</p>
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2.5 rounded-xl hover:bg-surface-2 text-text-muted hover:text-text-primary transition-colors relative">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm">
          {user?.name?.[0]?.toUpperCase()}
        </div>
      </div>
    </header>
  );
}
