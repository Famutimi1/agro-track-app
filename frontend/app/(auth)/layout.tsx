import { Leaf } from "lucide-react";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-brand-green to-brand-green-light rounded-[10px] flex items-center justify-center">
              <Leaf size={18} className="text-brand-gold" />
            </div>
            <span className="font-black text-xl text-[var(--text)]">AgroTrack</span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
