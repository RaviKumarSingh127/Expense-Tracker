import { NavLink } from "react-router-dom";
import { LayoutDashboard, CreditCard, Wallet, PieChart, Target } from "lucide-react";

const items = [
  { to: "/dashboard",    icon: LayoutDashboard, label: "Home" },
  { to: "/transactions", icon: CreditCard,       label: "Transactions" },
  { to: "/budgets",      icon: Wallet,           label: "Budgets" },
  { to: "/analytics",   icon: PieChart,         label: "Analytics" },
  { to: "/goals",       icon: Target,           label: "Goals" },
];

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-surface/95 backdrop-blur-xl border-t border-border flex md:hidden">
      {items.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-1 py-3 text-xs font-medium transition-colors ${
              isActive ? "text-primary" : "text-text-muted"
            }`
          }
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
