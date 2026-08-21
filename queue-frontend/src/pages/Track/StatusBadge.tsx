import type { ApiTicketStatus } from "../../types/api";
import { TICKET_STATUS_LABELS } from "../../components/apiLabels";

const STATUS_CLASSES: Record<ApiTicketStatus, string> = {
  WAITING: "bg-[var(--color-success-soft)] text-[var(--color-success)]",
  CALLED: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
  IN_PROGRESS: "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
  COMPLETED: "bg-[var(--color-surface)] text-[var(--color-text-muted)]",
  ABSENT: "bg-red-50 text-red-600",
  TRANSFERRED: "bg-[var(--color-surface)] text-[var(--color-text-muted)]",
  CANCELLED: "bg-red-50 text-red-600",
};

export function StatusBadge({ status }: { status: ApiTicketStatus }) {
  return (
    <span className={`rounded-full px-3 py-1 text-xs font-medium ${STATUS_CLASSES[status]}`}>
      {TICKET_STATUS_LABELS[status]}
    </span>
  );
}
