"use client";

import { Menu, Search, Moon, Sun, Bell, TrendingUp } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import Link from "next/link";
import { UserMenu } from "./user-menu";
import { useMyFarmScore } from "@/lib/hooks";
import { useUnreadNotificationCount } from "@/lib/hooks";

const TIER_DOT: Record<string, string> = {
  EXCELLENT: "bg-purple-500",
  GOOD: "bg-green-500",
  FAIR: "bg-yellow-500",
  POOR: "bg-orange-500",
  VERY_POOR: "bg-red-500",
};

interface BorrowerTopbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}

export function BorrowerTopbar({ sidebarOpen, setSidebarOpen }: BorrowerTopbarProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { data: scoreData } = useMyFarmScore();
  const { data: notifCount = 0 } = useUnreadNotificationCount();

  return (
    <header className="h-16 flex items-center px-6 gap-4 bg-[var(--surface)] border-b border-[var(--border)] sticky top-0 z-10">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="bg-transparent border-none cursor-pointer text-[var(--muted)] p-1"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-2 flex-1 max-w-[360px] bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2">
        <Search size={15} className="text-green-400 dark:text-gray-400" />
        <input
          className="bg-transparent border-none outline-none text-[13px] flex-1 text-[var(--text)] placeholder:text-[var(--muted)]"
          placeholder="Search loans, reports..."
        />
      </div>

      <div className="flex gap-2.5 ml-auto items-center">
        {scoreData?.score != null && (
          <Link
            href="/borrower/farm-score"
            className="hidden sm:flex items-center gap-2 h-9 px-3 rounded-[10px] border border-[var(--border)] bg-[var(--input-bg)] cursor-pointer hover:border-brand-green/50 transition-colors"
            title="View your FarmScore"
          >
            <span className={`w-2 h-2 rounded-full ${TIER_DOT[scoreData.tier] || "bg-gray-400"}`} />
            <TrendingUp size={14} className="text-brand-green" />
            <span className="text-[13px] font-bold text-[var(--text)]">{scoreData.score}</span>
          </Link>
        )}
        <button
          onClick={() => setTheme(dark ? "light" : "dark")}
          className="w-9 h-9 rounded-[10px] border border-[var(--border)] bg-[var(--input-bg)] flex items-center justify-center cursor-pointer"
        >
          {mounted && dark ? (
            <Sun size={15} className="text-yellow-400" />
          ) : (
            <Moon size={15} className="text-yellow-800" />
          )}
        </button>
        <Link href="/borrower/messages" className="relative">
          <button className="w-9 h-9 rounded-[10px] border border-[var(--border)] bg-[var(--input-bg)] flex items-center justify-center cursor-pointer">
            <Bell size={15} className="text-blue-600 dark:text-gray-400" />
          </button>
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
              {notifCount > 9 ? "9+" : notifCount}
            </span>
          )}
        </Link>

        <UserMenu settingsHref="/borrower/settings" />
      </div>
    </header>
  );
}
