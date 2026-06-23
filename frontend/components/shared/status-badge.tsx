"use client";

import { cn } from "@/lib/utils";

type StatusVariant = "success" | "warning" | "error" | "info" | "default";

const statusColorConfig: Record<StatusVariant, { bg: string; color: string }> = {
  success: { bg: "#dcfce7", color: "#16a34a" },
  warning: { bg: "#fef3c7", color: "#d97706" },
  error: { bg: "#fee2e2", color: "#dc2626" },
  info: { bg: "#dbeafe", color: "#2563eb" },
  default: { bg: "#f3f4f6", color: "#6b7280" },
};

const loanStatusMap: Record<string, StatusVariant> = {
  PENDING: "warning",
  ACTIVE: "success",
  COMPLETED: "info",
  DEFAULTED: "error",
  CANCELLED: "default",
};

const applicationStatusMap: Record<string, StatusVariant> = {
  DRAFT: "default",
  SUBMITTED: "info",
  UNDER_REVIEW: "warning",
  APPROVED: "success",
  REJECTED: "error",
  DISBURSED: "success",
  CANCELLED: "default",
};

const disbursementStatusMap: Record<string, StatusVariant> = {
  PENDING: "warning",
  APPROVED: "info",
  PROCESSING: "warning",
  COMPLETED: "success",
  FAILED: "error",
};

const repaymentStatusMap: Record<string, StatusVariant> = {
  PENDING: "default",
  PAID: "success",
  OVERDUE: "error",
  PARTIAL: "warning",
};

const farmReportStatusMap: Record<string, StatusVariant> = {
  PENDING: "warning",
  VERIFIED: "success",
  REJECTED: "error",
};

interface StatusBadgeProps {
  status: string;
  type?: "loan" | "application" | "disbursement" | "repayment" | "farmReport" | "generic";
  className?: string;
}

export function StatusBadge({ status, type = "generic", className }: StatusBadgeProps) {
  let variant: StatusVariant = "default";

  switch (type) {
    case "loan":
      variant = loanStatusMap[status] || "default";
      break;
    case "application":
      variant = applicationStatusMap[status] || "default";
      break;
    case "disbursement":
      variant = disbursementStatusMap[status] || "default";
      break;
    case "repayment":
      variant = repaymentStatusMap[status] || "default";
      break;
    case "farmReport":
      variant = farmReportStatusMap[status] || "default";
      break;
    default:
      variant = "default";
  }

  const colors = statusColorConfig[variant];

  return (
    <span
      className={cn("text-[10px] font-bold px-2 py-0.5 rounded-[5px]", className)}
      style={{ background: colors.bg, color: colors.color }}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

export function FarmScoreTierBadge({ tier }: { tier: string }) {
  const tierColors: Record<string, { bg: string; color: string }> = {
    EXCELLENT: { bg: "#dcfce7", color: "#16a34a" },
    GOOD: { bg: "#dbeafe", color: "#2563eb" },
    FAIR: { bg: "#fef3c7", color: "#d97706" },
    POOR: { bg: "#fed7aa", color: "#c2410c" },
    VERY_POOR: { bg: "#fee2e2", color: "#dc2626" },
  };

  const colors = tierColors[tier] || statusColorConfig.default;

  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-[5px]"
      style={{ background: colors.bg, color: colors.color }}
    >
      {tier.replace(/_/g, " ")}
    </span>
  );
}
