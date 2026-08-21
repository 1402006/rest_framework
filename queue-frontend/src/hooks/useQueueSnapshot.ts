import { useEffect, useState } from "react";
import { subscribeToQueue } from "../api/client";
import type { QueueSnapshot } from "../types/ticket";

export function useQueueSnapshot(agencyId?: string): QueueSnapshot {
  const [snapshot, setSnapshot] = useState<QueueSnapshot>({
    counters: [],
    upcoming: [],
    waiting: [],
    activeByCounter: {},
  });

  useEffect(() => {
    const unsubscribe = subscribeToQueue(setSnapshot, agencyId);
    return unsubscribe;
  }, [agencyId]);

  return snapshot;
}
