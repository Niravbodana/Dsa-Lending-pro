import { PageShell } from "@/components/PageShell";
import { InnerHero } from "@/components/InnerHero";
import { BRAND } from "@/lib/brand";
import { INDIAN_IMAGES } from "@/lib/indian-images";

export const metadata = { title: `Refer & Earn | ${BRAND.name}` };

export default function ReferPage() {
  const steps = [
    { num: "1", title: "Share Your Link", desc: "Send your unique referral link to friends." },
    { num: "2", title: "Friend Applies", desc: "They complete the loan application on Neer." },
    { num: "3", title: "Loan Disbursed", desc: "Their loan gets approved and disbursed." },
    { num: "4", title: "You Earn ₹2,000!", desc: "Cashback credited directly to your bank account." },
  ];

  return (
    <PageShell>
      <InnerHero
        badge="REFER & EARN"
        title="Refer Friends, Earn ₹2,000"
        subtitle="Earn ₹2,000 for every successful disbursal when you refer friends to Neer Loan Solutions."
        cta={{ label: "Start Referring →", href: "/apply" }}
        image={INDIAN_IMAGES.pages.refer}
      />
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {steps.map((s) => (
            <div key={s.num} className="rounded-2xl bg-white p-6 shadow-lg">
              <span className="text-3xl font-black text-teal-600">{s.num}</span>
              <h3 className="mt-2 text-lg font-bold text-slate-900">{s.title}</h3>
              <p className="mt-2 text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
