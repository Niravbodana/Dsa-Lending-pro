import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "gold";

const STYLES: Record<Variant, string> = {
  primary: "neercred-btn text-white",
  secondary: "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
  ghost: "text-neercred-teal hover:bg-teal-50",
  gold: "bg-gradient-to-r from-neercred-gold to-amber-500 text-neercred-navy hover:brightness-110",
};

type Props = {
  children: ReactNode;
  variant?: Variant;
  href?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
};

export function Button({
  children,
  variant = "primary",
  href,
  type = "button",
  disabled,
  className = "",
  onClick,
}: Props) {
  const base = `inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-bold transition disabled:opacity-50 ${STYLES[variant]} ${className}`;

  if (href) {
    return (
      <Link href={href} className={base}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} disabled={disabled} onClick={onClick} className={base}>
      {children}
    </button>
  );
}
