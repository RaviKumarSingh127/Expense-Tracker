import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard, CreditCard, Target, PieChart, Settings, LogOut, Wallet, Bot,
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import { useAIStore } from "@/store/useAIStore";

const navItems = [
  { to: "/dashboard",    icon: LayoutDashboard, label: "Dashboard" },
  { to: "/transactions", icon: CreditCard,       label: "Transactions" },
  { to: "/budgets",      icon: Wallet,           label: "Budgets" },
  { to: "/analytics",   icon: PieChart,         label: "Analytics" },
  { to: "/goals",       icon: Target,           label: "Goals" },
];

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const { toggleChat } = useAIStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside className="w-60 h-screen bg-surface border-r border-border flex flex-col fixed left-0 top-0 z-30">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-glow">
            <span className="text-white font-bold text-sm">FF</span>
          </div>
          <span className="font-bold text-lg gradient-text font-display">FlowFin</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-text-muted hover:text-text-primary hover:bg-surface-2"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={18} className={isActive ? "text-primary" : ""} />
                {label}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                  />
                )}
              </>
            )}
          </NavLink>
        ))}

        {/* AI Chat Button */}
        <button
          onClick={toggleChat}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-text-muted hover:text-accent hover:bg-accent/10 transition-all duration-200 mt-2"
        >
          <Bot size={18} />
          AI Assistant
          <span className="ml-auto text-xs bg-accent/20 text-accent px-1.5 py-0.5 rounded-full">AI</span>
        </button>
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-border space-y-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive ? "bg-surface-2 text-text-primary" : "text-text-muted hover:text-text-primary hover:bg-surface-2"
            }`
          }
        >
          <Settings size={18} />
          Settings
        </NavLink>
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-semibold text-sm flex-shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">{user?.name}</p>
            <p className="text-xs text-text-muted truncate">{user?.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
