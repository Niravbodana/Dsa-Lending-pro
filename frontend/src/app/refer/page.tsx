import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { InnerHero } from "@/components/InnerHero";
import { BRAND } from "@/lib/brand";

export const metadata = { title: `Refer & Earn | ${BRAND.name}` };

export default function ReferPage() {
  const steps = [
    { num: "1", title: "Share Link", desc: "Apna unique referral link friends & family ko bhejo." },
    { num: "2", title: "Friend Applies", desc: "Wo Neer Loan Solutions se loan apply kare." },
    { num: "3", title: "Loan Disbursed", desc: "Jab unka loan disbursed ho..." },
    { num: "4", title: "You Earn ₹2,000!", desc: "Seedha aapke bank account mein cashback." },
  ];

  return (
    <PageShell>
      <InnerHero
        badge="REFER & EARN"
        title="Dosto Ko Refer Karo, ₹2,000 Kamao"
        subtitle="Har successful disbursal pe ₹2,000 — apne dosto ko Neer Loan Solutions se connect karo."
        cta={{ label: "Start Referring →", href: "/apply" }}
      />
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-4">
          {steps.map((s) => (
            <div key={s.num} className="text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-600 text-xl font-black text-white">
                {s.num}
              </div>
              <h3 className="mt-4 font-bold">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-3xl bg-gradient-to-br from-amber-400 to-amber-500 p-8 text-center text-slate-900 shadow-xl">
          <p className="text-5xl font-black">₹2,000</p>
          <p className="mt-2 text-lg font-bold">per successful referral</p>
          <p className="mt-4 text-sm opacity-80">No limit on referrals. Unlimited earning potential!</p>
          <Link
            href="/dashboard"
            className="mt-6 inline-block rounded-xl bg-slate-900 px-8 py-3 font-bold text-white"
          >
            Get Referral Link from Dashboard →
          </Link>
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          *T&C apply. Referral bonus credited within 7 working days of disbursal.
        </p>
      </div>
    </PageShell>
  );
}
