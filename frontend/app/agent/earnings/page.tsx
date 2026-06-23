"use client";

import { useState } from "react";
import {
  DollarSign, TrendingUp, Clock, CheckCircle, Calendar,
  Download, ChevronRight, Wallet, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

const mockEarnings = {
  totalEarned: 285000,
  pendingPayout: 47500,
  thisMonth: 47500,
  lastMonth: 62500,
  totalVisits: 89,
  avgPerVisit: 3200,
};

const mockTransactions = [
  { id: "TXN001", type: "PAYOUT", amount: 62500, status: "COMPLETED", date: "2025-06-01", description: "May 2025 Earnings" },
  { id: "TXN002", type: "PAYOUT", amount: 58000, status: "COMPLETED", date: "2025-05-01", description: "April 2025 Earnings" },
  { id: "TXN003", type: "PAYOUT", amount: 55000, status: "COMPLETED", date: "2025-04-01", description: "March 2025 Earnings" },
  { id: "TXN004", type: "BONUS", amount: 10000, status: "COMPLETED", date: "2025-03-15", description: "Q1 Performance Bonus" },
  { id: "TXN005", type: "PAYOUT", amount: 52000, status: "COMPLETED", date: "2025-03-01", description: "February 2025 Earnings" },
];

const mockActivities = [
  { id: "A001", type: "Farmer Registration", farmer: "Aisha Mohammed", amount: 2500, date: "2025-06-23", status: "PENDING" },
  { id: "A002", type: "Verification Visit", farmer: "Musa Garba", amount: 3000, date: "2025-06-23", status: "PENDING" },
  { id: "A003", type: "Farm Mapping", farmer: "Amina Bello", amount: 3500, date: "2025-06-22", status: "PENDING" },
  { id: "A004", type: "Monitoring Visit", farmer: "Ibrahim Sule", amount: 2000, date: "2025-06-21", status: "PENDING" },
  { id: "A005", type: "Farmer Registration", farmer: "Bello Abdullahi", amount: 2500, date: "2025-06-20", status: "PENDING" },
];

export default function AgentEarningsPage() {
  const [tab, setTab] = useState<"activities" | "payouts">("activities");

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Earnings</h1>
          <p className="text-sm text-[var(--muted)]">Track your earnings and payment history</p>
        </div>
        <Button variant="secondary">
          <Download size={16} className="mr-2" /> Export Statement
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <p className="text-green-100 text-sm">Total Earned</p>
            <DollarSign size={20} className="text-green-200" />
          </div>
          <p className="text-3xl font-bold">₦{mockEarnings.totalEarned.toLocaleString()}</p>
          <p className="text-xs text-green-200 mt-1">All time</p>
        </div>

        <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <p className="text-orange-100 text-sm">Pending Payout</p>
            <Clock size={20} className="text-orange-200" />
          </div>
          <p className="text-3xl font-bold">₦{mockEarnings.pendingPayout.toLocaleString()}</p>
          <p className="text-xs text-orange-200 mt-1">Due July 1st</p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[var(--muted)] text-sm">This Month</p>
            <Calendar size={20} className="text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-blue-600">₦{mockEarnings.thisMonth.toLocaleString()}</p>
          <p className="text-xs text-[var(--muted)] mt-1">June 2025</p>
        </div>

        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[var(--muted)] text-sm">Avg Per Visit</p>
            <TrendingUp size={20} className="text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-purple-600">₦{mockEarnings.avgPerVisit.toLocaleString()}</p>
          <p className="text-xs text-[var(--muted)] mt-1">Based on {mockEarnings.totalVisits} visits</p>
        </div>
      </div>

      {/* Rate Card */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5 mb-6">
        <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-3">Earning Rates</h3>
        <div className="grid grid-cols-4 gap-4 text-sm">
          {[
            { activity: "Farmer Registration", rate: "₦2,500" },
            { activity: "Verification Visit", rate: "₦3,000" },
            { activity: "Farm Mapping", rate: "₦3,500" },
            { activity: "Monitoring Visit", rate: "₦2,000" },
          ].map(item => (
            <div key={item.activity} className="flex justify-between">
              <span className="text-blue-700 dark:text-blue-400">{item.activity}</span>
              <span className="font-semibold text-blue-800 dark:text-blue-300">{item.rate}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setTab("activities")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "activities"
              ? "bg-orange-600 text-white"
              : "bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--background)]"
          }`}
        >
          Pending Activities ({mockActivities.length})
        </button>
        <button
          onClick={() => setTab("payouts")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === "payouts"
              ? "bg-orange-600 text-white"
              : "bg-[var(--surface)] text-[var(--muted)] hover:bg-[var(--background)]"
          }`}
        >
          Payout History
        </button>
      </div>

      {/* Activities List */}
      {tab === "activities" && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl">
          <div className="p-4 border-b border-[var(--border)]">
            <h3 className="font-semibold text-[var(--text)]">Pending Earnings (June 2025)</h3>
            <p className="text-sm text-[var(--muted)]">These activities will be included in your next payout</p>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {mockActivities.map(activity => (
              <div key={activity.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <Clock size={18} className="text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text)]">{activity.type}</p>
                    <p className="text-sm text-[var(--muted)]">{activity.farmer} • {new Date(activity.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">+₦{activity.amount.toLocaleString()}</p>
                  <span className="text-xs text-orange-600 bg-orange-100 dark:bg-orange-900/30 px-2 py-0.5 rounded">
                    Pending
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-[var(--border)] bg-[var(--background)] rounded-b-xl">
            <div className="flex items-center justify-between">
              <span className="font-medium text-[var(--text)]">Total Pending</span>
              <span className="text-xl font-bold text-orange-600">
                ₦{mockActivities.reduce((sum, a) => sum + a.amount, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Payouts List */}
      {tab === "payouts" && (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl">
          <div className="p-4 border-b border-[var(--border)]">
            <h3 className="font-semibold text-[var(--text)]">Payout History</h3>
            <p className="text-sm text-[var(--muted)]">Your past payments and bonuses</p>
          </div>
          <div className="divide-y divide-[var(--border)]">
            {mockTransactions.map(txn => (
              <div key={txn.id} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    txn.type === "BONUS"
                      ? "bg-purple-100 dark:bg-purple-900/30"
                      : "bg-green-100 dark:bg-green-900/30"
                  }`}>
                    {txn.type === "BONUS" ? (
                      <TrendingUp size={18} className="text-purple-600" />
                    ) : (
                      <Wallet size={18} className="text-green-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text)]">{txn.description}</p>
                    <p className="text-sm text-[var(--muted)]">{new Date(txn.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${txn.type === "BONUS" ? "text-purple-600" : "text-green-600"}`}>
                    ₦{txn.amount.toLocaleString()}
                  </p>
                  <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded flex items-center gap-1">
                    <CheckCircle size={10} /> Paid
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bank Details */}
      <div className="mt-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[var(--text)]">Payment Account</h3>
            <p className="text-sm text-[var(--muted)]">First Bank • **** **** 4521</p>
          </div>
          <Button variant="secondary" size="sm">
            Update Account
          </Button>
        </div>
      </div>
    </div>
  );
}
