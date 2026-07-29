"use client";

import {
  IconBolt,
  IconChart,
  IconCheckCircle,
  IconLock,
  IconRupee,
  IconShield,
  IconStar,
  IconUsers,
} from "@/components/icons";

const STATS = [
  { value: "₹100+ Cr", label: "Loans Disbursed", Icon: IconRupee, color: "bg-rose-50 text-rose-500" },
  { value: "50,000+", label: "Happy Customers", Icon: IconUsers, color: "bg-blue-50 text-blue-500" },
  { value: "25+", label: "RBI-Registered Partners", Icon: IconShield, color: "bg-violet-50 text-violet-500" },
  { value: "4.8 ★", label: "Customer Rating", Icon: IconStar, color: "bg-amber-50 text-amber-500" },
  { value: "100%", label: "Digital Process", Icon: IconBolt, color: "bg-emerald-50 text-emerald-600" },
];

const FEATURES = [
  { label: "No Hidden Charges", Icon: IconCheckCircle },
  { label: "Flexible Tenure Options", Icon: IconChart },
  { label: "Minimal Documentation", Icon: IconLock },
  { label: "End-to-End Digital Journey", Icon: IconBolt },
];

/** Trust stats card + bottom feature bar (reference layout, no partner logos) */
export function HeroTrustBand() {
  return (
    <section className="bg-white pb-2 pt-2">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-3xl border border-slate-100 bg-white px-4 py-10 shadow-[0_20px_50px_-24px_rgba(15,23,42,0.18)] md:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <span
                  className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${s.color}`}
                >
                  <s.Icon size={22} />
                </span>
                <p className="mt-3 text-xl font-extrabold text-slate-900 md:text-2xl">{s.value}</p>
                <p className="mt-1 text-xs font-medium text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-7xl flex-wrap items-center justify-center gap-x-10 gap-y-3 border-t border-slate-100 px-4 py-5 text-xs font-semibold text-slate-600 md:text-sm">
        {FEATURES.map((f) => (
          <span key={f.label} className="flex items-center gap-2">
            <f.Icon size={16} className="text-[#00796B]" />
            {f.label}
          </span>
        ))}
      </div>
    </section>
  );
}
