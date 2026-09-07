import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-wine text-ivory hover:bg-wine-bright border border-transparent",
  secondary:
    "bg-transparent text-ivory border border-gold hover:bg-surface-raised",
  ghost: "bg-transparent text-ivory-muted hover:text-ivory border-none",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-sm px-6 py-3 text-sm tracking-wide transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variantClasses[variant]} ${className}`}
      {...props}
    />
  );
}
