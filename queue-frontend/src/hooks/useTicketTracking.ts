import { useEffect, useState } from "react";
import { subscribeToTicketByCode } from "../api/client";
import type { ApiTicket } from "../types/api";

interface TrackingState {
  ticket: ApiTicket | null;
  isLoading: boolean;
  notFound: boolean;
}

export function useTicketTracking(ticketCode: string | undefined): TrackingState {
  const [state, setState] = useState<TrackingState>({ ticket: null, isLoading: true, notFound: false });

  useEffect(() => {
    if (!ticketCode) {
      setState({ ticket: null, isLoading: false, notFound: true });
      return;
    }

    setState({ ticket: null, isLoading: true, notFound: false });

    const unsubscribe = subscribeToTicketByCode(ticketCode, (ticket) => {
      setState({ ticket, isLoading: false, notFound: !ticket });
    });

    return unsubscribe;
  }, [ticketCode]);

  return state;
}
