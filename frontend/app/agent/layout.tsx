"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Leaf, Home, Users, MapPin, DollarSign, Settings,
  Menu, X, LogOut, Bell, Wifi, WifiOff
} from "lucide-react";
import { SignOutButton } from "@/components/shared/sign-out-button";
import { FieldAgentGuard } from "@/components/auth";

const navItems = [
  { icon: Home, label: "Dashboard", href: "/agent/dashboard" },
  { icon: Users, label: "Farmers", href: "/agent/farmers" },
  { icon: MapPin, label: "Visits", href: "/agent/visits" },
  { icon: DollarSign, label: "Earnings", href: "/agent/earnings" },
  { icon: Settings, label: "Settings", href: "/agent/settings" },
];

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isOnline, setIsOnline] = useState(true);

  return (
    <FieldAgentGuard>
    <div className="flex min-h-screen bg-[var(--background)]">
      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-orange-900 transition-all duration-300 z-40 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="flex items-center gap-3 p-4 border-b border-orange-800">
          <div className="w-10 h-10 bg-orange-700 rounded-xl flex items-center justify-center">
            <Leaf size={20} className="text-brand-gold" />
          </div>
          {sidebarOpen && (
            <div>
              <p className="font-bold text-white">AgroTrack</p>
              <p className="text-xs text-orange-300">Field Agent</p>
            </div>
          )}
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-orange-800 text-white"
                    : "text-orange-200 hover:bg-orange-800/50 hover:text-white"
                }`}
              >
                <Icon size={20} />
                {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sync Status */}
        {sidebarOpen && (
          <div className="absolute bottom-20 left-0 right-0 px-4">
            <div className={`p-3 rounded-lg ${isOnline ? "bg-green-900/50" : "bg-red-900/50"}`}>
              <div className="flex items-center gap-2">
                {isOnline ? (
                  <Wifi size={16} className="text-green-400" />
                ) : (
                  <WifiOff size={16} className="text-red-400" />
                )}
                <span className={`text-xs font-medium ${isOnline ? "text-green-400" : "text-red-400"}`}>
                  {isOnline ? "Online - Synced" : "Offline - 3 pending"}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Logout */}
        <div className="absolute bottom-4 left-0 right-0 px-3">
          <SignOutButton />
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-20"}`}>
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-[var(--surface)] border-b border-[var(--border)] px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-[var(--background)] rounded-lg"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            <div className="flex items-center gap-4">
              <button className="relative p-2 hover:bg-[var(--background)] rounded-lg">
                <Bell size={20} className="text-[var(--muted)]" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-orange-600 flex items-center justify-center text-white font-semibold text-sm">
                  AA
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-[var(--text)]">Abubakar Ahmed</p>
                  <p className="text-xs text-[var(--muted)]">Kebbi State</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
    </FieldAgentGuard>
  );
}
