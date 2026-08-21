import { useState, type FormEvent } from "react";
import { ArrowLeft } from "lucide-react";
import { TextField, SelectField } from "../../components/FormField";
import { useLanguage } from "../../i18n/LanguageContext";
import { SERVICE_TYPE_LABELS } from "../../components/apiLabels";
import type { ApiService } from "../../types/api";
import type { PriorityReason } from "../../types/api-extra";

interface Props {
  service: ApiService;
  onBack: () => void;
  onSubmit: (payload: {
    client_name: string;
    client_phone_number: number;
    client_email: string;
    numero_carte_credit?: number;
    // Conservés côté frontend uniquement — non transmis à l'API Django
    // actuelle (pas de champ prévu côté backend pour l'instant).
    priorityReason: PriorityReason;
    note: string;
  }) => void;
  isSubmitting: boolean;
}

type FormState = {
  client_name: string;
  client_phone_number: string;
  client_email: string;
  numero_carte_credit: string;
  priorityReason: PriorityReason;
  note: string;
};

const initialState: FormState = {
  client_name: "",
  client_phone_number: "",
  client_email: "",
  numero_carte_credit: "",
  priorityReason: "none",
  note: "",
};

export function ClientInfoForm({ service, onBack, onSubmit, isSubmitting }: Props) {
  const { t, serviceName } = useLanguage();
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.client_name.trim()) next.client_name = "Nom requis";
    if (!/^[0-9+ ]{8,}$/.test(form.client_phone_number.trim())) next.client_phone_number = "Numéro invalide";
    if (!/^\S+@\S+\.\S+$/.test(form.client_email.trim())) next.client_email = "Email invalide";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      client_name: form.client_name.trim(),
      client_phone_number: Number(form.client_phone_number.replace(/\D/g, "")),
      client_email: form.client_email.trim(),
      numero_carte_credit: form.numero_carte_credit.trim()
        ? Number(form.numero_carte_credit.replace(/\D/g, ""))
        : undefined,
      priorityReason: form.priorityReason,
      note: form.note.trim(),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6 sm:p-8"
    >
      <button
        type="button"
        onClick={onBack}
        className="mb-4 flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
      >
        <ArrowLeft size={16} aria-hidden="true" />
        {t.form.changeService}
      </button>

      <p className="mb-1 text-sm text-[var(--color-text-muted)]">{t.form.selectedService}</p>
      <p className="mb-6 text-base font-medium text-[var(--color-text)]">
        {serviceName(service.service_type, SERVICE_TYPE_LABELS[service.service_type])}
      </p>

      <div className="mb-6">
        <p className="mb-3 text-sm font-semibold text-[var(--color-text)]">{t.form.personalInfoTitle}</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            label={t.form.fullName}
            value={form.client_name}
            onChange={(e) => update("client_name", e.target.value)}
            error={errors.client_name}
            autoComplete="name"
            className="sm:col-span-2"
          />
          <TextField
            label={t.form.phone}
            type="tel"
            value={form.client_phone_number}
            onChange={(e) => update("client_phone_number", e.target.value)}
            error={errors.client_phone_number}
            autoComplete="tel"
            placeholder="+237 6XX XX XX XX"
          />
          <TextField
            label={t.form.email}
            type="email"
            value={form.client_email}
            onChange={(e) => update("client_email", e.target.value)}
            error={errors.client_email}
            autoComplete="email"
          />
          <TextField
            label={t.form.cardNumber}
            value={form.numero_carte_credit}
            onChange={(e) => update("numero_carte_credit", e.target.value)}
            className="sm:col-span-2"
          />
        </div>
      </div>

      <div className="mb-6">
        <p className="mb-3 text-sm font-semibold text-[var(--color-text)]">{t.form.additionalInfoTitle}</p>
        <TextField
          label={t.form.noteLabel}
          value={form.note}
          onChange={(e) => update("note", e.target.value)}
        />
      </div>

      <div className="mb-6">
        <p className="mb-3 text-sm font-semibold text-[var(--color-text)]">{t.form.priorityTitle}</p>
        <SelectField
          label={t.form.priorityReasonLabel}
          value={form.priorityReason}
          onChange={(e) => update("priorityReason", e.target.value as PriorityReason)}
        >
          <option value="none">{t.form.priorityNone}</option>
          <option value="pregnancy">{t.form.priorityPregnancy}</option>
          <option value="elderly">{t.form.priorityElderly}</option>
          <option value="disability">{t.form.priorityDisability}</option>
          <option value="other">{t.form.priorityOther}</option>
        </SelectField>
        <p className="mt-1.5 text-xs text-[var(--color-text-muted)]">{t.form.priorityReasonHelp}</p>
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full rounded-lg bg-[var(--color-accent)] px-4 py-3 text-sm font-medium text-white
                   transition-colors hover:bg-[var(--color-accent-hover)]
                   disabled:pointer-events-none disabled:opacity-60"
      >
        {isSubmitting ? t.form.submitting : t.form.submit}
      </button>
    </form>
  );
}
