import Link from "next/link";
import { IconArrowRight, IconShield, IconSparkles } from "@/components/icons";

type Props = {
  continueHref: string;
  continueLabel: string;
  activeApplications: number;
  pendingOffers: number;
  userName: string;
};

/** Financial command center — what needs attention right now */
export function NextActionCard({
  continueHref,
  continueLabel,
  activeApplications,
  pendingOffers,
  userName,
}: Props) {
  let headline = `Welcome back, ${userName}`;
  let body = "Pick up where you left off — your progress is saved securely.";
  let cta = continueLabel;

  if (pendingOffers > 0) {
    headline = `${pendingOffers} pre-approved offer${pendingOffers > 1 ? "s" : ""} waiting`;
    body = "Compare rates side-by-side and choose with confidence. No pressure — you decide.";
    cta = "Review offers";
  } else if (activeApplications > 0) {
    headline = "Your application needs attention";
    body = "Complete verification to move closer to disbursal. Most customers finish in under 10 minutes.";
    cta = continueLabel;
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-teal-100 bg-gradient-to-br from-white via-teal-50/30 to-cyan-50/40 p-6 shadow-neercred">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-xl">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-neercred-teal">
            <IconSparkles size={14} />
            Your next step
          </p>
          <h2 className="mt-2 text-xl font-bold text-neercred-navy">{headline}</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">{body}</p>
          <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <IconShield size={12} />
            RBI-registered LSP · Regulated partner lenders only
          </p>
        </div>
        <Link
          href={continueHref}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-neercred-teal px-6 py-3.5 text-sm font-bold text-white shadow-md hover:brightness-110"
        >
          {cta}
          <IconArrowRight size={16} />
        </Link>
      </div>
    </section>
  );
}
