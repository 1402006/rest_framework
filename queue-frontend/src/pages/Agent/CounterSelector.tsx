import type { Counter } from "../../types/ticket";

interface Props {
  counters: Counter[];
  selectedCounterId: string;
  onChange: (counterId: string) => void;
  serviceNameById: Record<string, string>;
}

export function CounterSelector({ counters, selectedCounterId, onChange, serviceNameById }: Props) {
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="counter-select" className="text-xs text-[var(--color-text-muted)]">
        Session agent — guichet
      </label>
      <select
        id="counter-select"
        value={selectedCounterId}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)]
                   px-2 py-1 text-sm text-[var(--color-text)]"
      >
        {counters.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label} — {serviceNameById[c.serviceId] ?? c.serviceId}
          </option>
        ))}
      </select>
    </div>
  );
}
