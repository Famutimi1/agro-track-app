"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Leaf, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

const navLinks = [
  { label: "Features", href: "/features" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Pricing", href: "/pricing" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Contact", href: "/contact" },
];

export function PublicNav() {
  const { resolvedTheme, setTheme } = useTheme();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const dark = resolvedTheme === "dark";

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(dark ? "light" : "dark");
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[var(--nav-bg)] backdrop-blur-md border-b border-[var(--border)]">
      <div className="max-w-[1200px] mx-auto flex items-center h-[68px] gap-8 px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-[34px] h-[34px] bg-gradient-to-br from-brand-green to-brand-green-light rounded-[9px] flex items-center justify-center">
            <Leaf size={17} className="text-brand-gold" />
          </div>
          <span className="font-black text-[19px] tracking-tight text-brand-green dark:text-gray-50">
            AgroTrack
          </span>
        </Link>

        <div className="flex gap-1 flex-1 ml-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[13px] font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  isActive
                    ? "text-brand-green bg-green-50 dark:bg-green-900/30"
                    : "text-[var(--muted)] hover:text-brand-green"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="flex gap-2.5 items-center">
          {mounted && (
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg border border-[var(--border)] bg-[var(--surface)] flex items-center justify-center hover:bg-[var(--background)] transition-colors"
              aria-label="Toggle dark mode"
            >
              {dark ? (
                <Sun size={18} className="text-brand-gold" />
              ) : (
                <Moon size={18} className="text-[var(--muted)]" />
              )}
            </button>
          )}
          <Link href="/register">
            <Button variant="secondary" size="sm">
              Borrower Portal
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="gold" size="sm">
              Lender Login →
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
