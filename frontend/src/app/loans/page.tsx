import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { InnerHero } from "@/components/InnerHero";
import { BRAND } from "@/lib/brand";

export const metadata = { title: `Loan Products | ${BRAND.name}` };

const products = [
  {
    slug: "personal",
    icon: "💰",
    title: "Personal Loan",
    amount: "₹50K – ₹5L",
    rate: "10.99% onwards",
    desc: "Kisi bhi personal need ke liye — no questions asked.",
    features: ["Instant eligibility", "No collateral", "Flexible tenure"],
    color: "from-teal-500 to-cyan-600",
  },
  {
    slug: "medical",
    icon: "🏥",
    title: "Medical Emergency Loan",
    amount: "₹1L – ₹5L",
    rate: "11.49% onwards",
    desc: "Medical emergency? Same-day approval possible.",
    features: ["Fast disbursal", "Minimal docs", "Priority processing"],
    color: "from-red-500 to-rose-600",
  },
  {
    slug: "wedding",
    icon: "💍",
    title: "Wedding Loan",
    amount: "₹2L – ₹5L",
    rate: "11.99% onwards",
    desc: "Sapno ki shaadi — budget tension free.",
    features: ["High loan amount", "Long tenure", "Special rates"],
    color: "from-pink-500 to-purple-600",
  },
  {
    slug: "business",
    icon: "📈",
    title: "Business Loan",
    amount: "₹1L – ₹5L",
    rate: "12.49% onwards",
    desc: "Business grow karo — working capital ke liye.",
    features: ["Self-employed friendly", "Quick approval", "No property needed"],
    color: "from-amber-500 to-orange-600",
  },
  {
    slug: "education",
    icon: "🎓",
    title: "Education Loan",
    amount: "₹50K – ₹3L",
    rate: "11.25% onwards",
    desc: "Padhai ke sapne poore karo.",
    features: ["Student friendly", "Moratorium option", "Low EMI"],
    color: "from-blue-500 to-indigo-600",
  },
  {
    slug: "travel",
    icon: "✈️",
    title: "Travel Loan",
    amount: "₹50K – ₹2L",
    rate: "12.99% onwards",
    desc: "Dream vacation — ab EMI mein possible.",
    features: ["Quick process", "No advance", "Digital only"],
    color: "from-sky-500 to-blue-600",
  },
];

export default function LoansPage() {
  return (
    <PageShell>
      <InnerHero
        badge="LOAN PRODUCTS"
        title="Saari Loan Types, Ek Platform"
        subtitle="MoneyView & Navi jaisa — compare karo, best offer choose karo."
        cta={{ label: "Check Eligibility →", href: "/apply" }}
      />
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <div
              key={p.slug}
              className="overflow-hidden rounded-3xl bg-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className={`bg-gradient-to-br ${p.color} p-6 text-white`}>
                <span className="text-4xl">{p.icon}</span>
                <h2 className="mt-4 text-xl font-black">{p.title}</h2>
                <p className="mt-1 text-sm text-white/80">{p.amount}</p>
              </div>
              <div className="p-6">
                <p className="text-slate-600">{p.desc}</p>
                <p className="mt-3 font-bold text-teal-600">From {p.rate}</p>
                <ul className="mt-4 space-y-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-500">
                      <span className="text-teal-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/apply"
                  className="mt-6 block rounded-xl bg-slate-900 py-3 text-center font-bold text-white hover:bg-slate-800"
                >
                  Apply Now →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
