import type { ApiTicket } from "../../types/api";

interface Props {
  tickets: ApiTicket[];
}

function elapsedMinutes(createdAt: string): number {
  return Math.max(0, Math.round((Date.now() - new Date(createdAt).getTime()) / 60000));
}

export function WaitingList({ tickets }: Props) {
  if (tickets.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-text-muted">
        Aucun client en attente
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {tickets.map((ticket) => (
        <div
          key={ticket.id_ticket}
          className="flex items-center justify-between gap-4 rounded-xl border border-border
                     bg-surface-raised px-4 py-3"
        >
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-text">{ticket.ticket_code}</span>
            <p className="text-sm text-text-muted">{ticket.owner.client_name}</p>
          </div>
          <span className="text-xs text-text-muted">
            en attente depuis {elapsedMinutes(ticket.created_at)} min
          </span>
        </div>
      ))}
    </div>
  );
}
