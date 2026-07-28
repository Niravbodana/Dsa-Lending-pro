import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { InnerHero } from "@/components/InnerHero";
import { BRAND } from "@/lib/brand";

export const metadata = { title: `Help Center | ${BRAND.name}` };

const categories = [
  {
    title: "Applying for a Loan",
    articles: [
      { q: "Who can apply?", a: "Indian residents aged 18+ with a minimum monthly income of ₹15,000." },
      { q: "How long does it take?", a: "Eligibility: 2–5 minutes. Approval: same day possible." },
      { q: "What documents are needed?", a: "PAN, Aadhaar, and bank details — all digital." },
    ],
  },
  {
    title: "KYC & Verification",
    articles: [
      { q: "Is Aadhaar OTP safe?", a: "Yes. UIDAI-authorized flow with encrypted data." },
      { q: "What is penny drop?", a: "We send ₹1 to your account to verify it, then reverse the transaction." },
      { q: "Is eSign legally valid?", a: "Yes. Valid under the IT Act, 2000." },
    ],
  },
  {
    title: "EMI & Repayment",
    articles: [
      { q: "When does EMI start?", a: "From the month after disbursal, per lender rules." },
      { q: "Is prepayment possible?", a: "Yes. Many lenders offer zero foreclosure charges." },
      { q: "What if I miss an EMI?", a: "The lender may charge a late fee. Contact them directly." },
    ],
  },
  {
    title: "Account & Tracking",
    articles: [
      { q: "How do I track my application?", a: "Use /track with your ref number and mobile." },
      { q: "How do I log in to the dashboard?", a: "Visit /dashboard and log in with mobile OTP." },
      { q: "How do I delete my data?", a: "Email dpo@neerloansolutions.com with your request." },
    ],
  },
];

export default function HelpPage() {
  return (
    <PageShell>
      <InnerHero
        badge="HELP CENTER"
        title="How Can We Help?"
        subtitle="Answers to common questions about loans, KYC, EMI, and tracking."
        image="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&h=600&fit=crop"
      />
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="mb-8 flex flex-wrap gap-3">
          <Link href="/apply" className="rounded-full bg-teal-600 px-5 py-2 text-sm font-bold text-white">
            Apply Now
          </Link>
          <Link href="/track" className="rounded-full border px-5 py-2 text-sm font-semibold text-slate-600">
            Track Loan
          </Link>
          <Link href="/contact" className="rounded-full border px-5 py-2 text-sm font-semibold text-slate-600">
            Contact Support
          </Link>
          <Link href="/compliance" className="rounded-full border px-5 py-2 text-sm font-semibold text-slate-600">
            Compliance
          </Link>
        </div>

        <div className="space-y-8">
          {categories.map((cat) => (
            <div key={cat.title} className="rounded-2xl bg-white p-6 shadow">
              <h2 className="text-lg font-black text-teal-700">{cat.title}</h2>
              <div className="mt-4 space-y-4">
                {cat.articles.map((a) => (
                  <div key={a.q} className="border-l-4 border-teal-200 pl-4">
                    <p className="font-semibold text-slate-900">{a.q}</p>
                    <p className="mt-1 text-sm text-slate-500">{a.a}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-teal-50 p-8 text-center">
          <p className="font-bold text-teal-800">Still need help?</p>
          <p className="mt-2 text-sm text-teal-600">
            Call {BRAND.phone} or email {BRAND.email}
          </p>
        </div>
      </div>
    </PageShell>
  );
}
