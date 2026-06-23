import { Leaf } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-[var(--surface)] border-t border-[var(--border)] py-12 px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex items-center gap-2 mb-6">
          <div className="w-8 h-8 bg-gradient-to-br from-brand-green to-brand-green-light rounded-lg flex items-center justify-center">
            <Leaf size={15} className="text-brand-gold" />
          </div>
          <span className="font-black text-lg text-[var(--text)]">AgroTrack</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h4 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider mb-3">Product</h4>
            <div className="flex flex-col gap-2">
              <Link href="/features" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">Features</Link>
              <Link href="/pricing" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">Pricing</Link>
              <Link href="/how-it-works" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">How It Works</Link>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider mb-3">Company</h4>
            <div className="flex flex-col gap-2">
              <Link href="/contact" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">Contact</Link>
              <Link href="/testimonials" className="text-sm text-[var(--muted)] hover:text-[var(--text)]">Testimonials</Link>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider mb-3">Legal</h4>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-[var(--muted)]">Privacy Policy</span>
              <span className="text-sm text-[var(--muted)]">Terms of Service</span>
            </div>
          </div>
          <div>
            <h4 className="text-xs font-bold text-[var(--text)] uppercase tracking-wider mb-3">Support</h4>
            <div className="flex flex-col gap-2">
              <span className="text-sm text-[var(--muted)]">help@agrotrack.ng</span>
              <span className="text-sm text-[var(--muted)]">+234 800 AGRO TRK</span>
            </div>
          </div>
        </div>
        <div className="border-t border-[var(--border)] pt-6 text-center">
          <p className="text-xs text-[var(--muted)]">
            © 2025 AgroTrack Technologies Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
