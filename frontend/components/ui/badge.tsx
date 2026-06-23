import { cn } from "@/lib/utils";

interface BadgeProps {
  text: string;
  bg: string;
  color: string;
  className?: string;
}

export function Badge({ text, bg, color, className }: BadgeProps) {
  return (
    <span
      className={cn("text-[10px] font-bold px-2 py-0.5 rounded-[5px]", className)}
      style={{ background: bg, color }}
    >
      {text}
    </span>
  );
}

const statusMap: Record<string, { bg: string; color: string }> = {
  Active: { bg: "#dcfce7", color: "#16a34a" },
  "At Risk": { bg: "#fef3c7", color: "#d97706" },
  Defaulting: { bg: "#fee2e2", color: "#dc2626" },
  Completed: { bg: "#dbeafe", color: "#2563eb" },
  Draft: { bg: "#f3f4f6", color: "#6b7280" },
  Closed: { bg: "#f3f4f6", color: "#6b7280" },
  Suspended: { bg: "#fee2e2", color: "#dc2626" },
  Trial: { bg: "#dbeafe", color: "#2563eb" },
  Pending: { bg: "#fef3c7", color: "#d97706" },
  Open: { bg: "#fee2e2", color: "#dc2626" },
  "In Progress": { bg: "#fef3c7", color: "#d97706" },
  Resolved: { bg: "#dcfce7", color: "#16a34a" },
  Escalated: { bg: "#fce7f3", color: "#be185d" },
  Operational: { bg: "#dcfce7", color: "#16a34a" },
  Degraded: { bg: "#fef3c7", color: "#d97706" },
  Down: { bg: "#fee2e2", color: "#dc2626" },
};

export function StatusPill({ status }: { status: string }) {
  const s = statusMap[status] || { bg: "#f3f4f6", color: "#6b7280" };
  return <Badge text={status} bg={s.bg} color={s.color} />;
}

const planMap: Record<string, { bg: string; color: string }> = {
  Enterprise: { bg: "#fce7f3", color: "#be185d" },
  Growth: { bg: "#dbeafe", color: "#1d4ed8" },
  Starter: { bg: "#dcfce7", color: "#16a34a" },
};

export function PlanBadge({ plan }: { plan: string }) {
  const s = planMap[plan] || { bg: "#f3f4f6", color: "#6b7280" };
  return <Badge text={plan} bg={s.bg} color={s.color} />;
}
