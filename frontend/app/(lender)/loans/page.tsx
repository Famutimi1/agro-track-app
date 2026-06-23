"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search, Filter, Eye, TrendingUp, TrendingDown,
  DollarSign, Calendar, ChevronRight, AlertTriangle,
  CheckCircle, Clock, XCircle
} from "lucide-react";

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  ACTIVE: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", label: "Active" },
  PENDING: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", label: "Pending" },
  COMPLETED: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", label: "Completed" },
  DEFAULTED: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", label: "Defaulted" },
};

const mockLoans = [
  {
    id: "LN-2025-001",
    borrower: { name: "Musa Garba", farmerId: "FRM-2024-001", state: "Kebbi", avatar: "MG" },
    program: "CBN Rice Fund 2025",
    amount: 850000,
    disbursed: 595000,
    repaid: 340000,
    status: "ACTIVE",
    interestRate: 9,
    startDate: "2025-02-15",
    dueDate: "2026-02-15",
    nextPayment: { amount: 85000, dueDate: "2025-07-15" },
    trancheProgress: { current: 2, total: 3 },
  },
  {
    id: "LN-2025-002",
    borrower: { name: "Amina Bello", farmerId: "FRM-2024-002", state: "Kano", avatar: "AB" },
    program: "CBN Rice Fund 2025",
    amount: 500000,
    disbursed: 500000,
    repaid: 500000,
    status: "COMPLETED",
    interestRate: 9,
    startDate: "2024-06-01",
    dueDate: "2025-06-01",
    nextPayment: null,
    trancheProgress: { current: 3, total: 3 },
  },
  {
    id: "LN-2025-003",
    borrower: { name: "Chidi Okonkwo", farmerId: "FRM-2024-003", state: "Anambra", avatar: "CO" },
    program: "NIRSAL Cassava Grant",
    amount: 400000,
    disbursed: 160000,
    repaid: 0,
    status: "PENDING",
    interestRate: 0,
    startDate: "2025-06-20",
    dueDate: "2026-06-20",
    nextPayment: null,
    trancheProgress: { current: 1, total: 3 },
  },
  {
    id: "LN-2025-004",
    borrower: { name: "Ibrahim Sule", farmerId: "FRM-2024-006", state: "Sokoto", avatar: "IS" },
    program: "CBN Rice Fund 2024",
    amount: 600000,
    disbursed: 600000,
    repaid: 180000,
    status: "DEFAULTED",
    interestRate: 9,
    startDate: "2024-03-01",
    dueDate: "2025-03-01",
    daysOverdue: 112,
    nextPayment: { amount: 420000, dueDate: "2025-03-01", overdue: true },
    trancheProgress: { current: 3, total: 3 },
  },
];

export default function LoansPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const filteredLoans = mockLoans.filter(loan => {
    const matchesSearch = loan.borrower.name.toLowerCase().includes(search.toLowerCase()) ||
                          loan.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || loan.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    totalDisbursed: mockLoans.reduce((sum, l) => sum + l.disbursed, 0),
    totalRepaid: mockLoans.reduce((sum, l) => sum + l.repaid, 0),
    activeLoans: mockLoans.filter(l => l.status === "ACTIVE").length,
    atRisk: mockLoans.filter(l => l.status === "DEFAULTED").length,
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text)]">Active Loans</h1>
        <p className="text-sm text-[var(--muted)]">Monitor and manage all loan disbursements</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <DollarSign size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Total Disbursed</p>
              <p className="text-xl font-bold text-[var(--text)]">₦{(stats.totalDisbursed / 1000000).toFixed(2)}M</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <TrendingUp size={20} className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Total Repaid</p>
              <p className="text-xl font-bold text-[var(--text)]">₦{(stats.totalRepaid / 1000000).toFixed(2)}M</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-green/10 flex items-center justify-center">
              <CheckCircle size={20} className="text-brand-green" />
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">Active Loans</p>
              <p className="text-xl font-bold text-[var(--text)]">{stats.activeLoans}</p>
            </div>
          </div>
        </div>
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <AlertTriangle size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-sm text-[var(--muted)]">At Risk / Defaulted</p>
              <p className="text-xl font-bold text-red-600">{stats.atRisk}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search by loan ID or borrower name..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm"
        >
          <option value="ALL">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending</option>
          <option value="COMPLETED">Completed</option>
          <option value="DEFAULTED">Defaulted</option>
        </select>
      </div>

      {/* Loans Table */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[var(--background)]">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Loan ID</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Borrower</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Amount</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Progress</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Next Payment</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Status</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filteredLoans.map(loan => {
              const status = statusConfig[loan.status];
              const repaymentPercent = Math.round((loan.repaid / loan.amount) * 100);
              const disbursementPercent = Math.round((loan.disbursed / loan.amount) * 100);

              return (
                <tr key={loan.id} className="hover:bg-[var(--background)] transition-colors">
                  <td className="px-4 py-4">
                    <p className="font-mono font-semibold text-[var(--text)]">{loan.id}</p>
                    <p className="text-xs text-[var(--muted)]">{loan.program}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-green flex items-center justify-center text-white font-semibold text-sm">
                        {loan.borrower.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-sm text-[var(--text)]">{loan.borrower.name}</p>
                        <p className="text-xs text-[var(--muted)]">{loan.borrower.state}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-[var(--text)]">₦{loan.amount.toLocaleString()}</p>
                    <p className="text-xs text-[var(--muted)]">{loan.interestRate}% interest</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="space-y-1.5">
                      <div>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-[var(--muted)]">Disbursed</span>
                          <span className="font-medium text-[var(--text)]">{disbursementPercent}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${disbursementPercent}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-0.5">
                          <span className="text-[var(--muted)]">Repaid</span>
                          <span className="font-medium text-[var(--text)]">{repaymentPercent}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: `${repaymentPercent}%` }} />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {loan.nextPayment ? (
                      <div>
                        <p className={`font-semibold ${loan.nextPayment.overdue ? "text-red-600" : "text-[var(--text)]"}`}>
                          ₦{loan.nextPayment.amount.toLocaleString()}
                        </p>
                        <p className={`text-xs ${loan.nextPayment.overdue ? "text-red-500" : "text-[var(--muted)]"}`}>
                          {loan.nextPayment.overdue ? `${loan.daysOverdue} days overdue` : `Due ${new Date(loan.nextPayment.dueDate).toLocaleDateString()}`}
                        </p>
                      </div>
                    ) : (
                      <span className="text-sm text-[var(--muted)]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                    <p className="text-xs text-[var(--muted)] mt-1">
                      Tranche {loan.trancheProgress.current}/{loan.trancheProgress.total}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/loans/${loan.id}`}
                      className="inline-flex items-center gap-1 text-sm text-brand-green hover:underline"
                    >
                      View <ChevronRight size={14} />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
