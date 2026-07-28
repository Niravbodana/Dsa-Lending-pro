import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { InnerHero } from "@/components/InnerHero";
import { BRAND } from "@/lib/brand";

export const metadata = { title: `Help Center | ${BRAND.name}` };

const categories = [
  {
    title: "Applying for Loan",
    articles: [
      { q: "Kaun apply kar sakta hai?", a: "18+ Indian resident with min ₹15,000 monthly income." },
      { q: "Kitna time lagta hai?", a: "Eligibility 2-5 min. Approval same day possible." },
      { q: "Kya documents chahiye?", a: "PAN, Aadhaar, bank details — sab digital." },
    ],
  },
  {
    title: "KYC & Verification",
    articles: [
      { q: "Aadhaar OTP safe hai?", a: "Haan, UIDAI authorized flow. Data encrypted." },
      { q: "Penny drop kya hai?", a: "₹1 aapke account mein bhej ke verify karte hain, phir reverse." },
      { q: "eSign valid hai?", a: "Haan, IT Act 2000 ke under legally valid." },
    ],
  },
  {
    title: "EMI & Repayment",
    articles: [
      { q: "EMI kab start hoti hai?", a: "Disbursal ke next month se, lender ke rules ke hisaab se." },
      { q: "Prepayment possible?", a: "Haan, kai lenders zero foreclosure charge dete hain." },
      { q: "EMI miss ho jaye to?", a: "Lender late fee charge karega. Contact lender directly." },
    ],
  },
  {
    title: "Account & Tracking",
    articles: [
      { q: "Application kaise track karun?", a: "/track page pe ref + mobile daalo." },
      { q: "Dashboard kaise login karun?", a: "/dashboard pe mobile OTP se login." },
      { q: "Data delete kaise karun?", a: "dpo@neerloansolutions.com pe email karo." },
    ],
  },
];

export default function HelpPage() {
  return (
    <PageShell>
      <InnerHero
        badge="HELP CENTER"
        title="Kaise Madad Kar Sakte Hain?"
        subtitle="MoneyView Help Center jaisa — saare common sawalon ke jawab."
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
