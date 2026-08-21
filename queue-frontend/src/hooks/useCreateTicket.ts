import { useState } from "react";
import { createTicket } from "../api/client";
import type { ClientInfo, PriorityReason, ServiceDetails, Ticket, TicketPriority } from "../types/ticket";

export function useCreateTicket() {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(
    agencyId: string,
    serviceId: string,
    clientInfo?: ClientInfo,
    serviceDetails?: ServiceDetails,
    priority: TicketPriority = "normal",
    priorityReason: PriorityReason = "none",
  ): Promise<Ticket | null> {
    setIsCreating(true);
    setError(null);
    try {
      const ticket = await createTicket(agencyId, serviceId, clientInfo, serviceDetails, priority, priorityReason);
      return ticket;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Impossible de créer le ticket. Réessayez.");
      return null;
    } finally {
      setIsCreating(false);
    }
  }

  return { create, isCreating, error };
}
