"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Menu, Search, Moon, Sun, Bell, Loader2, CheckCheck } from "lucide-react";
import { useTheme } from "next-themes";
import { UserMenu } from "./user-menu";
import { notificationsApi, type Notification } from "@/lib/api";

interface AdminTopbarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
}

const relativeTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

export function AdminTopbar({ sidebarOpen, setSidebarOpen }: AdminTopbarProps) {
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const dark = resolvedTheme === "dark";

  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  // Initial unread count, refreshed on a light interval.
  useEffect(() => {
    let active = true;
    const fetchCount = async () => {
      try {
        const count = await notificationsApi.getUnreadCount();
        if (active) setUnread(count);
      } catch {
        // Silent — the bell simply shows no badge if the count can't load.
      }
    };
    fetchCount();
    const t = setInterval(fetchCount, 60000);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, []);

  // Close the dropdown on outside click.
  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const toggleDropdown = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      setLoading(true);
      try {
        const res = await notificationsApi.list({ limit: 8 });
        setItems(res.data);
      } catch {
        setItems([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const openNotification = async (n: Notification) => {
    if (!n.read) {
      try {
        await notificationsApi.markAsRead(n.id);
        setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)));
        setUnread((c) => Math.max(0, c - 1));
      } catch {
        // ignore — navigation still proceeds
      }
    }
    setOpen(false);
    if (n.actionUrl) router.push(n.actionUrl);
  };

  const markAll = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setItems((prev) => prev.map((x) => ({ ...x, read: true })));
      setUnread(0);
    } catch {
      // ignore
    }
  };

  return (
    <header className="h-16 flex items-center px-6 gap-4 bg-[var(--surface)] border-b border-[var(--border)] sticky top-0 z-10">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="bg-transparent border-none cursor-pointer text-[var(--muted)] p-1"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-2 flex-1 max-w-[360px] bg-[var(--input-bg)] border border-[var(--border)] rounded-[10px] px-3 py-2">
        <Search size={15} className="text-gray-400" />
        <input
          className="bg-transparent border-none outline-none text-[13px] flex-1 text-[var(--text)] placeholder:text-[var(--muted)]"
          placeholder="Search lenders, tickets..."
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

        <div className="relative" ref={bellRef}>
          <button
            onClick={toggleDropdown}
            className="w-9 h-9 rounded-[10px] border border-[var(--border)] bg-[var(--input-bg)] flex items-center justify-center cursor-pointer"
          >
            <Bell size={15} className="text-red-500" />
          </button>
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-red-500 rounded-full text-white text-[10px] flex items-center justify-center font-bold">
              {unread > 99 ? "99+" : unread}
            </span>
          )}

          {open && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-lg py-2 z-20">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)]">
                <p className="text-[13px] font-semibold text-[var(--text)]">Notifications</p>
                {unread > 0 && (
                  <button
                    onClick={markAll}
                    className="flex items-center gap-1 text-[11px] font-semibold text-brand-green hover:underline cursor-pointer"
                  >
                    <CheckCheck size={13} /> Mark all read
                  </button>
                )}
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-brand-green" />
                </div>
              ) : items.length === 0 ? (
                <div className="py-8 text-center text-xs text-[var(--muted)]">No notifications</div>
              ) : (
                <div className="max-h-80 overflow-y-auto">
                  {items.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => openNotification(n)}
                      className={`w-full text-left px-4 py-2.5 hover:bg-[var(--input-bg)] cursor-pointer border-b border-[var(--border)] last:border-0 ${
                        n.read ? "" : "bg-brand-green/[0.04]"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-brand-green flex-shrink-0 mt-1.5" />}
                        <div className={`flex-1 min-w-0 ${n.read ? "pl-3.5" : ""}`}>
                          <p className="text-[12px] font-semibold text-[var(--text)] truncate">{n.title}</p>
                          <p className="text-[11px] text-[var(--muted)] line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-[var(--muted)] mt-0.5">{relativeTime(n.createdAt)}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <UserMenu settingsHref="/admin/platform-settings" />
      </div>
    </header>
  );
}
