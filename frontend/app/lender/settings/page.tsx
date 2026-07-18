"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toggle } from "@/components/ui/toggle";
import { Modal } from "@/components/ui/modal";
import {
  Building2,
  Users,
  Bell,
  Shield,
  CreditCard,
  Link2,
  Settings2,
  Plus,
  Trash2,
  Edit2,
  Key,
  Loader2,
  CheckCircle,
  AlertCircle,
  Copy,
  Eye,
  EyeOff,
  LogOut,
  Monitor,
} from "lucide-react";
import {
  useOrganization,
  useUpdateOrganization,
  useTeamMembers,
  useInviteTeamMember,
  useUpdateTeamMember,
  useRemoveTeamMember,
  useNotificationSettings,
  useUpdateNotificationSettings,
  useDisbursementRules,
  useUpdateDisbursementRules,
  useApiKeys,
  useCreateApiKey,
  useRevokeApiKey,
  useSessions,
  useRevokeSession,
  useBillingInfo,
  useIntegrations,
} from "@/lib/hooks/use-settings";
import { ROLES, PLANS, TeamMember, NotificationSettings } from "@/lib/api/settings";

type Tab = "organization" | "team" | "notifications" | "disbursement" | "security" | "integrations" | "billing";

const TABS: Array<{ id: Tab; label: string; icon: React.ElementType }> = [
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "team", label: "Team & Roles", icon: Users },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "disbursement", label: "Disbursement Rules", icon: Settings2 },
  { id: "security", label: "Security", icon: Shield },
  { id: "integrations", label: "Integrations", icon: Link2 },
  { id: "billing", label: "Billing", icon: CreditCard },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("organization");
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--text)] mb-1">Settings</h1>
        <p className="text-[13px] text-[var(--muted)]">
          Manage your organization settings and preferences
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 border-b border-[var(--border)] overflow-x-auto">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSavedMsg(null);
              }}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold transition-colors cursor-pointer border-b-2 -mb-px whitespace-nowrap ${
                activeTab === tab.id
                  ? "text-[var(--primary)] border-[var(--primary)]"
                  : "text-[var(--muted)] border-transparent hover:text-[var(--text)]"
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {savedMsg && (
        <div className="mb-4 max-w-3xl rounded-lg bg-green-50 dark:bg-green-900/15 border border-green-200 dark:border-green-800 px-4 py-2.5 text-[13px] text-green-700 dark:text-green-300 flex items-center gap-2">
          <CheckCircle size={14} />
          {savedMsg}
        </div>
      )}

      <div className="max-w-3xl">
        {activeTab === "organization" && <OrganizationTab onSave={() => setSavedMsg("Organization updated successfully")} />}
        {activeTab === "team" && <TeamTab onSave={() => setSavedMsg("Team updated successfully")} />}
        {activeTab === "notifications" && <NotificationsTab onSave={() => setSavedMsg("Notification settings updated")} />}
        {activeTab === "disbursement" && <DisbursementTab onSave={() => setSavedMsg("Disbursement rules updated")} />}
        {activeTab === "security" && <SecurityTab onSave={() => setSavedMsg("Security settings updated")} />}
        {activeTab === "integrations" && <IntegrationsTab />}
        {activeTab === "billing" && <BillingTab />}
      </div>
    </div>
  );
}

function OrganizationTab({ onSave }: { onSave: () => void }) {
  const { data: org, isLoading } = useOrganization();
  const updateOrg = useUpdateOrganization();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    state: "",
    website: "",
  });

  useState(() => {
    if (org) {
      setForm({
        name: org.name || "",
        email: org.email || "",
        phone: org.phone || "",
        address: org.address || "",
        state: org.state || "",
        website: org.website || "",
      });
    }
  });

  const handleSave = async () => {
    await updateOrg.mutateAsync(form);
    onSave();
  };

  if (isLoading) {
    return (
      <Card className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--muted)]" />
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-sm font-bold text-[var(--text)] mb-4">Organization Profile</h3>
      <div className="space-y-4">
        <div>
          <label className="text-xs font-medium text-[var(--muted)] mb-1 block">Organization Name</label>
          <Input
            value={form.name || org?.name || ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[var(--muted)] mb-1 block">Email</label>
            <Input
              value={form.email || org?.email || ""}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted)] mb-1 block">Phone</label>
            <Input
              value={form.phone || org?.phone || ""}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-[var(--muted)] mb-1 block">Address</label>
          <Input
            value={form.address || org?.address || ""}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium text-[var(--muted)] mb-1 block">State</label>
            <Input
              value={form.state || org?.state || ""}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted)] mb-1 block">Website</label>
            <Input
              value={form.website || org?.website || ""}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
              placeholder="https://"
            />
          </div>
        </div>

        <div className="pt-2">
          <Button onClick={handleSave} disabled={updateOrg.isPending}>
            {updateOrg.isPending ? <Loader2 size={14} className="animate-spin" /> : null}
            Save Changes
          </Button>
        </div>
      </div>
    </Card>
  );
}

