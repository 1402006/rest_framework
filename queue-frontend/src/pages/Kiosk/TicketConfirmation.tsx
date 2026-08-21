import { QRCodeSVG } from "qrcode.react";
import { RotateCcw, Printer, Users2, MapPin, CalendarDays, Star } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";
import { SERVICE_TYPE_LABELS } from "../../components/apiLabels";
import type { ApiTicket } from "../../types/api";
import type { PriorityReason } from "../../types/api-extra";

interface Props {
  ticket: ApiTicket;
  priorityReason: PriorityReason;
  onNewTicket: () => void;
}

export function TicketConfirmation({ ticket, priorityReason, onNewTicket }: Props) {
  const { t, lang, serviceName } = useLanguage();
  const trackingUrl = `${window.location.origin}/track/${ticket.ticket_code}`;
  const isWaiting = ticket.ticket_status === "WAITING";
  const peopleAhead = Math.max(0, ticket.queue_position - 1);
  const createdAt = new Date(ticket.created_at);
  const localeTag = lang === "fr" ? "fr-FR" : "en-US";
  const dateLabel = createdAt.toLocaleDateString(localeTag, { day: "2-digit", month: "2-digit", year: "numeric" });
  const timeLabel = createdAt.toLocaleTimeString(localeTag, { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col items-center gap-6 rounded-2xl border border-[var(--color-border)]
                     bg-[var(--color-surface-raised)] px-8 py-10 text-center">
      <div className="print-ticket flex flex-col items-center gap-6">
        <div>
          {priorityReason !== "none" && (
            <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-[var(--color-warning-soft)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-warning)]">
              <Star size={12} aria-hidden="true" />
              {priorityReason === "pregnancy" && t.confirmation.priorityBadgePregnancy}
              {priorityReason === "elderly" && t.confirmation.priorityBadgeElderly}
              {priorityReason === "disability" && t.confirmation.priorityBadgeDisability}
              {priorityReason === "other" && t.confirmation.priorityBadgeOther}
            </span>
          )}
          <p className="text-sm text-[var(--color-text-muted)]">{t.confirmation.yourTicket}</p>
          <p className="mt-1 text-5xl font-semibold tracking-tight text-[var(--color-text)]">
            {ticket.ticket_code}
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-muted)]">
            {serviceName(ticket.service.service_type, SERVICE_TYPE_LABELS[ticket.service.service_type])}
          </p>
        </div>

        <div className="flex flex-col items-center gap-1 text-xs text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1">
            <MapPin size={12} aria-hidden="true" />
            {t.confirmation.guichet} : {ticket.guichet.guichet_name}
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays size={12} aria-hidden="true" />
            {t.confirmation.date} {dateLabel} · {t.confirmation.time} {timeLabel}
          </span>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-white p-4">
          <QRCodeSVG value={trackingUrl} size={140} />
        </div>

        <p className="max-w-[240px] text-sm text-[var(--color-text-muted)]">{t.confirmation.scanHint}</p>

        {isWaiting && (
          <div className="rounded-xl bg-[var(--color-accent-soft)] p-3 text-center">
            <p className="mb-1 flex items-center justify-center gap-1 text-xs text-[var(--color-accent)]">
              <Users2 size={12} aria-hidden="true" />
              {t.confirmation.peopleAhead}
            </p>
            <p className="text-lg font-semibold text-[var(--color-accent)]">{peopleAhead}</p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => window.print()}
        className="no-print flex items-center gap-2 rounded-lg border border-[var(--color-border)]
                   px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface)]"
      >
        <Printer size={16} aria-hidden="true" />
        {t.confirmation.print}
      </button>

      <button
        type="button"
        onClick={onNewTicket}
        className="no-print flex items-center gap-2 text-sm font-medium text-[var(--color-text-muted)]
                   hover:text-[var(--color-text)]"
      >
        <RotateCcw size={16} aria-hidden="true" />
        {t.confirmation.newTicket}
      </button>
    </div>
  );
}
