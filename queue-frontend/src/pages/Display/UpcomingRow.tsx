import { Star } from "lucide-react";
import type { Ticket } from "../../types/ticket";

interface Props {
  ticket: Ticket;
}

export function UpcomingRow({ ticket }: Props) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-[var(--color-surface-raised)] border border-[var(--color-border)] px-4 py-3">
      <span className="flex items-center gap-1.5 text-base font-medium text-[var(--color-text)]">
        {ticket.priority === "high" && (
          <Star size={14} className="fill-[var(--color-warning)] text-[var(--color-warning)]" aria-hidden="true" />
        )}
        {ticket.number}
      </span>
      <span className="text-sm text-[var(--color-text-muted)]">{ticket.serviceName}</span>
    </div>
  );
}
