"use client";

export type WorkflowStep = { id: string; label: string; phase: string };

const PHASE_COLORS: Record<string, string> = {
  apply: "bg-teal-500",
  kyc: "bg-violet-500",
  lender: "bg-amber-500",
};

type Props = {
  steps: WorkflowStep[];
  currentStepId: string;
  compact?: boolean;
};

export function JourneyWorkflow({ steps, currentStepId, compact }: Props) {
  const currentIdx = steps.findIndex((s) => s.id === currentStepId);

  if (compact) {
    const current = steps[currentIdx] ?? steps[0];
    return (
      <div className="rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-2 text-[10px] font-semibold text-slate-500">
          <span>
            Step {currentIdx + 1}/{steps.length}
          </span>
          <span className="text-neercred-teal">{current?.label}</span>
        </div>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-gradient-to-r from-neercred-teal to-neercred-cyan transition-all"
            style={{ width: `${((currentIdx + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex min-w-max items-center gap-0">
        {steps.map((step, i) => {
          const done = i < currentIdx;
          const active = i === currentIdx;
          const color = PHASE_COLORS[step.phase] ?? "bg-slate-400";
          return (
            <div key={step.id} className="flex items-center">
              <div className="flex flex-col items-center px-1">
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition-all ${
                    done
                      ? `${color} text-white`
                      : active
                        ? "ring-2 ring-offset-2 ring-neercred-teal bg-white text-neercred-teal"
                        : "bg-slate-200 text-slate-400"
                  }`}
                >
                  {done ? "✓" : i + 1}
                </div>
                <span
                  className={`mt-1 max-w-[52px] truncate text-center text-[9px] font-medium ${
                    active ? "text-neercred-teal" : "text-slate-400"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div
                  className={`mb-4 h-0.5 w-4 sm:w-6 ${i < currentIdx ? color : "bg-slate-200"}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
