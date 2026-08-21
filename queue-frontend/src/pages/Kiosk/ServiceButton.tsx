import { SERVICE_TYPE_ICONS } from "../../components/iconMap";
import { SERVICE_TYPE_LABELS } from "../../components/apiLabels";
import { useLanguage } from "../../i18n/LanguageContext";
import type { ApiService } from "../../types/api";

interface Props {
  service: ApiService;
  onSelect: (service: ApiService) => void;
  disabled?: boolean;
}

export function ServiceButton({ service, onSelect, disabled }: Props) {
  const Icon = SERVICE_TYPE_ICONS[service.service_type];
  const { serviceName } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => onSelect(service)}
      disabled={disabled}
      className="flex flex-col items-center gap-3 rounded-2xl border border-[var(--color-border)]
                 bg-[var(--color-surface-raised)] px-4 py-8 text-center
                 transition-colors hover:border-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]
                 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2
                 focus-visible:outline-[var(--color-accent)]
                 disabled:pointer-events-none disabled:opacity-50"
    >
      {Icon && <Icon size={32} strokeWidth={1.75} className="text-[var(--color-accent)]" aria-hidden="true" />}
      <span className="text-base font-medium text-[var(--color-text)]">
        {serviceName(service.service_type, SERVICE_TYPE_LABELS[service.service_type])}
      </span>
    </button>
  );
}
