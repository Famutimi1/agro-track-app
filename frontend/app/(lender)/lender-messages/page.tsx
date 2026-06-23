"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send, Search } from "lucide-react";

const conversations = [
  { id: 1, name: "Bello Musa", lastMsg: "Thank you for the update on my layer 3 disbursement.", time: "2m ago", unread: 0 },
  { id: 2, name: "Adaeze Okonkwo", lastMsg: "When will my next disbursement be processed?", time: "15m ago", unread: 2 },
  { id: 3, name: "Grace Adeleke", lastMsg: "I submitted my farm report yesterday.", time: "1h ago", unread: 0 },
  { id: 4, name: "Emeka Chukwu", lastMsg: "I need an extension on my repayment date.", time: "3h ago", unread: 1 },
  { id: 5, name: "Hajiya Fatima", lastMsg: "My loan is fully repaid. Thank you!", time: "5h ago", unread: 0 },
];

const messages = [
  { from: "borrower", text: "When will my next disbursement be processed?", time: "2:30 PM" },
  { from: "lender", text: "We're reviewing your Layer 2 application. You should receive it within 3-5 business days once approved.", time: "2:45 PM" },
  { from: "borrower", text: "Thank you. I've already planted the seedlings for this season.", time: "3:00 PM" },
  { from: "lender", text: "Great! Please submit your farm report with photos by Friday so we can process the disbursement.", time: "3:10 PM" },
];

export default function MessagesPage() {
  const [activeConvo, setActiveConvo] = useState(conversations[1]);
  const [newMsg, setNewMsg] = useState("");

  return (
    <div className="flex gap-4 h-[calc(100vh-160px)]">
      {/* Conversation List */}
      <Card className="w-80 flex-shrink-0 flex flex-col overflow-hidden">
        <div className="p-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2 bg-[var(--input-bg)] border border-[var(--border)] rounded-lg px-2.5 py-1.5">
            <Search size={13} className="text-[var(--muted)]" />
            <input
              className="bg-transparent border-none outline-none text-xs flex-1 text-[var(--text)]"
              placeholder="Search conversations..."
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveConvo(c)}
              className={`w-full text-left px-4 py-3 border-b border-[var(--border)] transition-colors cursor-pointer ${
                activeConvo.id === c.id ? "bg-[var(--input-bg)]" : "hover:bg-[var(--input-bg)]"
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-xs font-bold text-[var(--text)]">{c.name}</span>
                <span className="text-[10px] text-[var(--muted)]">{c.time}</span>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[11px] text-[var(--muted)] truncate max-w-[180px]">{c.lastMsg}</p>
                {c.unread > 0 && (
                  <span className="w-4 h-4 bg-brand-green rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                    {c.unread}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="px-5 py-3 border-b border-[var(--border)]">
          <h3 className="text-sm font-bold text-[var(--text)]">{activeConvo.name}</h3>
          <p className="text-[11px] text-[var(--muted)]">Borrower · CBN Rice Fund</p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.from === "lender" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                  m.from === "lender"
                    ? "bg-brand-green text-white"
                    : "bg-[var(--input-bg)] text-[var(--text)]"
                }`}
              >
                <p className="text-xs leading-relaxed">{m.text}</p>
                <p className={`text-[10px] mt-1 ${m.from === "lender" ? "text-white/60" : "text-[var(--muted)]"}`}>
                  {m.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-[var(--border)] flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            className="flex-1"
          />
          <Button size="md">
            <Send size={15} />
          </Button>
        </div>
      </Card>
    </div>
  );
}
