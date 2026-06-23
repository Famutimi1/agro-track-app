"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Key, Copy, Eye, EyeOff, Plus, Trash2,
  Check, AlertTriangle, RefreshCw, Code, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";

const mockApiKeys = [
  {
    id: "key_live_001",
    name: "Production API Key",
    prefix: "sk_live_****",
    lastUsed: "2025-06-23T14:30:00",
    createdAt: "2025-01-15",
    permissions: ["read:loans", "write:applications", "read:borrowers"],
    status: "ACTIVE",
  },
  {
    id: "key_test_001",
    name: "Test API Key",
    prefix: "sk_test_****",
    lastUsed: "2025-06-22T10:15:00",
    createdAt: "2025-02-20",
    permissions: ["read:loans", "read:borrowers"],
    status: "ACTIVE",
  },
  {
    id: "key_webhook_001",
    name: "Webhook Signing Key",
    prefix: "whsec_****",
    lastUsed: "2025-06-23T14:45:00",
    createdAt: "2025-03-10",
    permissions: ["webhooks"],
    status: "ACTIVE",
  },
];

const mockWebhooks = [
  { id: "wh_001", url: "https://api.fmard.gov.ng/webhooks/agrotrack", events: ["loan.disbursed", "repayment.received"], status: "ACTIVE", lastDelivery: "2025-06-23T14:45:00" },
  { id: "wh_002", url: "https://erp.fmard.gov.ng/integrations/agrotrack", events: ["application.approved", "loan.disbursed"], status: "ACTIVE", lastDelivery: "2025-06-23T12:30:00" },
];

const availablePermissions = [
  { id: "read:loans", label: "Read Loans", desc: "View loan data" },
  { id: "write:loans", label: "Write Loans", desc: "Create and update loans" },
  { id: "read:borrowers", label: "Read Borrowers", desc: "View borrower profiles" },
  { id: "write:borrowers", label: "Write Borrowers", desc: "Create and update borrowers" },
  { id: "read:applications", label: "Read Applications", desc: "View applications" },
  { id: "write:applications", label: "Write Applications", desc: "Process applications" },
  { id: "webhooks", label: "Webhooks", desc: "Receive webhook events" },
];

export default function ApiSettingsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyPermissions, setNewKeyPermissions] = useState<string[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, keyId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/lender-settings" className="p-2 hover:bg-[var(--surface)] rounded-lg">
          <ArrowLeft size={20} className="text-[var(--muted)]" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[var(--text)]">API Settings</h1>
          <p className="text-sm text-[var(--muted)]">Manage API keys and webhooks for integrations</p>
        </div>
        <a
          href="#"
          className="flex items-center gap-2 text-sm text-brand-green hover:underline"
        >
          <Code size={16} /> API Documentation <ExternalLink size={12} />
        </a>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertTriangle size={18} className="text-yellow-600 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-yellow-700 dark:text-yellow-400">Keep your API keys secure</p>
            <p className="text-yellow-600 dark:text-yellow-400">
              Never share your API keys in publicly accessible areas such as GitHub or client-side code.
            </p>
          </div>
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl mb-6">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[var(--text)]">API Keys</h3>
            <p className="text-sm text-[var(--muted)]">Keys for authenticating API requests</p>
          </div>
          <Button variant="primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} className="mr-2" /> Create Key
          </Button>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {mockApiKeys.map(key => (
            <div key={key.id} className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <Key size={18} className="text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-[var(--text)]">{key.name}</p>
                    <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
                      <code className="bg-[var(--background)] px-2 py-0.5 rounded font-mono text-xs">
                        {key.prefix}
                      </code>
                      <button
                        onClick={() => copyToClipboard(key.prefix, key.id)}
                        className="p-1 hover:bg-[var(--background)] rounded"
                      >
                        {copiedKey === key.id ? (
                          <Check size={14} className="text-green-600" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-[var(--muted)]">
                    Last used {new Date(key.lastUsed).toLocaleDateString()}
                  </span>
                  <Button variant="secondary" size="sm">
                    <RefreshCw size={14} className="mr-1" /> Rotate
                  </Button>
                  <button className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {key.permissions.map(perm => (
                  <span
                    key={perm}
                    className="text-xs bg-[var(--background)] text-[var(--muted)] px-2 py-0.5 rounded"
                  >
                    {perm}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Webhooks */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl mb-6">
        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-[var(--text)]">Webhooks</h3>
            <p className="text-sm text-[var(--muted)]">Receive real-time event notifications</p>
          </div>
          <Button variant="secondary">
            <Plus size={16} className="mr-2" /> Add Endpoint
          </Button>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {mockWebhooks.map(webhook => (
            <div key={webhook.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <code className="text-sm bg-[var(--background)] px-2 py-1 rounded font-mono">
                    {webhook.url}
                  </code>
                </div>
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <Check size={12} /> Active
                  </span>
                  <button className="p-2 hover:bg-[var(--background)] rounded-lg">
                    <Trash2 size={16} className="text-[var(--muted)]" />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {webhook.events.map(event => (
                  <span
                    key={event}
                    className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded"
                  >
                    {event}
                  </span>
                ))}
              </div>
              <p className="text-xs text-[var(--muted)] mt-2">
                Last delivery: {new Date(webhook.lastDelivery).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Start */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5">
        <h3 className="font-semibold text-[var(--text)] mb-4">Quick Start</h3>
        <div className="bg-gray-900 rounded-lg p-4 text-sm font-mono text-gray-300 overflow-x-auto">
          <pre>{`curl -X GET "https://api.agrotrack.ng/v1/loans" \\
  -H "Authorization: Bearer sk_live_YOUR_API_KEY" \\
  -H "Content-Type: application/json"`}</pre>
        </div>
        <p className="text-sm text-[var(--muted)] mt-3">
          Use this template to make your first API request. Replace <code className="bg-[var(--background)] px-1 rounded">sk_live_YOUR_API_KEY</code> with your actual API key.
        </p>
      </div>

      {/* Create Key Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--surface)] rounded-xl p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold text-[var(--text)] mb-4">Create API Key</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Key Name</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={e => setNewKeyName(e.target.value)}
                  placeholder="e.g., Production API Key"
                  className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  {availablePermissions.map(perm => (
                    <label
                      key={perm.id}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${
                        newKeyPermissions.includes(perm.id)
                          ? "border-brand-green bg-green-50 dark:bg-green-900/20"
                          : "border-[var(--border)] hover:border-[var(--muted)]"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={newKeyPermissions.includes(perm.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setNewKeyPermissions([...newKeyPermissions, perm.id]);
                          } else {
                            setNewKeyPermissions(newKeyPermissions.filter(p => p !== perm.id));
                          }
                        }}
                        className="sr-only"
                      />
                      <div>
                        <p className="text-sm font-medium text-[var(--text)]">{perm.label}</p>
                        <p className="text-xs text-[var(--muted)]">{perm.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="secondary" className="flex-1" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" className="flex-1" disabled={!newKeyName}>
                <Key size={16} className="mr-2" /> Create Key
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
