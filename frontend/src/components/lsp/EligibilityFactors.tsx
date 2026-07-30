import { IconCheckCircle, IconShield } from "@/components/icons";

export function EligibilityFactors({
  score,
  maxAmount,
  factors,
  message,
}: {
  score: number;
  maxAmount: number;
  factors: string[];
  message?: string;
}) {
  return (
    <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50/90 to-teal-50/50 p-5">
      <p className="flex items-center gap-2 font-semibold text-emerald-900">
        <IconCheckCircle size={18} />
        Eligibility assessment complete
      </p>
      <p className="mt-2 text-sm text-emerald-800">
        Match score <strong>{score}/100</strong> · Up to{" "}
        <strong>₹{maxAmount.toLocaleString("en-IN")}</strong> from partner lenders
      </p>
      {message && <p className="mt-1 text-xs text-emerald-700">{message}</p>}
      {factors.length > 0 && (
        <ul className="mt-4 space-y-2">
          {factors.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-slate-700">
              <IconShield size={14} className="mt-0.5 shrink-0 text-neercred-teal" />
              {f}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-[11px] text-slate-500">
        Includes credit bureau check (with your consent). Final approval is by the lender.
      </p>
    </div>
  );
}