function TeamTab({ onSave }: { onSave: () => void }) {
  const { data: members, isLoading } = useTeamMembers();
  const inviteMember = useInviteTeamMember();
  const updateMember = useUpdateTeamMember();
  const removeMember = useRemoveTeamMember();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteForm, setInviteForm] = useState({ email: "", firstName: "", lastName: "", role: "LENDER_VIEWER" });
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const handleInvite = async () => {
    await inviteMember.mutateAsync(inviteForm);
    setShowInviteModal(false);
    setInviteForm({ email: "", firstName: "", lastName: "", role: "LENDER_VIEWER" });
    onSave();
  };

  const handleUpdateRole = async (memberId: string, role: string) => {
    await updateMember.mutateAsync({ memberId, data: { role } });
    onSave();
  };

  const handleRemove = async (memberId: string) => {
    if (confirm("Are you sure you want to remove this team member?")) {
      await removeMember.mutateAsync(memberId);
      onSave();
    }
  };

  return (
    <>
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[var(--text)]">Team Members</h3>
          <Button size="sm" onClick={() => setShowInviteModal(true)}>
            <Plus size={14} /> Invite Member
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-[var(--muted)]" />
          </div>
        ) : members?.length ? (
          <div className="space-y-3">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[var(--muted-bg)] flex items-center justify-center">
                    <Users size={16} className="text-[var(--muted)]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">
                      {m.firstName} {m.lastName}
                    </p>
                    <p className="text-xs text-[var(--muted)]">{m.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={m.role}
                    onChange={(e) => handleUpdateRole(m.id, e.target.value)}
                    className="h-8 px-2 text-xs rounded-lg border border-[var(--border)] bg-[var(--input-bg)]"
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleRemove(m.id)}
                    disabled={removeMember.isPending}
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-[var(--muted)] py-8">No team members yet</p>
        )}
      </Card>

      <Modal open={showInviteModal} onClose={() => setShowInviteModal(false)} title="Invite Team Member">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-[var(--muted)] mb-1 block">First Name</label>
              <Input
                value={inviteForm.firstName}
                onChange={(e) => setInviteForm({ ...inviteForm, firstName: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--muted)] mb-1 block">Last Name</label>
              <Input
                value={inviteForm.lastName}
                onChange={(e) => setInviteForm({ ...inviteForm, lastName: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted)] mb-1 block">Email</label>
            <Input
              type="email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted)] mb-1 block">Role</label>
            <select
              value={inviteForm.role}
              onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
              className="w-full h-9 px-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--input-bg)]"
            >
              {ROLES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label} - {r.description}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="secondary" className="flex-1" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleInvite}
              disabled={!inviteForm.email || !inviteForm.firstName || inviteMember.isPending}
            >
              {inviteMember.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
              Send Invite
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

function NotificationsTab({ onSave }: { onSave: () => void }) {
  const { data: settings, isLoading } = useNotificationSettings();
  const updateSettings = useUpdateNotificationSettings();

  const EVENTS: Array<{ key: keyof NotificationSettings; label: string }> = [
    { key: "newApplication", label: "New application received" },
    { key: "applicationApproved", label: "Application approved" },
    { key: "disbursementReleased", label: "Disbursement released" },
    { key: "repaymentReceived", label: "Repayment received" },
    { key: "paymentOverdue", label: "Payment overdue" },
    { key: "farmReportSubmitted", label: "Farm report submitted" },
    { key: "agentVerificationComplete", label: "Agent verification complete" },
  ];

  const handleToggle = async (event: string, channel: "email" | "sms" | "inApp", value: boolean) => {
    if (!settings) return;
    const eventKey = event as keyof NotificationSettings;
    const current = settings[eventKey];
    if (typeof current === "object" && "email" in current) {
      await updateSettings.mutateAsync({
        [eventKey]: { ...current, [channel]: value },
      });
      onSave();
    }
  };

  if (isLoading) {
    return (
      <Card className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--muted)]" />
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-sm font-bold text-[var(--text)] mb-4">Notification Preferences</h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="text-left py-2 text-xs font-medium text-[var(--muted)]">Event</th>
              <th className="text-center py-2 text-xs font-medium text-[var(--muted)] w-20">Email</th>
              <th className="text-center py-2 text-xs font-medium text-[var(--muted)] w-20">SMS</th>
              <th className="text-center py-2 text-xs font-medium text-[var(--muted)] w-20">In-App</th>
            </tr>
          </thead>
          <tbody>
            {EVENTS.map((event) => {
              const eventSettings = settings?.[event.key];
              const channels = typeof eventSettings === "object" && "email" in eventSettings ? eventSettings : null;

              return (
                <tr key={event.key} className="border-b border-[var(--border)]">
                  <td className="py-3 text-[var(--text)]">{event.label}</td>
                  <td className="py-3 text-center">
                    <Toggle
                      on={channels?.email ?? false}
                      onToggle={() => handleToggle(event.key, "email", !(channels?.email ?? false))}
                    />
                  </td>
                  <td className="py-3 text-center">
                    <Toggle
                      on={channels?.sms ?? false}
                      onToggle={() => handleToggle(event.key, "sms", !(channels?.sms ?? false))}
                    />
                  </td>
                  <td className="py-3 text-center">
                    <Toggle
                      on={channels?.inApp ?? false}
                      onToggle={() => handleToggle(event.key, "inApp", !(channels?.inApp ?? false))}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 pt-4 border-t border-[var(--border)]">
        <h4 className="text-xs font-bold text-[var(--text)] mb-3">Quiet Hours</h4>
        <div className="flex items-center gap-4">
          <Toggle on={settings?.quietHoursEnabled ?? true} onToggle={() => {}} />
          <span className="text-sm text-[var(--muted)]">
            No SMS notifications between {settings?.quietHoursStart || "22:00"} and {settings?.quietHoursEnd || "07:00"}
          </span>
        </div>
      </div>
    </Card>
  );
}

function DisbursementTab({ onSave }: { onSave: () => void }) {
  const { data: rules, isLoading } = useDisbursementRules();
  const updateRules = useUpdateDisbursementRules();

  const handleToggle = async (key: string, value: boolean) => {
    await updateRules.mutateAsync({ [key]: value });
    onSave();
  };

  const handleChange = async (key: string, value: any) => {
    await updateRules.mutateAsync({ [key]: value });
    onSave();
  };

  if (isLoading) {
    return (
      <Card className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--muted)]" />
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-sm font-bold text-[var(--text)] mb-4">Disbursement Rules</h3>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
          <div>
            <p className="text-sm text-[var(--text)]">Require layered disbursement</p>
            <p className="text-xs text-[var(--muted)]">Split loans into multiple tranches</p>
          </div>
          <Toggle
            on={rules?.requireLayeredDisbursement ?? true}
            onToggle={() => handleToggle("requireLayeredDisbursement", !(rules?.requireLayeredDisbursement ?? true))}
          />
        </div>

        <div className="flex items-center justify-between py-3 border-b border-[var(--border)]">
          <div>
            <p className="text-sm text-[var(--text)]">Require agent verification before Layer 2</p>
            <p className="text-xs text-[var(--muted)]">Field agent must verify before releasing next tranche</p>
          </div>
          <Toggle
            on={rules?.requireAgentVerification ?? true}
            onToggle={() => handleToggle("requireAgentVerification", !(rules?.requireAgentVerification ?? true))}
          />
        </div>

        <div className="py-3 border-b border-[var(--border)]">
          <label className="text-sm text-[var(--text)] block mb-2">Auto-approve borrowers with FarmScore above</label>
          <Input
            type="number"
            value={rules?.autoApproveAboveScore ?? 750}
            onChange={(e) => handleChange("autoApproveAboveScore", parseInt(e.target.value) || null)}
            className="w-32"
          />
          <p className="text-xs text-[var(--muted)] mt-1">Set to 0 to disable auto-approval</p>
        </div>

        <div className="py-3 border-b border-[var(--border)]">
          <label className="text-sm text-[var(--text)] block mb-2">Maximum days to process disbursement</label>
          <Input
            type="number"
            value={rules?.maxProcessingDays ?? 5}
            onChange={(e) => handleChange("maxProcessingDays", parseInt(e.target.value) || 5)}
            className="w-32"
          />
        </div>

        <div className="py-3">
          <label className="text-sm text-[var(--text)] block mb-2">Default farm report interval</label>
          <select
            value={rules?.defaultReportInterval ?? "MONTHLY"}
            onChange={(e) => handleChange("defaultReportInterval", e.target.value)}
            className="h-9 px-2 text-sm rounded-lg border border-[var(--border)] bg-[var(--input-bg)]"
          >
            <option value="WEEKLY">Weekly</option>
            <option value="BIWEEKLY">Bi-weekly</option>
            <option value="MONTHLY">Monthly</option>
          </select>
        </div>
      </div>
    </Card>
  );
}

function SecurityTab({ onSave }: { onSave: () => void }) {
  const { data: sessions } = useSessions();
  const { data: apiKeys } = useApiKeys();
  const createApiKey = useCreateApiKey();
  const revokeApiKey = useRevokeApiKey();
  const revokeSession = useRevokeSession();

  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKey, setNewKey] = useState<string | null>(null);
  const [showKey, setShowKey] = useState(false);

  const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

  const handleCreateKey = async () => {
    const result = await createApiKey.mutateAsync({ name: newKeyName });
    setNewKey(result.key || null);
    setNewKeyName("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-sm font-bold text-[var(--text)] mb-4">Two-Factor Authentication</h3>
        <p className="text-xs text-[var(--muted)] mb-3">Add an extra layer of security to your account</p>
        <Button variant="secondary" size="sm">
          <Shield size={14} /> Enable 2FA
        </Button>
      </Card>

      <Card>
        <h3 className="text-sm font-bold text-[var(--text)] mb-4">Change Password</h3>
        <div className="space-y-3 max-w-sm">
          <Input
            type="password"
            placeholder="Current password"
            value={passwords.current}
            onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
          />
          <Input
            type="password"
            placeholder="New password"
            value={passwords.new}
            onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
          />
          <Input
            type="password"
            placeholder="Confirm new password"
            value={passwords.confirm}
            onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
          />
          <Button size="sm" disabled={!passwords.current || !passwords.new || passwords.new !== passwords.confirm}>
            Update Password
          </Button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[var(--text)]">API Keys</h3>
          <Button size="sm" onClick={() => setShowNewKeyModal(true)}>
            <Key size={14} /> Create Key
          </Button>
        </div>

        {apiKeys?.length ? (
          <div className="space-y-2">
            {apiKeys.map((key) => (
              <div key={key.id} className="flex items-center justify-between py-2 border-b border-[var(--border)]">
                <div>
                  <p className="text-sm text-[var(--text)]">{key.name || "API Key"}</p>
                  <p className="text-xs text-[var(--muted)]">Created {new Date(key.createdAt).toLocaleDateString()}</p>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => revokeApiKey.mutate(key.id)}
                  disabled={revokeApiKey.isPending}
                >
                  <Trash2 size={12} /> Revoke
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">No API keys created</p>
        )}
      </Card>

      <Card>
        <h3 className="text-sm font-bold text-[var(--text)] mb-4">Active Sessions</h3>
        {sessions?.length ? (
          <div className="space-y-2">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between py-2 border-b border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <Monitor size={16} className="text-[var(--muted)]" />
                  <div>
                    <p className="text-sm text-[var(--text)]">
                      {session.device}
                      {session.isCurrent && (
                        <span className="ml-2 px-1.5 py-0.5 bg-green-100 text-green-700 text-[10px] rounded">Current</span>
                      )}
                    </p>
                    <p className="text-xs text-[var(--muted)]">{session.location}</p>
                  </div>
                </div>
                {!session.isCurrent && (
                  <Button variant="secondary" size="sm" onClick={() => revokeSession.mutate(session.id)}>
                    <LogOut size={12} /> Revoke
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">No active sessions</p>
        )}
      </Card>

      <Modal open={showNewKeyModal} onClose={() => { setShowNewKeyModal(false); setNewKey(null); }} title="Create API Key">
        {newKey ? (
          <div className="space-y-4">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-xs text-amber-700 mb-2">
                Copy this key now. You won't be able to see it again.
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-white p-2 rounded border break-all">
                  {showKey ? newKey : "sk_live_••••••••••••••••••••••••"}
                </code>
                <Button variant="secondary" size="sm" onClick={() => setShowKey(!showKey)}>
                  {showKey ? <EyeOff size={12} /> : <Eye size={12} />}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => copyToClipboard(newKey)}>
                  <Copy size={12} />
                </Button>
              </div>
            </div>
            <Button className="w-full" onClick={() => { setShowNewKeyModal(false); setNewKey(null); }}>
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[var(--muted)] mb-1 block">Key Name</label>
              <Input
                placeholder="e.g., Production API"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setShowNewKeyModal(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleCreateKey} disabled={!newKeyName || createApiKey.isPending}>
                {createApiKey.isPending ? <Loader2 size={14} className="animate-spin" /> : <Key size={14} />}
                Create
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function IntegrationsTab() {
  const { data: integrations, isLoading } = useIntegrations();

  const INTEGRATION_LIST = [
    { key: "paystack", name: "Paystack", description: "Payment processing for disbursements" },
    { key: "whatsapp", name: "WhatsApp Business", description: "Send messages via WhatsApp" },
    { key: "termii", name: "Termii SMS", description: "SMS notifications and alerts" },
    { key: "googleMaps", name: "Google Maps", description: "Location services" },
    { key: "nibssBvn", name: "NIBSS BVN", description: "BVN verification" },
    { key: "nimcNin", name: "NIMC NIN", description: "NIN verification" },
    { key: "farmScoreApi", name: "FarmScore API", description: "Expose FarmScore to external systems" },
  ];

  if (isLoading) {
    return (
      <Card className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--muted)]" />
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-sm font-bold text-[var(--text)] mb-4">Integrations</h3>
      <div className="space-y-3">
        {INTEGRATION_LIST.map((int) => {
          const status = integrations?.[int.key as keyof typeof integrations];
          const connected = status && "connected" in status ? status.connected : false;
          const managedByPlatform = status && "managedByPlatform" in status ? status.managedByPlatform : false;

          return (
            <div key={int.key} className="flex items-center justify-between py-3 border-b border-[var(--border)] last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[var(--muted-bg)] flex items-center justify-center">
                  <Link2 size={16} className="text-[var(--muted)]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[var(--text)]">{int.name}</p>
                  <p className="text-xs text-[var(--muted)]">{int.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {connected ? (
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle size={12} /> Connected
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
                    <AlertCircle size={12} /> Not connected
                  </span>
                )}
                {!managedByPlatform && (
                  <Button variant="secondary" size="sm">
                    Configure
                  </Button>
                )}
                {managedByPlatform && (
                  <span className="text-[10px] text-[var(--muted)]">Managed by AgroTrack</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

function BillingTab() {
  const { data: billing, isLoading } = useBillingInfo();

  if (isLoading) {
    return (
      <Card className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--muted)]" />
      </Card>
    );
  }

  const currentPlan = PLANS.find((p) => p.value === billing?.currentPlan) || PLANS[0];

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-[var(--primary)] to-green-600 text-white border-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-semibold text-white/70 uppercase">Current Plan</p>
            <p className="text-2xl font-extrabold mt-1">{currentPlan.label}</p>
          </div>
          <CreditCard size={32} className="text-white/50" />
        </div>
        <p className="text-xs text-white/70">
          Next billing date: {billing?.nextBillingDate ? new Date(billing.nextBillingDate).toLocaleDateString() : "N/A"}
        </p>
      </Card>

      <Card>
        <h3 className="text-sm font-bold text-[var(--text)] mb-4">Usage</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-bold text-[var(--text)]">{billing?.usage.borrowers || 0}</p>
            <p className="text-xs text-[var(--muted)]">
              Borrowers {billing?.limits.borrowers !== -1 ? `/ ${billing?.limits.borrowers}` : "(unlimited)"}
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--text)]">{billing?.usage.programs || 0}</p>
            <p className="text-xs text-[var(--muted)]">
              Programs {billing?.limits.programs !== -1 ? `/ ${billing?.limits.programs}` : "(unlimited)"}
            </p>
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--text)]">{billing?.usage.teamMembers || 0}</p>
            <p className="text-xs text-[var(--muted)]">
              Team {billing?.limits.teamMembers !== -1 ? `/ ${billing?.limits.teamMembers}` : "(unlimited)"}
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <h3 className="text-sm font-bold text-[var(--text)] mb-4">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((plan) => (
            <div
              key={plan.value}
              className={`p-4 rounded-lg border ${
                plan.value === billing?.currentPlan
                  ? "border-[var(--primary)] bg-[var(--primary)]/5"
                  : "border-[var(--border)]"
              }`}
            >
              <h4 className="font-bold text-[var(--text)]">{plan.label}</h4>
              <p className="text-lg font-bold text-[var(--primary)] my-2">{plan.price}</p>
              <ul className="space-y-1">
                {plan.features.map((f) => (
                  <li key={f} className="text-xs text-[var(--muted)] flex items-center gap-1">
                    <CheckCircle size={10} className="text-green-500" /> {f}
                  </li>
                ))}
              </ul>
              {plan.value !== billing?.currentPlan && (
                <Button variant="secondary" size="sm" className="w-full mt-3">
                  {PLANS.indexOf(plan) > PLANS.findIndex((p) => p.value === billing?.currentPlan) ? "Upgrade" : "Downgrade"}
                </Button>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
