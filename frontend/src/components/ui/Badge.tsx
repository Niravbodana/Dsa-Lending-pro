import type { ReactNode } from "react";

type Variant = "default" | "success" | "warning" | "info" | "gold";

const STYLES: Record<Variant, string> = {
  default: "bg-slate-100 text-slate-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-800",
  info: "bg-teal-50 text-neercred-teal",
  gold: "bg-gradient-to-r from-neercred-gold/20 to-amber-100 text-amber-900",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[variant]} ${className}`}>
      {children}
    </span>
  );
}
