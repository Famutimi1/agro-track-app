"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CreditCard, Landmark, Smartphone, Wheat, Check, Copy } from "lucide-react";
import {
  useInitiateCardPayment,
  useInitiateBankTransfer,
  useInitiateUssd,
  useConfirmManualPayment,
  useDeclareInKindRepayment,
} from "@/lib/hooks";
import type { BankTransferInit, UssdInit } from "@/lib/api";

type Channel = "CARD" | "BANK_TRANSFER" | "USSD" | "IN_KIND";

const CHANNELS: { key: Channel; label: string; icon: typeof CreditCard }[] = [
  { key: "CARD", label: "Card", icon: CreditCard },
  { key: "BANK_TRANSFER", label: "Bank Transfer", icon: Landmark },
  { key: "USSD", label: "USSD", icon: Smartphone },
  { key: "IN_KIND", label: "In-Kind", icon: Wheat },
];

function formatNaira(amount: number) {
  return `₦${Math.round(amount || 0).toLocaleString()}`;
}

interface RepaymentModalProps {
  open: boolean;
  onClose: () => void;
  repaymentId: string;
  amount: number;
}

export function RepaymentModal({ open, onClose, repaymentId, amount }: RepaymentModalProps) {
  const [channel, setChannel] = useState<Channel>("CARD");

  const handleClose = () => {
    setChannel("CARD");
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title="Make a Repayment" wide>
      <p className="text-xs text-[var(--muted)] mb-4">
        Amount due: <span className="font-bold text-[var(--text)]">{formatNaira(amount)}</span>
      </p>

      <div className="flex gap-2 mb-5 border-b border-[var(--border)] pb-3 flex-wrap">
        {CHANNELS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setChannel(key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              channel === key
                ? "bg-brand-green text-white"
                : "bg-[var(--input-bg)] text-[var(--muted)] hover:text-[var(--text)]"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {channel === "CARD" && <CardTab repaymentId={repaymentId} />}
      {channel === "BANK_TRANSFER" && <BankTransferTab repaymentId={repaymentId} onDone={handleClose} />}
      {channel === "USSD" && <UssdTab repaymentId={repaymentId} onDone={handleClose} />}
      {channel === "IN_KIND" && <InKindTab repaymentId={repaymentId} onDone={handleClose} />}
    </Modal>
  );
}

function CardTab({ repaymentId }: { repaymentId: string }) {
  const initiateCard = useInitiateCardPayment();

  const handlePay = () => {
    initiateCard.mutate(repaymentId, {
      onSuccess: (data) => {
        if (data?.authorizationUrl) {
          window.location.href = data.authorizationUrl;
        }
      },
    });
  };

  return (
    <div className="text-center py-6">
      <p className="text-xs text-[var(--muted)] mb-4">
        You&apos;ll be redirected to Paystack to complete a secure card payment.
      </p>
      {initiateCard.isError && (
        <p className="text-xs text-red-500 mb-3">Could not start payment. Please try again.</p>
      )}
      <Button onClick={handlePay} disabled={initiateCard.isPending}>
        {initiateCard.isPending ? "Redirecting…" : "Pay with Card"}
      </Button>
    </div>
  );
}

function CopyableField({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
      <div>
        <p className="text-[10px] text-[var(--muted)] uppercase">{label}</p>
        <p className="text-sm font-semibold text-[var(--text)]">{value}</p>
      </div>
      <button
        onClick={handleCopy}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--input-bg)] text-[var(--muted)] cursor-pointer"
      >
        {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
      </button>
    </div>
  );
}

function BankTransferTab({ repaymentId, onDone }: { repaymentId: string; onDone: () => void }) {
  const initiate = useInitiateBankTransfer();
  const confirm = useConfirmManualPayment();
  const [details, setDetails] = useState<BankTransferInit | null>(null);
  const [reported, setReported] = useState(false);

  const handleGenerate = () => {
    initiate.mutate(repaymentId, { onSuccess: (data) => setDetails(data ?? null) });
  };

  const handleConfirm = () => {
    confirm.mutate(
      { id: repaymentId, method: "BANK_TRANSFER" },
      { onSuccess: () => setReported(true) }
    );
  };

  if (reported) {
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 mx-auto bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-3">
          <Check size={24} className="text-green-600" />
        </div>
        <h4 className="text-base font-bold text-[var(--text)] mb-1">Transfer Reported</h4>
        <p className="text-xs text-[var(--muted)] mb-4">
          We&apos;ll confirm your payment once it reflects in our account.
        </p>
        <Button variant="secondary" onClick={onDone}>Close</Button>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="text-center py-6">
        <p className="text-xs text-[var(--muted)] mb-4">
          Generate a unique reference and our bank account details for a manual transfer.
        </p>
        {initiate.isError && (
          <p className="text-xs text-red-500 mb-3">Could not generate details. Please try again.</p>
        )}
        <Button onClick={handleGenerate} disabled={initiate.isPending}>
          {initiate.isPending ? "Generating…" : "Get Bank Details"}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-[var(--input-bg)] rounded-xl px-4 py-1 mb-4">
        <CopyableField label="Bank Name" value={details.bankName} />
        <CopyableField label="Account Number" value={details.accountNumber} />
        <CopyableField label="Account Name" value={details.accountName} />
        <CopyableField label="Amount" value={formatNaira(details.amount)} />
        <CopyableField label="Reference" value={details.reference} />
      </div>
      <p className="text-[11px] text-[var(--muted)] mb-4">
        Include the reference above in your transfer narration, then confirm below once done.
      </p>
      {confirm.isError && (
        <p className="text-xs text-red-500 mb-3">Could not report your transfer. Please try again.</p>
      )}
      <Button className="w-full" onClick={handleConfirm} disabled={confirm.isPending}>
        {confirm.isPending ? "Reporting…" : "I've Made the Transfer"}
      </Button>
    </div>
  );
}

function UssdTab({ repaymentId, onDone }: { repaymentId: string; onDone: () => void }) {
  const initiate = useInitiateUssd();
  const confirm = useConfirmManualPayment();
  const [details, setDetails] = useState<UssdInit | null>(null);
  const [reported, setReported] = useState(false);

  const handleGenerate = () => {
    initiate.mutate(repaymentId, { onSuccess: (data) => setDetails(data ?? null) });
  };

  const handleConfirm = () => {
    confirm.mutate(
      { id: repaymentId, method: "USSD" },
      { onSuccess: () => setReported(true) }
    );
  };

  if (reported) {
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 mx-auto bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-3">
          <Check size={24} className="text-green-600" />
        </div>
        <h4 className="text-base font-bold text-[var(--text)] mb-1">Payment Reported</h4>
        <p className="text-xs text-[var(--muted)] mb-4">
          We&apos;ll confirm your payment once it reflects in our account.
        </p>
        <Button variant="secondary" onClick={onDone}>Close</Button>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="text-center py-6">
        <p className="text-xs text-[var(--muted)] mb-4">Generate a USSD code to dial on your phone.</p>
        {initiate.isError && (
          <p className="text-xs text-red-500 mb-3">Could not generate code. Please try again.</p>
        )}
        <Button onClick={handleGenerate} disabled={initiate.isPending}>
          {initiate.isPending ? "Generating…" : "Generate USSD Code"}
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-[var(--input-bg)] rounded-xl px-4 py-6 mb-4 text-center">
        <p className="text-[10px] text-[var(--muted)] uppercase mb-1">Dial this code</p>
        <p className="text-2xl font-bold text-[var(--text)] tracking-wide">{details.ussdCode}</p>
        <p className="text-[11px] text-[var(--muted)] mt-2">Reference: {details.reference}</p>
      </div>
      {confirm.isError && (
        <p className="text-xs text-red-500 mb-3">Could not report your payment. Please try again.</p>
      )}
      <Button className="w-full" onClick={handleConfirm} disabled={confirm.isPending}>
        {confirm.isPending ? "Reporting…" : "I've Completed the USSD Payment"}
      </Button>
    </div>
  );
}

function InKindTab({ repaymentId, onDone }: { repaymentId: string; onDone: () => void }) {
  const declare = useDeclareInKindRepayment();
  const [produceType, setProduceType] = useState("");
  const [quantityKg, setQuantityKg] = useState("");
  const [deliveryLocation, setDeliveryLocation] = useState("");
  const [declared, setDeclared] = useState(false);

  const canSubmit = produceType.trim() && Number(quantityKg) > 0 && deliveryLocation.trim();

  const handleSubmit = () => {
    if (!canSubmit) return;
    declare.mutate(
      {
        id: repaymentId,
        data: { produceType, quantityKg: Number(quantityKg), deliveryLocation },
      },
      { onSuccess: () => setDeclared(true) }
    );
  };

  if (declared) {
    return (
      <div className="text-center py-8">
        <div className="w-14 h-14 mx-auto bg-green-50 dark:bg-green-900/20 rounded-full flex items-center justify-center mb-3">
          <Check size={24} className="text-green-600" />
        </div>
        <h4 className="text-base font-bold text-[var(--text)] mb-1">Declaration Submitted</h4>
        <p className="text-xs text-[var(--muted)] mb-4">
          Your produce declaration is pending verification by the lender.
        </p>
        <Button variant="secondary" onClick={onDone}>Close</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Produce Type</label>
        <Input
          placeholder="e.g., Maize, Rice"
          value={produceType}
          onChange={(e) => setProduceType(e.target.value)}
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Quantity (kg)</label>
        <Input
          type="number"
          placeholder="e.g., 500"
          value={quantityKg}
          onChange={(e) => setQuantityKg(e.target.value)}
        />
      </div>
      <div>
        <label className="text-xs font-semibold text-[var(--text)] mb-1.5 block">Delivery Location</label>
        <Input
          placeholder="Where the produce will be delivered"
          value={deliveryLocation}
          onChange={(e) => setDeliveryLocation(e.target.value)}
        />
      </div>
      {declare.isError && (
        <p className="text-xs text-red-500">Could not submit declaration. Please try again.</p>
      )}
      <Button className="w-full" onClick={handleSubmit} disabled={!canSubmit || declare.isPending}>
        {declare.isPending ? "Submitting…" : "Declare Produce Repayment"}
      </Button>
    </div>
  );
}
