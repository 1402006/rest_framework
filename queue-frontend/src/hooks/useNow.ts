import { useEffect, useState } from "react";

export function useNow(refreshMs = 15000): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), refreshMs);
    return () => clearInterval(id);
  }, [refreshMs]);

  return now;
}

export function elapsedMinutes(createdAt: string, now: Date): number {
  const created = new Date(createdAt).getTime();
  return Math.max(0, Math.round((now.getTime() - created) / 60000));
}
