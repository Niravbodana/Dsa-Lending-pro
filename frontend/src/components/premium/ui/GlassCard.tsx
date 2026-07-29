import { type ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
  dark?: boolean;
};

export function GlassCard({ children, className = "", dark = false }: Props) {
  return (
    <div
      className={`rounded-2xl border backdrop-blur-xl ${
        dark
          ? "border-white/10 bg-white/[0.06] shadow-[0_8px_32px_rgba(0,0,0,0.35)]"
          : "border-slate-200/80 bg-white/80 shadow-[0_8px_40px_rgba(15,23,42,0.08)]"
      } ${className}`}
    >
      {children}
    </div>
  );
}
