import { useEffect, useRef } from "react";
import type { Ticket } from "../types/ticket";

const NOTIFY_AT_POSITION = 2;

export function useApproachNotification(ticket: Ticket | null) {
  const hasNotified = useRef(false);

  useEffect(() => {
    if (!ticket) return;

    if (ticket.status !== "waiting") {
      hasNotified.current = false;
      return;
    }

    if (ticket.position > NOTIFY_AT_POSITION) {
      hasNotified.current = false;
      return;
    }

    if (hasNotified.current) return;
    if (typeof Notification === "undefined") return;

    if (Notification.permission === "granted") {
      new Notification("Votre tour approche", {
        body: `Ticket ${ticket.number} — encore ${ticket.position} client${ticket.position > 1 ? "s" : ""} avant vous.`,
      });
      hasNotified.current = true;
    } else if (Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [ticket]);
}
