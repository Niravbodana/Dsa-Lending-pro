"use client";

import { IconArrowRight, IconShield } from "@/components/icons";

type Props = {
  title: string;
  subtitle: string;
  stepLabel?: string;
  progressPercent?: number;
  trustNote?: string;
};

/** Answers: Where am I? What am I doing? What happens next? */
export function JourneyStepHeader({
  title,
  subtitle,
  stepLabel,
  progressPercent,
  trustNote = "Your data is encrypted · RBI LSP registered marketplace",
}: Props) {
  return (
    <div className="mb-6">
      {stepLabel && (
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-neercred-teal">{stepLabel}</p>
      )}
      <h1 className="mt-2 text-2xl font-bold tracking-tight text-neercred-navy sm:text-3xl">{title}</h1>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-600">{subtitle}</p>
      {typeof progressPercent === "number" && (
        <div className="mt-4">
          <div className="mb-1.5 flex justify-between text-[11px] font-medium text-slate-500">
            <span>Your progress</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-neercred-teal to-cyan-500 transition-all duration-700 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
      <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-400">
        <IconShield size={12} />
        {trustNote}
        <IconArrowRight size={10} className="opacity-40" aria-hidden />
        <span>Next: we save your progress automatically</span>
      </p>
    </div>
  );
}
