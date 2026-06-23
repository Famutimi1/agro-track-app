"use client";

import { useState } from "react";
import {
  Search, Filter, Eye, CheckCircle, XCircle, Clock,
  FileText, User, MapPin, TrendingUp, ChevronRight,
  Calendar, DollarSign
} from "lucide-react";
import Link from "next/link";

const statusColors: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
  SUBMITTED: { bg: "bg-blue-100 dark:bg-blue-900/30", text: "text-blue-700 dark:text-blue-400", icon: Clock },
  UNDER_REVIEW: { bg: "bg-yellow-100 dark:bg-yellow-900/30", text: "text-yellow-700 dark:text-yellow-400", icon: Eye },
  APPROVED: { bg: "bg-green-100 dark:bg-green-900/30", text: "text-green-700 dark:text-green-400", icon: CheckCircle },
  REJECTED: { bg: "bg-red-100 dark:bg-red-900/30", text: "text-red-700 dark:text-red-400", icon: XCircle },
  WITHDRAWN: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-600 dark:text-gray-400", icon: FileText },
};

const mockApplications = [
  { id: "APP001", borrower: { name: "Musa Garba", farmerId: "FRM-2024-001", state: "Kebbi", avatar: "MG" }, program: "CBN Rice Fund 2025", amount: 500000, farmScore: 720, status: "SUBMITTED", submittedAt: "2025-06-20", farmSize: 2.5, crop: "Rice" },
  { id: "APP002", borrower: { name: "Amina Bello", farmerId: "FRM-2024-002", state: "Kano", avatar: "AB" }, program: "CBN Rice Fund 2025", amount: 750000, farmScore: 685, status: "UNDER_REVIEW", submittedAt: "2025-06-19", farmSize: 3.0, crop: "Rice" },
  { id: "APP003", borrower: { name: "Chidi Okonkwo", farmerId: "FRM-2024-003", state: "Anambra", avatar: "CO" }, program: "NIRSAL Cassava Grant", amount: 400000, farmScore: 810, status: "APPROVED", submittedAt: "2025-06-18", farmSize: 1.8, crop: "Cassava" },
  { id: "APP004", borrower: { name: "Fatima Yusuf", farmerId: "FRM-2024-004", state: "Kaduna", avatar: "FY" }, program: "CBN Rice Fund 2025", amount: 600000, farmScore: 450, status: "REJECTED", submittedAt: "2025-06-17", farmSize: 2.0, crop: "Rice" },
  { id: "APP005", borrower: { name: "Emeka Nwosu", farmerId: "FRM-2024-005", state: "Enugu", avatar: "EN" }, program: "Ekiti Youth Agro Fund", amount: 300000, farmScore: 590, status: "SUBMITTED", submittedAt: "2025-06-21", farmSize: 1.5, crop: "Maize" },
];

export default function ApplicationsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [programFilter, setProgramFilter] = useState("ALL");

  const filteredApps = mockApplications.filter(app => {
    const matchesSearch = app.borrower.name.toLowerCase().includes(search.toLowerCase()) ||
                          app.borrower.farmerId.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || app.status === statusFilter;
    const matchesProgram = programFilter === "ALL" || app.program === programFilter;
    return matchesSearch && matchesStatus && matchesProgram;
  });

  const stats = {
    total: mockApplications.length,
    pending: mockApplications.filter(a => a.status === "SUBMITTED" || a.status === "UNDER_REVIEW").length,
    approved: mockApplications.filter(a => a.status === "APPROVED").length,
    rejected: mockApplications.filter(a => a.status === "REJECTED").length,
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text)]">Loan Applications</h1>
        <p className="text-sm text-[var(--muted)]">Review and process farmer loan applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Applications", value: stats.total, color: "text-[var(--text)]", bg: "bg-[var(--surface)]" },
          { label: "Pending Review", value: stats.pending, color: "text-yellow-600", bg: "bg-yellow-50 dark:bg-yellow-900/20" },
          { label: "Approved", value: stats.approved, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
          { label: "Rejected", value: stats.rejected, color: "text-red-600", bg: "bg-red-50 dark:bg-red-900/20" },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} rounded-xl p-4 border border-[var(--border)]`}>
            <p className="text-sm text-[var(--muted)] mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search by name or farmer ID..."
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
          <option value="SUBMITTED">Submitted</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>
        <select
          value={programFilter}
          onChange={e => setProgramFilter(e.target.value)}
          className="px-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm"
        >
          <option value="ALL">All Programs</option>
          <option value="CBN Rice Fund 2025">CBN Rice Fund 2025</option>
          <option value="NIRSAL Cassava Grant">NIRSAL Cassava Grant</option>
          <option value="Ekiti Youth Agro Fund">Ekiti Youth Agro Fund</option>
        </select>
      </div>

      {/* Applications Table */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[var(--background)]">
            <tr>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Applicant</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Program</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Amount</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">FarmScore</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Submitted</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {filteredApps.map(app => {
              const statusStyle = statusColors[app.status];
              const StatusIcon = statusStyle.icon;
              return (
                <tr key={app.id} className="hover:bg-[var(--background)] transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-green flex items-center justify-center text-white font-semibold text-sm">
                        {app.borrower.avatar}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--text)]">{app.borrower.name}</p>
                        <div className="flex items-center gap-2 text-xs text-[var(--muted)]">
                          <span>{app.borrower.farmerId}</span>
                          <span>•</span>
                          <MapPin size={12} />
                          <span>{app.borrower.state}</span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-sm text-[var(--text)]">{app.program}</p>
                    <p className="text-xs text-[var(--muted)]">{app.crop} • {app.farmSize} ha</p>
                  </td>
                  <td className="px-4 py-4">
                    <p className="font-semibold text-[var(--text)]">₦{app.amount.toLocaleString()}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp size={14} className={app.farmScore >= 700 ? "text-green-500" : app.farmScore >= 500 ? "text-yellow-500" : "text-red-500"} />
                      <span className={`font-semibold ${app.farmScore >= 700 ? "text-green-600" : app.farmScore >= 500 ? "text-yellow-600" : "text-red-600"}`}>
                        {app.farmScore}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                      <StatusIcon size={12} />
                      {app.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-sm text-[var(--muted)]">
                    {new Date(app.submittedAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <Link
                      href={`/applications/${app.id}`}
                      className="inline-flex items-center gap-1 text-sm text-brand-green hover:underline"
                    >
                      Review <ChevronRight size={14} />
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
