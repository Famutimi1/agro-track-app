"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Settings } from "lucide-react";
import { useAuthStore } from "@/lib/stores";

const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: "Platform Admin",
  LENDER_ADMIN: "Lender Admin",
  LENDER_MANAGER: "Lender Manager",
  LENDER_VIEWER: "Lender Viewer",
  LENDER_ANALYST: "Lender Analyst",
  BORROWER: "Borrower",
  FIELD_AGENT: "Field Agent",
  FIELD_SUPERVISOR: "Field Supervisor",
  COOP_CHAIR: "Cooperative Chair",
};

interface UserMenuProps {
  /** Route to the user's settings page, used for the "Profile settings" link. */
  settingsHref?: string;
}

export function UserMenu({ settingsHref }: UserMenuProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  if (!user) return null;

  const fullName = `${user.firstName} ${user.lastName}`.trim();
  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() || "U";
  const roleLabel = ROLE_LABELS[user.role] ?? user.role;

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-[10px] border border-[var(--border)] bg-[var(--input-bg)] pl-1.5 pr-2.5 py-1 cursor-pointer"
      >
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt={fullName}
            className="w-7 h-7 rounded-full object-cover flex-shrink-0"
          />
        ) : (
          <span className="w-7 h-7 rounded-full bg-brand-gold text-brand-green font-bold text-[11px] flex items-center justify-center flex-shrink-0">
            {initials}
          </span>
        )}
        <span className="hidden sm:flex flex-col items-start leading-tight">
          <span className="text-[12px] font-semibold text-[var(--text)] whitespace-nowrap max-w-[140px] truncate">
            {fullName || user.email}
          </span>
          <span className="text-[10px] text-[var(--muted)]">{roleLabel}</span>
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg py-2 z-20">
          <div className="px-4 py-2 border-b border-[var(--border)]">
            <p className="text-[13px] font-semibold text-[var(--text)] truncate">{fullName || user.email}</p>
            <p className="text-[11px] text-[var(--muted)] truncate">{user.email}</p>
            {user.borrowerProfile?.farmerId && (
              <p className="text-[11px] text-[var(--muted)] mt-0.5">
                Farmer ID: {user.borrowerProfile.farmerId}
              </p>
            )}
            {user.lenderOrg?.name && (
              <p className="text-[11px] text-[var(--muted)] mt-0.5 truncate">{user.lenderOrg.name}</p>
            )}
          </div>

          {settingsHref && (
            <button
              onClick={() => {
                setOpen(false);
                router.push(settingsHref);
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-[var(--text)] hover:bg-[var(--input-bg)] cursor-pointer"
            >
              <Settings size={15} className="text-[var(--muted)]" /> Profile settings
            </button>
          )}

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-[13px] text-red-600 hover:bg-[var(--input-bg)] cursor-pointer"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      )}
    </div>
  );
}
