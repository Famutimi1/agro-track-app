"use client";

import { Menu, Search, Moon, Sun, Bell } from "lucide-react";
import { useTheme } from "next-themes";

interface BorrowerTopbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}

export function BorrowerTopbar({ sidebarOpen, setSidebarOpen }: BorrowerTopbarProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";

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

      <div className="flex gap-2.5 ml-auto">
        <button
          onClick={() => setTheme(dark ? "light" : "dark")}
          className="w-9 h-9 rounded-[10px] border border-[var(--border)] bg-[var(--input-bg)] flex items-center justify-center cursor-pointer"
        >
          {dark ? (
            <Sun size={15} className="text-yellow-400" />
          ) : (
            <Moon size={15} className="text-yellow-800" />
          )}
        </button>
        <div className="relative">
          <button className="w-9 h-9 rounded-[10px] border border-[var(--border)] bg-[var(--input-bg)] flex items-center justify-center cursor-pointer">
            <Bell size={15} className="text-blue-600 dark:text-gray-400" />
          </button>
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
            2
          </span>
        </div>
      </div>
    </header>
  );
}
