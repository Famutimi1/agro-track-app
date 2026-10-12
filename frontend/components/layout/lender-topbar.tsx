"use client";

import { Menu, Search, Moon, Sun, Bell, Plus } from "lucide-react";
import { SignOutButton } from "@/components/shared/sign-out-button";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

interface LenderTopbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
  placeholder?: string;
  onNew?: () => void;
  newLabel?: string;
}

export function LenderTopbar({
  sidebarOpen,
  setSidebarOpen,
  placeholder = "Search...",
  onNew,
  newLabel = "New",
}: LenderTopbarProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  return (
    <header className="h-16 flex items-center px-6 gap-4 bg-[var(--surface)] border-b border-[var(--border)] sticky top-0 z-10">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Toggle navigation" className="bg-transparent border-none cursor-pointer text-[var(--muted)] p-1"
      >
        <Menu size={20} />
      </button>

      <div className="flex gap-2.5 ml-auto items-center">
        <SignOutButton />
        <button
          aria-label="Toggle dark mode"
          onClick={() => setTheme(dark ? "light" : "dark")}
          className="w-9 h-9 rounded-[10px] border border-[var(--border)] bg-[var(--input-bg)] flex items-center justify-center cursor-pointer"
        >
          {dark ? (
            <Sun size={15} className="text-yellow-400" />
          ) : (
            <Moon size={15} className="text-yellow-800" />
          )}
        </button>



        {onNew && (
          <Button variant="gold" size="md" onClick={onNew}>
            <Plus size={15} /> {newLabel}
          </Button>
        )}
      </div>
    </header>
  );
}
