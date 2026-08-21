import type { InputHTMLAttributes, SelectHTMLAttributes, ReactNode } from "react";

interface FieldWrapperProps {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

function FieldWrapper({ label, error, children, className }: FieldWrapperProps) {
  return (
    <label className={`flex flex-col gap-1.5 ${className ?? ""}`}>
      <span className="text-sm font-medium text-[var(--color-text)]">{label}</span>
      {children}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </label>
  );
}

const inputClasses =
  "rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2.5 " +
  "text-sm text-[var(--color-text)] outline-none transition-colors " +
  "focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent-soft)]";

type TextFieldProps = Omit<FieldWrapperProps, "children"> & InputHTMLAttributes<HTMLInputElement>;

export function TextField({ label, error, className, ...inputProps }: TextFieldProps) {
  return (
    <FieldWrapper label={label} error={error} className={className}>
      <input {...inputProps} className={inputClasses} />
    </FieldWrapper>
  );
}

type SelectFieldProps = Omit<FieldWrapperProps, "children"> & SelectHTMLAttributes<HTMLSelectElement>;

export function SelectField({ label, error, className, children, ...selectProps }: SelectFieldProps) {
  return (
    <FieldWrapper label={label} error={error} className={className}>
      <select {...selectProps} className={inputClasses}>
        {children}
      </select>
    </FieldWrapper>
  );
}
