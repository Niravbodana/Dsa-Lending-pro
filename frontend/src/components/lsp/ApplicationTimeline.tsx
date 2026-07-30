import { IconClock } from "@/components/icons";

const STATUS_ETA: Record<string, { label: string; eta: string }> = {
  offer_selected: { label: "Offer selected", eta: "Complete KYC — ~10 min" },
  kyc_pending: { label: "KYC in progress", eta: "Finish verification — ~10 min" },
  kyc_completed: { label: "KYC complete", eta: "Submit to lender — 1 min" },
  partner_handoff: { label: "Partner application", eta: "Continue on lender site — ~15 min" },
  submitted: { label: "Submitted to lender", eta: "Review — 1–3 business days" },
  under_review: { label: "Under review", eta: "Decision — 24–48 hours" },
  approved: { label: "Approved", eta: "Disbursal — 1–2 business days" },
  disbursed: { label: "Disbursed", eta: "Funds in your account" },
  rejected: { label: "Not approved", eta: "Explore other offers" },
  cancelled: { label: "Cancelled", eta: "Cooling-off exercised" },
};

export function ApplicationTimeline({
  status,
  lenderName,
  applicationRef,
}: {
  status: string;
  lenderName: string;
  applicationRef: string;
}) {
  const info = STATUS_ETA[status] || { label: status.replace(/_/g, " "), eta: "We'll update you soon" };

  return (
    <div className="rounded-xl border border-teal-100 bg-teal-50/50 px-4 py-3">
      <div className="flex items-start gap-3">
        <IconClock size={18} className="mt-0.5 shrink-0 text-neercred-teal" />
        <div>
          <p className="text-sm font-semibold text-neercred-navy">{info.label}</p>
          <p className="text-xs text-slate-600">
            {lenderName} · <span className="font-mono">{applicationRef}</span>
          </p>
          <p className="mt-1 text-xs font-medium text-neercred-teal">Next: {info.eta}</p>
        </div>
      </div>
    </div>
  );
}
