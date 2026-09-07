import { InputHTMLAttributes } from "react";

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export function Field({ label, error, id, className = "", ...props }: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm text-ivory-muted">
        {label}
      </label>
      <input
        id={id}
        className={`bg-surface border border-border rounded-sm px-4 py-3 text-ivory placeholder:text-ivory-muted/50 focus:outline-none focus:border-gold transition-colors ${className}`}
        {...props}
      />
      {error && <p className="text-sm text-gold-bright">{error}</p>}
    </div>
  );
}
