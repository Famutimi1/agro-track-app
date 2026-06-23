"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Send } from "lucide-react";

const messages = [
  { from: "lender", text: "Welcome to CBN Rice Farmers Support Fund. Your application has been approved!", time: "Jan 15" },
  { from: "lender", text: "Layer 1 disbursement of ₦200,000 has been processed to your account.", time: "Jan 20" },
  { from: "borrower", text: "Thank you! I have received the funds and started land preparation.", time: "Jan 21" },
  { from: "lender", text: "Great! Please submit your first farm report by Feb 5 to unlock Layer 2.", time: "Jan 22" },
  { from: "borrower", text: "I submitted my farm report with photos yesterday.", time: "Feb 3" },
  { from: "lender", text: "Report approved. Layer 2 disbursement of ₦340,000 processed.", time: "Feb 8" },
  { from: "borrower", text: "Received. The rice seedlings are growing well this season.", time: "Feb 9" },
];

export default function BorrowerMessagesPage() {
  const [newMsg, setNewMsg] = useState("");

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-[22px] font-bold text-[var(--text)] mb-1">Messages</h1>
        <p className="text-[13px] text-[var(--muted)]">Chat with your lender</p>
      </div>

      <Card className="flex flex-col h-[calc(100vh-220px)]">
        <div className="px-5 py-3 border-b border-[var(--border)]">
          <h3 className="text-sm font-bold text-[var(--text)]">CBN Rice Farmers Support Fund</h3>
          <p className="text-[11px] text-[var(--muted)]">Central Bank of Nigeria · Program Manager</p>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.from === "borrower" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                  m.from === "borrower"
                    ? "bg-brand-green text-white"
                    : "bg-[var(--input-bg)] text-[var(--text)]"
                }`}
              >
                <p className="text-xs leading-relaxed">{m.text}</p>
                <p className={`text-[10px] mt-1 ${m.from === "borrower" ? "text-white/60" : "text-[var(--muted)]"}`}>
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
