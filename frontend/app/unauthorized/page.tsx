"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/lib/stores";

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
      <div className="max-w-md w-full p-8 text-center">
        <div className="text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
        <p className="text-[var(--muted)] mb-6">
          You don&apos;t have permission to access this page.
          {user && (
            <span className="block mt-2">
              Logged in as: <strong>{user.email}</strong> ({user.role})
            </span>
          )}
        </p>
        <div className="flex flex-col gap-3">
          <Button onClick={() => router.back()} variant="outline">
            Go Back
          </Button>
          <Link href="/">
            <Button variant="secondary" className="w-full">
              Go to Home
            </Button>
          </Link>
          <Button onClick={handleLogout} variant="ghost">
            Sign Out
          </Button>
        </div>
      </div>
    </div>
  );
}
