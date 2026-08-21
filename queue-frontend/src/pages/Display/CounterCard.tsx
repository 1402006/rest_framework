import type { Counter } from "../../types/ticket";

interface Props {
  counter: Counter;
}

export function CounterCard({ counter }: Props) {
  const isActive = counter.currentTicketNumber !== null;

  return (
    <div
      className={`rounded-2xl p-6 text-center transition-colors ${
        isActive
          ? "bg-success-soft"
          : "bg-surface-raised border border-border"
      }`}
    >
      <p
        className={`text-sm ${
          isActive ? "text-success" : "text-text-muted"
        }`}
      >
        {counter.label}
      </p>
      <p
        className={`mt-2 text-4xl font-semibold tracking-tight ${
          isActive ? "text-success" : "text-text-muted"
        }`}
      >
        {counter.currentTicketNumber ?? "—"}
      </p>
    </div>
  );
}
