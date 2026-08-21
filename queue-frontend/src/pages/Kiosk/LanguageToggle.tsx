import { Languages } from "lucide-react";
import { useLanguage } from "../../i18n/LanguageContext";

export function LanguageToggle() {
  const { lang, toggleLang, t } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLang}
      className="absolute right-4 top-4 flex items-center gap-1.5 rounded-lg border border-[var(--color-border)]
                 bg-[var(--color-surface-raised)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)]
                 transition-colors hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
    >
      <Languages size={14} aria-hidden="true" />
      {t.kiosk.languageToggle}
      <span className="sr-only">({lang === "fr" ? "français" : "English"})</span>
    </button>
  );
}
