"use client";

import {
  LayoutDashboard, Users, BarChart2, MessageSquare, Zap,
  Activity, DollarSign, Shield, Settings, UserCog, Building2, FileCheck, Receipt, Megaphone, Plug,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/stores";

const navItems = [
  { icon: LayoutDashboard, label: "Overview", href: "/admin/overview" },
  { icon: Users, label: "User Management", href: "/admin/users" },
  { icon: Building2, label: "Lender Accounts", href: "/admin/lender-accounts" },
  { icon: UserCog, label: "Role Management", href: "/admin/roles" },
  { icon: FileCheck, label: "Verification", href: "/admin/verification" },
  { icon: Receipt, label: "Transactions", href: "/admin/transactions" },
  { icon: BarChart2, label: "Platform Analytics", href: "/admin/analytics" },
  { icon: MessageSquare, label: "Support Tickets", href: "/admin/support-tickets" },
  { icon: Megaphone, label: "Announcements", href: "/admin/announcements" },
  { icon: Zap, label: "Feature Flags", href: "/admin/feature-flags" },
  { icon: Plug, label: "Integrations", href: "/admin/integrations" },
  { icon: Activity, label: "System Health", href: "/admin/system-health" },
  { icon: DollarSign, label: "Billing & Revenue", href: "/admin/billing" },
  { icon: Shield, label: "Security & Audit", href: "/admin/security" },
  { icon: Settings, label: "Admin Settings", href: "/admin/platform-settings" },
];

interface AdminSidebarProps {
  open: boolean;
}

export function AdminSidebar({ open }: AdminSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuthStore();

  const fullName = user ? `${user.firstName} ${user.lastName}`.trim() : "";
  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "SA";

  return (
    <aside
      className={cn(
        "flex-shrink-0 bg-slate-950 dark:bg-slate-950 border-r border-slate-800 flex flex-col transition-[width] duration-300 overflow-hidden min-h-screen",
        open ? "w-60" : "w-[68px]"
      )}
    >
      <div className="px-4 py-5 border-b border-white/[0.07] flex items-center gap-2.5">
        <div className="w-[34px] h-[34px] bg-gradient-to-br from-red-600 to-red-700 rounded-[9px] flex items-center justify-center flex-shrink-0">
          <Shield size={17} className="text-white" />
        </div>
        {open && (
          <div>
            <p className="text-gray-50 font-extrabold text-sm whitespace-nowrap">
              AgroTrack Admin
            </p>
            <p className="text-white/40 text-[10px]">Super Admin Console</p>
          </div>
        )}
      </div>

      <nav className="flex-1 px-2 py-3 flex flex-col gap-0.5">
        {navItems.map(({ icon: Icon, label, href }) => {
          const active = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={cn(
                "flex items-center gap-2.5 w-full px-2.5 py-[9px] rounded-lg text-[13px] whitespace-nowrap transition-colors border-l-2",
                active
                  ? "bg-red-600/15 text-red-400 font-bold border-red-500"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5 border-transparent"
              )}
            >
              <Icon size={16} className="flex-shrink-0" />
              {open && <span>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {open && (
        <div className="px-4 py-3 border-t border-white/[0.07]">
          <div className="flex items-center gap-2">
            <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-gray-50 text-xs font-semibold truncate">{fullName || "Admin"}</p>
              <p className="text-white/35 text-[10px] truncate">{user?.email ?? ""}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
