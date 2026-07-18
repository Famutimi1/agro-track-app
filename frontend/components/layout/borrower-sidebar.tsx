"use client";

import {
  Home, CreditCard, FileText, TrendingUp, Search,
  MessageSquare, Settings, Leaf,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores";
import { useUnreadCount } from "@/lib/hooks";

const navItems = [
  { icon: Home, label: "Overview", href: "/borrower/overview" },
  { icon: FileText, label: "Applications", href: "/borrower/applications" },
  { icon: CreditCard, label: "My Loans", href: "/borrower/loans" },
  { icon: TrendingUp, label: "FarmScore", href: "/borrower/farm-score" },
  { icon: Search, label: "Discover", href: "/borrower/discover" },
  { icon: MessageSquare, label: "Messages", href: "/borrower/messages" },
  { icon: Settings, label: "Settings", href: "/borrower/settings" },
];

interface BorrowerSidebarProps {
  open: boolean;
}

export function BorrowerSidebar({ open }: BorrowerSidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);
  const { data: unreadCount = 0 } = useUnreadCount();

  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : "";
  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "U";

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
          const showBadge = label === "Messages" && unreadCount > 0;
          return (
            <Link
              key={label}
              href={href}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] text-[13px] whitespace-nowrap transition-colors relative",
                active
                  ? "bg-brand-gold text-brand-green font-semibold"
                  : "text-white/65 hover:text-white hover:bg-white/10"
              )}
            >
              <span className="relative flex-shrink-0">
                <Icon size={17} />
                {showBadge && !open && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[15px] h-[15px] px-1 bg-red-500 rounded-full text-white text-[9px] font-bold flex items-center justify-center">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </span>
              {open && <span className="flex-1">{label}</span>}
              {open && showBadge && (
                <span className="min-w-[18px] h-[18px] px-1 bg-red-500 rounded-full text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {open && (
        <div className="px-4 py-3 border-t border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center text-brand-green font-bold text-xs flex-shrink-0">
              {initials}
            </div>
            <div>
              <p className="text-white text-xs font-semibold whitespace-nowrap">
                {fullName || "Account"}
              </p>
              <p className="text-white/45 text-[11px]">Borrower</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
