"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Plus, Search, MoreVertical, Mail, Shield,
  UserPlus, Trash2, Edit2, Check, X
} from "lucide-react";
import { Button } from "@/components/ui/button";

const roles = [
  { id: "LENDER_ADMIN", name: "Admin", desc: "Full access to all features", color: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  { id: "LENDER_MANAGER", name: "Manager", desc: "Can manage loans and applications", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  { id: "LENDER_ANALYST", name: "Analyst", desc: "Can view reports and analytics", color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  { id: "LENDER_VIEWER", name: "Viewer", desc: "Read-only access", color: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400" },
];

const mockTeam = [
  { id: "U001", name: "Adamu Ibrahim", email: "admin@fmard.gov.ng", role: "LENDER_ADMIN", status: "ACTIVE", lastActive: "2025-06-23T10:30:00", avatar: "AI" },
  { id: "U002", name: "Fatima Bello", email: "finance@fmard.gov.ng", role: "LENDER_MANAGER", status: "ACTIVE", lastActive: "2025-06-23T09:15:00", avatar: "FB" },
  { id: "U003", name: "Yusuf Garba", email: "field@fmard.gov.ng", role: "LENDER_ANALYST", status: "ACTIVE", lastActive: "2025-06-22T16:45:00", avatar: "YG" },
  { id: "U004", name: "Amina Danjuma", email: "reports@fmard.gov.ng", role: "LENDER_VIEWER", status: "ACTIVE", lastActive: "2025-06-21T14:20:00", avatar: "AD" },
  { id: "U005", name: "Hassan Musa", email: "pending@fmard.gov.ng", role: "LENDER_VIEWER", status: "PENDING", lastActive: null, avatar: "HM" },
];

export default function TeamSettingsPage() {
  const [search, setSearch] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("LENDER_VIEWER");

  const filteredTeam = mockTeam.filter(member =>
    member.name.toLowerCase().includes(search.toLowerCase()) ||
    member.email.toLowerCase().includes(search.toLowerCase())
  );

  const getRoleInfo = (roleId: string) => roles.find(r => r.id === roleId);

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/lender-settings" className="p-2 hover:bg-[var(--surface)] rounded-lg">
          <ArrowLeft size={20} className="text-[var(--muted)]" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[var(--text)]">Team Management</h1>
          <p className="text-sm text-[var(--muted)]">Manage team members and their access levels</p>
        </div>
        <Button variant="primary" onClick={() => setShowInviteModal(true)}>
          <UserPlus size={16} className="mr-2" /> Invite Member
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Members", value: mockTeam.length },
          { label: "Admins", value: mockTeam.filter(m => m.role === "LENDER_ADMIN").length },
          { label: "Active Today", value: mockTeam.filter(m => m.lastActive?.includes("2025-06-23")).length },
          { label: "Pending Invites", value: mockTeam.filter(m => m.status === "PENDING").length },
        ].map(stat => (
          <div key={stat.label} className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4">
            <p className="text-sm text-[var(--muted)]">{stat.label}</p>
            <p className="text-2xl font-bold text-[var(--text)]">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" />
        <input
          type="text"
          placeholder="Search team members..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm"
        />
      </div>

      {/* Team List */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl">
        <div className="p-4 border-b border-[var(--border)]">
          <h3 className="font-semibold text-[var(--text)]">Team Members ({filteredTeam.length})</h3>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {filteredTeam.map(member => {
            const role = getRoleInfo(member.role);
            return (
              <div key={member.id} className="p-4 flex items-center justify-between hover:bg-[var(--background)] transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-brand-green/20 flex items-center justify-center text-brand-green font-semibold text-sm">
                    {member.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-[var(--text)]">{member.name}</p>
                      {member.status === "PENDING" && (
                        <span className="text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 px-2 py-0.5 rounded">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-[var(--muted)]">{member.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded ${role?.color}`}>
                    {role?.name}
                  </span>
                  {member.lastActive && (
                    <span className="text-xs text-[var(--muted)]">
                      Active {new Date(member.lastActive).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  <button className="p-2 hover:bg-[var(--surface)] rounded-lg">
                    <MoreVertical size={16} className="text-[var(--muted)]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Roles Reference */}
      <div className="mt-6 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
        <h3 className="font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
          <Shield size={18} /> Role Permissions
        </h3>
        <div className="grid grid-cols-4 gap-4">
          {roles.map(role => (
            <div key={role.id} className="p-3 bg-[var(--background)] rounded-lg">
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${role.color}`}>
                {role.name}
              </span>
              <p className="text-sm text-[var(--muted)] mt-2">{role.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--surface)] rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Invite Team Member</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                  placeholder="colleague@fmard.gov.ng"
                  className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Role</label>
                <select
                  value={inviteRole}
                  onChange={e => setInviteRole(e.target.value)}
                  className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg"
                >
                  {roles.map(role => (
                    <option key={role.id} value={role.id}>{role.name} - {role.desc}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setShowInviteModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" className="flex-1">
                <Mail size={16} className="mr-2" /> Send Invite
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
