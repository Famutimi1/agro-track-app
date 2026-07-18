"use client";

import { useState } from "react";
import { LenderSidebar } from "@/components/layout/lender-sidebar";
import { LenderTopbar } from "@/components/layout/lender-topbar";
import { LenderGuard } from "@/components/auth";

export default function LenderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <LenderGuard>
      <div className="flex min-h-screen bg-[var(--background)]">
        <LenderSidebar open={sidebarOpen} />
        <div className="flex-1 flex flex-col min-h-screen">
          <LenderTopbar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
      </div>
    </LenderGuard>
  );
}
