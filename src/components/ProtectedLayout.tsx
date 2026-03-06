import { useState } from "react";
import { Menu } from "lucide-react";
import { Outlet } from "react-router-dom";

import { Sidebar } from "@/components/Sidebar";
import { PraxisBackgroundServices } from "@/features/praxis/PraxisBackgroundServices";

export function ProtectedLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full">
      <PraxisBackgroundServices />

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 border-b bg-card">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 hover:bg-accent rounded-md transition-colors"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="text-lg font-semibold text-foreground">Praxis</span>
        <div className="w-9" />
      </div>

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-30" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar - desktop */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Sidebar - mobile */}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 w-64 bg-card shadow-lg z-40 transform transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <Sidebar onNavigate={() => setMobileOpen(false)} />
      </div>

      {/* Main content */}
      <main className="lg:ml-64 flex-1 overflow-y-auto bg-background pt-14 lg:pt-0">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
