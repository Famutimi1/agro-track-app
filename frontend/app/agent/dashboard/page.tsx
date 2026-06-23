"use client";

import Link from "next/link";
import {
  Users, MapPin, DollarSign, Clock, CheckCircle,
  AlertTriangle, ChevronRight, Plus, Navigation,
  Calendar, TrendingUp
} from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { label: "Farmers Registered", value: "147", change: "+12 this month", icon: Users, color: "text-green-600", bg: "bg-green-100 dark:bg-green-900/30" },
  { label: "Visits Completed", value: "89", change: "+8 this week", icon: MapPin, color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30" },
  { label: "Pending Visits", value: "5", change: "3 due today", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100 dark:bg-yellow-900/30" },
  { label: "Earnings (June)", value: "₦47,500", change: "₦2,500 pending", icon: DollarSign, color: "text-purple-600", bg: "bg-purple-100 dark:bg-purple-900/30" },
];

const todayVisits = [
  { id: "V001", farmer: "Musa Garba", location: "Argungu, Kebbi", type: "Verification", time: "9:00 AM", status: "COMPLETED", distance: "2.3 km" },
  { id: "V002", farmer: "Amina Bello", location: "Birnin Kebbi", type: "Farm Mapping", time: "11:30 AM", status: "IN_PROGRESS", distance: "5.1 km" },
  { id: "V003", farmer: "Ibrahim Sule", location: "Kalgo, Kebbi", type: "Monitoring", time: "2:00 PM", status: "PENDING", distance: "8.7 km" },
  { id: "V004", farmer: "Fatima Yusuf", location: "Gwandu, Kebbi", type: "Verification", time: "4:00 PM", status: "PENDING", distance: "12.4 km" },
];

const recentRegistrations = [
  { name: "Aisha Mohammed", farmerId: "FRM-2025-148", date: "Today, 8:30 AM", status: "SYNCED" },
  { name: "Bello Abdullahi", farmerId: "FRM-2025-147", date: "Yesterday", status: "SYNCED" },
  { name: "Chioma Eze", farmerId: "FRM-2025-146", date: "2 days ago", status: "SYNCED" },
];

export default function AgentDashboardPage() {
  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text)]">Good morning, Abubakar</h1>
          <p className="text-sm text-[var(--muted)]">Monday, June 23, 2025 • Kebbi State</p>
        </div>
        <div className="flex gap-3">
          <Link href="/agent/farmers/register">
            <Button variant="primary">
              <Plus size={16} className="mr-2" /> Register Farmer
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {stats.map(stat => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[var(--muted)] mb-1">{stat.label}</p>
                  <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-[var(--muted)] mt-1">{stat.change}</p>
                </div>
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <Icon size={20} className={stat.color} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Today's Visits */}
        <div className="col-span-2 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--text)]">Today&apos;s Schedule</h2>
            <Link href="/agent/visits" className="text-sm text-orange-600 hover:underline flex items-center gap-1">
              View all <ChevronRight size={14} />
            </Link>
          </div>

          <div className="space-y-3">
            {todayVisits.map(visit => (
              <div
                key={visit.id}
                className={`p-4 rounded-lg border ${
                  visit.status === "IN_PROGRESS"
                    ? "border-orange-300 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800"
                    : "border-[var(--border)] bg-[var(--background)]"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      visit.status === "COMPLETED"
                        ? "bg-green-100 dark:bg-green-900/30"
                        : visit.status === "IN_PROGRESS"
                        ? "bg-orange-100 dark:bg-orange-900/30"
                        : "bg-gray-100 dark:bg-gray-800"
                    }`}>
                      {visit.status === "COMPLETED" ? (
                        <CheckCircle size={20} className="text-green-600" />
                      ) : visit.status === "IN_PROGRESS" ? (
                        <Navigation size={20} className="text-orange-600" />
                      ) : (
                        <Clock size={20} className="text-gray-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-[var(--text)]">{visit.farmer}</p>
                      <div className="flex items-center gap-3 text-xs text-[var(--muted)]">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} /> {visit.location}
                        </span>
                        <span>{visit.distance}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      visit.type === "Verification"
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        : visit.type === "Farm Mapping"
                        ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                        : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    }`}>
                      {visit.type}
                    </span>
                    <p className="text-sm text-[var(--muted)] mt-1">{visit.time}</p>
                  </div>
                </div>

                {visit.status === "IN_PROGRESS" && (
                  <div className="mt-3 flex gap-2">
                    <Button variant="primary" size="sm" className="bg-orange-600 hover:bg-orange-700">
                      <Navigation size={14} className="mr-1" /> Navigate
                    </Button>
                    <Button variant="secondary" size="sm">
                      Complete Visit
                    </Button>
                  </div>
                )}

                {visit.status === "PENDING" && (
                  <div className="mt-3">
                    <Button variant="secondary" size="sm">
                      Start Visit
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <Link
                href="/agent/farmers/register"
                className="flex items-center gap-3 p-3 rounded-lg bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-orange-600 flex items-center justify-center">
                  <Plus size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-medium text-[var(--text)]">Register New Farmer</p>
                  <p className="text-xs text-[var(--muted)]">Add a new farmer to the system</p>
                </div>
              </Link>
              <Link
                href="/agent/visits"
                className="flex items-center gap-3 p-3 rounded-lg bg-[var(--background)] hover:bg-[var(--surface)] transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <MapPin size={18} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-[var(--text)]">View All Visits</p>
                  <p className="text-xs text-[var(--muted)]">Manage scheduled visits</p>
                </div>
              </Link>
              <Link
                href="/agent/earnings"
                className="flex items-center gap-3 p-3 rounded-lg bg-[var(--background)] hover:bg-[var(--surface)] transition-colors"
              >
                <div className="w-9 h-9 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <DollarSign size={18} className="text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-[var(--text)]">View Earnings</p>
                  <p className="text-xs text-[var(--muted)]">Track your payments</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Registrations */}
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
            <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Recent Registrations</h2>
            <div className="space-y-3">
              {recentRegistrations.map(reg => (
                <div key={reg.farmerId} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-[var(--text)]">{reg.name}</p>
                    <p className="text-xs text-[var(--muted)]">{reg.farmerId}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded">
                      {reg.status}
                    </span>
                    <p className="text-xs text-[var(--muted)] mt-1">{reg.date}</p>
                  </div>
                </div>
              ))}
            </div>
            <Link href="/agent/farmers" className="block mt-4 text-sm text-orange-600 hover:underline text-center">
              View all farmers →
            </Link>
          </div>

          {/* Performance */}
          <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl p-5 text-white">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={20} />
              <h3 className="font-semibold">Monthly Performance</h3>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-orange-200">Target</span>
                <span className="font-semibold">30 farmers</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-orange-200">Achieved</span>
                <span className="font-semibold">12 farmers</span>
              </div>
              <div className="mt-2">
                <div className="h-2 bg-orange-800 rounded-full">
                  <div className="h-full bg-white rounded-full" style={{ width: "40%" }} />
                </div>
                <p className="text-xs text-orange-200 mt-1">40% of monthly target</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
