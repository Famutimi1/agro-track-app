"use client";

import { useState } from "react";
import { BorrowerSidebar } from "@/components/layout/borrower-sidebar";
import { BorrowerTopbar } from "@/components/layout/borrower-topbar";
import { BorrowerGuard } from "@/components/auth";

export default function BorrowerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <BorrowerGuard>
      <div className="flex min-h-screen bg-[var(--background)]">
        <BorrowerSidebar open={sidebarOpen} />
        <div className="flex-1 flex flex-col min-h-screen">
          <BorrowerTopbar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
          <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        </div>
      </div>
    </BorrowerGuard>
  );
}
