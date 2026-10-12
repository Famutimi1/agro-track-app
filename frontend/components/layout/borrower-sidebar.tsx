"use client";

import {
  Home, CreditCard, FileText, TrendingUp, Search,
  MessageSquare, Settings, Leaf,
} from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/stores";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Overview", href: "/borrower-overview" },
  { icon: FileText, label: "Applications", href: "/borrower-applications" },
  { icon: CreditCard, label: "My Loans", href: "/my-loans" },
  { icon: TrendingUp, label: "FarmScore", href: "/farm-score" },
  { icon: Search, label: "Discover", href: "/discover" },
  { icon: MessageSquare, label: "Messages", href: "/borrower-messages" },
  { icon: Settings, label: "Settings", href: "/borrower-settings" },
];

interface BorrowerSidebarProps {
  open: boolean;
}

export function BorrowerSidebar({ open }: BorrowerSidebarProps) {
  const { user } = useAuthStore();
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "flex-shrink-0 bg-[var(--sidebar-bg)] border-r border-[var(--sidebar-border)] flex flex-col transition-[width] duration-300 overflow-hidden min-h-screen",
        open ? "w-[232px]" : "w-16"
      )}
    >
      <div className="flex items-center gap-2.5 px-4 py-5 border-b border-white/10">
        <div className="w-8 h-8 bg-brand-gold rounded-lg flex items-center justify-center flex-shrink-0">
          <Leaf size={16} className="text-brand-green" />
        </div>
        {open && (
          <span className="text-white font-bold text-lg tracking-tight whitespace-nowrap">
            AgroTrack
          </span>
        )}
      </div>

      <nav className="flex-1 p-3 flex flex-col gap-0.5">
        {navItems.map(({ icon: Icon, label, href }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={label}
              aria-label={label}
              title={label}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[13px] whitespace-nowrap transition-colors",
                active
                  ? "bg-brand-gold text-brand-green font-semibold"
                  : "text-white/65 hover:text-white hover:bg-white/10"
              )}
            >
              <Icon size={17} className="flex-shrink-0" />
              {open && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {open && (
        <div className="px-4 py-3 border-t border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center text-brand-green font-bold text-xs flex-shrink-0">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <p className="text-white text-xs font-semibold whitespace-nowrap">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-white/45 text-[11px]">Borrower</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
