import { useState } from "react";
import { CheckCircle2, UserX, Send, Play, Phone, Mail, CreditCard, Clock } from "lucide-react";
import type { ApiGuichetDetail, ApiTicket } from "../../types/api";

interface Props {
  ticket: ApiTicket;
  otherGuichets: ApiGuichetDetail[];
  disabled?: boolean;
  onStart: () => void;
  onComplete: () => void;
  onAbsent: () => void;
  onTransfer: (guichetId: number) => void;
}

function InfoRow({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={16} className="mt-0.5 text-[var(--color-text-muted)]" aria-hidden="true" />
      <div>
        <p className="text-xs text-[var(--color-text-muted)]">{label}</p>
        <p className="text-sm text-[var(--color-text)]">{value}</p>
      </div>
    </div>
  );
}

function elapsedMinutes(iso: string): number {
  return Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
}

export function ActiveClientCard({ ticket, otherGuichets, disabled, onStart, onComplete, onAbsent, onTransfer }: Props) {
  const [transferTarget, setTransferTarget] = useState(otherGuichets[0]?.id ?? "");
  const isCalled = ticket.ticket_status === "CALLED";
  const isInProgress = ticket.ticket_status === "IN_PROGRESS";

  return (
    <div className="rounded-2xl border border-[var(--color-accent)] bg-[var(--color-accent-soft)] p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-[var(--color-text-muted)]">Client en cours</p>
          <p className="text-3xl font-semibold text-[var(--color-text)]">{ticket.ticket_code}</p>
          <p className="text-sm text-[var(--color-text-muted)]">{ticket.service.service_description}</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-[var(--color-text-muted)]">
          <Clock size={14} aria-hidden="true" />
          {ticket.called_at ? `appelé il y a ${elapsedMinutes(ticket.called_at)} min` : ""}
        </span>
      </div>

      <div className="mb-5 grid grid-cols-1 gap-4 rounded-xl bg-[var(--color-surface-raised)] p-4 sm:grid-cols-2">
        <InfoRow icon={Phone} label="Nom" value={ticket.owner.client_name} />
        <InfoRow icon={Phone} label="Téléphone" value={String(ticket.owner.client_phone_number)} />
        <InfoRow icon={Mail} label="Email" value={ticket.owner.client_email} />
        {ticket.owner.carte_masquee && (
          <InfoRow icon={CreditCard} label="Carte" value={ticket.owner.carte_masquee} />
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {isCalled && (
          <>
            <button
              type="button"
              onClick={onStart}
              disabled={disabled}
              className="flex items-center gap-1.5 rounded-lg bg-[var(--color-accent)] px-3 py-2
                         text-sm font-medium text-white transition-colors hover:bg-[var(--color-accent-hover)]
                         disabled:pointer-events-none disabled:opacity-50"
            >
              <Play size={16} aria-hidden="true" />
              Démarrer
            </button>
            <button
              type="button"
              onClick={onAbsent}
              disabled={disabled}
              className="flex items-center gap-1.5 rounded-lg border border-[var(--color-border)]
                         bg-[var(--color-surface-raised)] px-3 py-2 text-sm font-medium text-[var(--color-text)]
                         transition-colors hover:bg-[var(--color-surface)]
                         disabled:pointer-events-none disabled:opacity-50"
            >
              <UserX size={16} aria-hidden="true" />
              Absent
            </button>
          </>
        )}

        {isInProgress && (
          <button
            type="button"
            onClick={onComplete}
            disabled={disabled}
            className="flex items-center gap-1.5 rounded-lg bg-[var(--color-success)] px-3 py-2
                       text-sm font-medium text-white transition-colors hover:opacity-90
                       disabled:pointer-events-none disabled:opacity-50"
          >
            <CheckCircle2 size={16} aria-hidden="true" />
            Terminé
          </button>
        )}
      </div>

      {otherGuichets.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[var(--color-border)] pt-4">
          <span className="text-xs text-[var(--color-text-muted)]">Transférer vers</span>
          <select
            value={transferTarget}
            onChange={(e) => setTransferTarget(Number(e.target.value))}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)]
                       px-2 py-1.5 text-sm text-[var(--color-text)]"
          >
            {otherGuichets.map((g) => (
              <option key={g.id} value={g.id}>
                {g.guichet_name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => onTransfer(Number(transferTarget))}
            disabled={disabled}
            className="flex items-center gap-1.5 rounded-lg border border-[var(--color-accent)]
                       px-3 py-1.5 text-sm font-medium text-[var(--color-accent)]
                       transition-colors hover:bg-[var(--color-accent-soft)]
                       disabled:pointer-events-none disabled:opacity-50"
          >
            <Send size={14} aria-hidden="true" />
            Transférer
          </button>
        </div>
      )}
    </div>
  );
}
