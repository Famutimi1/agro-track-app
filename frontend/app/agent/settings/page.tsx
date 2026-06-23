"use client";

import { useState } from "react";
import {
  User, Phone, MapPin, Bell, Shield, Smartphone,
  Moon, Sun, Download, ChevronRight, LogOut, Key
} from "lucide-react";
import { Button } from "@/components/ui/button";

const mockAgent = {
  name: "Abubakar Ahmed",
  email: "abubakar.ahmed@agrotrack.ng",
  phone: "+234 803 123 4567",
  state: "Kebbi",
  lgas: ["Argungu", "Birnin Kebbi", "Kalgo", "Gwandu"],
  joinedAt: "2024-08-15",
  totalFarmers: 147,
  bankAccount: "First Bank • **** 4521",
};

export default function AgentSettingsPage() {
  const [notifications, setNotifications] = useState({
    newVisits: true,
    reminders: true,
    payouts: true,
    announcements: false,
  });
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--text)]">Settings</h1>
        <p className="text-sm text-[var(--muted)]">Manage your account and preferences</p>
      </div>

      {/* Profile Section */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 mb-6">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
          <User size={20} className="text-orange-600" /> Profile
        </h2>

        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-orange-600 flex items-center justify-center text-white text-xl font-bold">
            AA
          </div>
          <div>
            <h3 className="font-semibold text-[var(--text)]">{mockAgent.name}</h3>
            <p className="text-sm text-[var(--muted)]">{mockAgent.email}</p>
            <p className="text-xs text-[var(--muted)]">Field Agent since {new Date(mockAgent.joinedAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Full Name</label>
            <input
              type="text"
              defaultValue={mockAgent.name}
              className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Phone Number</label>
            <input
              type="tel"
              defaultValue={mockAgent.phone}
              className="w-full px-4 py-2.5 bg-[var(--background)] border border-[var(--border)] rounded-lg"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-sm font-medium text-[var(--text)] mb-1.5">Assigned LGAs</label>
          <div className="flex flex-wrap gap-2">
            {mockAgent.lgas.map(lga => (
              <span
                key={lga}
                className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full text-sm"
              >
                {lga}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button variant="primary" className="bg-orange-600 hover:bg-orange-700">
            Save Changes
          </Button>
        </div>
      </div>

      {/* Payment Account */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 mb-6">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-4">Payment Account</h2>
        <div className="flex items-center justify-between p-4 bg-[var(--background)] rounded-lg">
          <div>
            <p className="font-medium text-[var(--text)]">{mockAgent.bankAccount}</p>
            <p className="text-sm text-[var(--muted)]">Your earnings are paid to this account</p>
          </div>
          <Button variant="secondary" size="sm">
            Update
          </Button>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 mb-6">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
          <Bell size={20} className="text-orange-600" /> Notifications
        </h2>

        <div className="space-y-4">
          {[
            { key: "newVisits", label: "New visit assignments", desc: "Get notified when new visits are assigned" },
            { key: "reminders", label: "Visit reminders", desc: "Reminders for upcoming scheduled visits" },
            { key: "payouts", label: "Payout notifications", desc: "Get notified when payments are processed" },
            { key: "announcements", label: "Announcements", desc: "Updates and news from AgroTrack" },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between">
              <div>
                <p className="font-medium text-[var(--text)]">{item.label}</p>
                <p className="text-sm text-[var(--muted)]">{item.desc}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications[item.key as keyof typeof notifications]}
                  onChange={e =>
                    setNotifications({ ...notifications, [item.key]: e.target.checked })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* App Settings */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 mb-6">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
          <Smartphone size={20} className="text-orange-600" /> App Settings
        </h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-[var(--text)]">Dark Mode</p>
              <p className="text-sm text-[var(--muted)]">Switch between light and dark themes</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={e => setDarkMode(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-[var(--background)] rounded-lg">
            <div className="flex items-center gap-3">
              <Download size={18} className="text-[var(--muted)]" />
              <div>
                <p className="font-medium text-[var(--text)]">Offline Data</p>
                <p className="text-sm text-[var(--muted)]">12.5 MB cached locally</p>
              </div>
            </div>
            <Button variant="secondary" size="sm">
              Clear Cache
            </Button>
          </div>
        </div>
      </div>

      {/* Security */}
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl p-5 mb-6">
        <h2 className="text-lg font-semibold text-[var(--text)] mb-4 flex items-center gap-2">
          <Shield size={20} className="text-orange-600" /> Security
        </h2>

        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-4 bg-[var(--background)] rounded-lg hover:bg-[var(--surface)] transition-colors">
            <div className="flex items-center gap-3">
              <Key size={18} className="text-[var(--muted)]" />
              <span className="font-medium text-[var(--text)]">Change Password</span>
            </div>
            <ChevronRight size={18} className="text-[var(--muted)]" />
          </button>
          <button className="w-full flex items-center justify-between p-4 bg-[var(--background)] rounded-lg hover:bg-[var(--surface)] transition-colors">
            <div className="flex items-center gap-3">
              <Smartphone size={18} className="text-[var(--muted)]" />
              <span className="font-medium text-[var(--text)]">Two-Factor Authentication</span>
            </div>
            <span className="text-xs text-green-600 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded">Enabled</span>
          </button>
        </div>
      </div>

      {/* Logout */}
      <Button variant="secondary" className="w-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
        <LogOut size={16} className="mr-2" /> Log Out
      </Button>
    </div>
  );
}
