import { Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import MobileNav from "./MobileNav";
import AIChatBot from "@/components/ai/AIChatBot";

export default function AppLayout() {
  return (
    <div className="flex h-screen bg-bg overflow-hidden">
      {/* Sidebar — desktop only */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-60 overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 pb-24 md:pb-6">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      {/* Mobile nav */}
      <MobileNav />

      {/* AI Chatbot */}
      <AIChatBot />
    </div>
  );
}
