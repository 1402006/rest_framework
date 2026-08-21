import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Bell, Clock, Users2, CheckCircle2, MapPin, CalendarDays, Star } from "lucide-react";
import { subscribeToTicketByCode } from "../../api/client";
import { StatusBadge } from "./StatusBadge";
import { QueueProgressBar } from "./QueueProgressBar";
import { RatingForm } from "./RatingForm";
import { SERVICE_TYPE_LABELS } from "../../components/apiLabels";
import type { ApiTicket } from "../../types/api";
import type { LocalFeedback } from "../../types/api-extra";

export function Track() {
  const { ticketId: ticketCode } = useParams<{ ticketId: string }>();
  const [ticket, setTicket] = useState<ApiTicket | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [feedback, setFeedback] = useState<LocalFeedback | null>(null);

  useEffect(() => {
    if (!ticketCode) {
      setIsLoading(false);
      setNotFound(true);
      return;
    }
    setIsLoading(true);
    setNotFound(false);

    let firstResult = true;
    const unsubscribe = subscribeToTicketByCode(ticketCode, (t) => {
      if (t) {
        setTicket(t);
        setIsLoading(false);
      } else if (firstResult) {
        setIsLoading(false);
        setNotFound(true);
      }
      firstResult = false;
    });

    return unsubscribe;
  }, [ticketCode]);

  // Notification navigateur quand le tour approche.
  useEffect(() => {
    if (!ticket || ticket.ticket_status !== "WAITING" || ticket.queue_position > 2) return;
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "granted") {
      new Notification("Votre tour approche", {
        body: `Ticket ${ticket.ticket_code} — encore ${ticket.queue_position} avant vous.`,
      });
    } else if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [ticket?.queue_position, ticket?.ticket_status, ticket?.ticket_code]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6">
        <p className="text-sm text-[var(--color-text-muted)]">Chargement de votre ticket...</p>
      </div>
    );
  }

  if (notFound || !ticket) {
    return (
      <div className="flex min-h-screen items-center justify-center px-6 text-center">
        <p className="text-sm text-[var(--color-text-muted)]">
          Ticket introuvable. Vérifiez le lien ou reprenez un ticket à la borne.
        </p>
      </div>
    );
  }

  const isWaiting = ticket.ticket_status === "WAITING";
  const isActive = ticket.ticket_status === "CALLED" || ticket.ticket_status === "IN_PROGRESS";
  const isCompleted = ticket.ticket_status === "COMPLETED";
  const isClosedOther = ["ABSENT", "TRANSFERRED", "CANCELLED"].includes(ticket.ticket_status);

  const createdAt = new Date(ticket.created_at);
  const dateLabel = createdAt.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const timeLabel = createdAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-10">
      <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs text-[var(--color-text-muted)]">Votre ticket</span>
          <StatusBadge status={ticket.ticket_status} />
        </div>

        <p className="text-center text-4xl font-semibold tracking-tight text-[var(--color-text)]">
          {ticket.ticket_code}
        </p>
        <p className="text-center text-sm text-[var(--color-text-muted)]">
          {SERVICE_TYPE_LABELS[ticket.service.service_type]}
        </p>

        <div className="mb-5 mt-2 flex flex-col items-center gap-1 text-xs text-[var(--color-text-muted)]">
          <span className="flex items-center gap-1">
            <MapPin size={12} aria-hidden="true" />
            {ticket.guichet.guichet_name}
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays size={12} aria-hidden="true" />
            {dateLabel} · {timeLabel}
          </span>
        </div>

        {isWaiting && (
          <>
            <div className="mb-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[var(--color-surface)] p-3 text-center">
                <p className="mb-1 flex items-center justify-center gap-1 text-xs text-[var(--color-text-muted)]">
                  <Users2 size={12} aria-hidden="true" />
                  Devant vous
                </p>
                <p className="text-lg font-semibold text-[var(--color-text)]">
                  {Math.max(0, ticket.queue_position - 1)}
                </p>
              </div>
              <div className="rounded-xl bg-[var(--color-surface)] p-3 text-center">
                <p className="mb-1 flex items-center justify-center gap-1 text-xs text-[var(--color-text-muted)]">
                  <Clock size={12} aria-hidden="true" />
                  Position
                </p>
                <p className="text-lg font-semibold text-[var(--color-text)]">{ticket.queue_position}</p>
              </div>
            </div>

            <div className="mb-4">
              <QueueProgressBar position={ticket.queue_position} />
            </div>

            <div className="flex items-center gap-2 rounded-lg bg-[var(--color-warning-soft)] px-3 py-2 text-xs text-[var(--color-warning)]">
              <Bell size={14} aria-hidden="true" />
              Vous serez notifié quand votre tour approche
            </div>
          </>
        )}

        {isActive && (
          <p className="rounded-lg bg-[var(--color-warning-soft)] px-3 py-3 text-center text-sm font-medium text-[var(--color-warning)]">
            C'est votre tour ! Présentez-vous au {ticket.guichet.guichet_name}.
          </p>
        )}

        {isCompleted && !feedback && <RatingForm onSubmitted={setFeedback} />}

        {isCompleted && feedback && (
          <div className="text-center">
            <CheckCircle2 size={28} className="mx-auto mb-2 text-[var(--color-success)]" aria-hidden="true" />
            <p className="mb-2 text-sm font-medium text-[var(--color-text)]">Merci pour votre avis !</p>
            <div className="mb-1 flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <Star
                  key={value}
                  size={18}
                  className={
                    value <= feedback.rating
                      ? "fill-[var(--color-warning)] text-[var(--color-warning)]"
                      : "text-[var(--color-border)]"
                  }
                  strokeWidth={1.5}
                />
              ))}
            </div>
            {feedback.comment && (
              <p className="mt-2 text-xs italic text-[var(--color-text-muted)]">"{feedback.comment}"</p>
            )}
          </div>
        )}

        {isClosedOther && (
          <p className="rounded-lg bg-[var(--color-surface)] px-3 py-3 text-center text-sm text-[var(--color-text-muted)]">
            {ticket.ticket_status === "ABSENT" && "Vous avez été marqué absent lors de l'appel."}
            {ticket.ticket_status === "TRANSFERRED" && "Ce ticket a été transféré vers un autre guichet."}
            {ticket.ticket_status === "CANCELLED" && "Ce ticket a été annulé."}
          </p>
        )}
      </div>
    </div>
  );
}
