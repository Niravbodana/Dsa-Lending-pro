import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: { label: string; href: string };
  secondaryAction?: { label: string; href: string };
  variant?: "default" | "success" | "warning";
};

const VARIANTS = {
  default: "border-slate-200 bg-slate-50/80",
  success: "border-emerald-200 bg-emerald-50/80",
  warning: "border-amber-200 bg-amber-50/80",
};

/** Educates, reassures, or guides — never leaves dead space */
export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
  variant = "default",
}: Props) {
  return (
    <div className={`rounded-2xl border p-8 text-center ${VARIANTS[variant]}`}>
      {icon && <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">{icon}</div>}
      <h3 className="text-lg font-bold text-neercred-navy">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-slate-600">{description}</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {action && (
          <Link href={action.href} className="neercred-btn inline-flex px-6 py-3 text-sm">
            {action.label}
          </Link>
        )}
        {secondaryAction && (
          <Link
            href={secondaryAction.href}
            className="inline-flex rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            {secondaryAction.label}
          </Link>
        )}
      </div>
    </div>
  );
}
