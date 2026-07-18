"use client";

import {
  LayoutDashboard, Sprout, Users, Banknote, RefreshCw,
  UserCheck, BarChart2, Map, MessageSquare, Settings, Leaf,
  FileText, Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/lender/dashboard" },
  { icon: FileText, label: "Applications", href: "/lender/applications" },
  { icon: Wallet, label: "Loans", href: "/lender/loans" },
  { icon: Sprout, label: "Loan Programs", href: "/lender/loan-programs" },
  { icon: Users, label: "Borrowers", href: "/lender/borrowers" },
  { icon: Banknote, label: "Disbursements", href: "/lender/disbursements" },
  { icon: RefreshCw, label: "Repayments", href: "/lender/repayments" },
  { icon: UserCheck, label: "Field Agents", href: "/lender/field-agents" },
  { icon: Users, label: "Cooperatives", href: "/lender/cooperatives" },
  { icon: BarChart2, label: "Reports", href: "/lender/reports" },
  { icon: Map, label: "Map View", href: "/lender/map-view" },
  { icon: MessageSquare, label: "Messages", href: "/lender/messages" },
  { icon: Settings, label: "Settings", href: "/lender/settings" },
];

interface LenderSidebarProps {
  open: boolean;
}

export function LenderSidebar({ open }: LenderSidebarProps) {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  const orgName = user?.lenderOrg?.name ?? `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim();
  const roleLabel =
    user?.role === "LENDER_ADMIN" ? "Admin Account" :
    user?.role === "LENDER_MANAGER" ? "Manager" :
    user?.role === "LENDER_VIEWER" ? "Viewer" : "Lender Account";

  const orgInitials = orgName
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("") || "LA";

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
              {orgInitials}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold whitespace-nowrap truncate max-w-[160px]">
                {orgName || "Account"}
              </p>
              <p className="text-white/45 text-[11px]">{roleLabel}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
