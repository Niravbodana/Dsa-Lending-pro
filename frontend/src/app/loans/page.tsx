import Link from "next/link";
import Image from "next/image";
import { PageShell } from "@/components/PageShell";
import { InnerHero } from "@/components/InnerHero";
import { BRAND } from "@/lib/brand";

export const metadata = { title: `Loan Products | ${BRAND.name}` };

const products = [
  {
    slug: "personal",
    title: "Personal Loan",
    amount: "₹50K – ₹5L",
    rate: "10.99% onwards",
    desc: "For any personal need — no questions asked.",
    features: ["Instant eligibility", "No collateral", "Flexible tenure"],
    image: "https://images.unsplash.com/photo-1554224311-0fb870a1d0ef?w=600&h=360&fit=crop",
  },
  {
    slug: "medical",
    title: "Medical Emergency Loan",
    amount: "₹1L – ₹5L",
    rate: "11.49% onwards",
    desc: "Medical emergency? Same-day approval possible.",
    features: ["Fast disbursal", "Minimal docs", "Priority processing"],
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=360&fit=crop",
  },
  {
    slug: "wedding",
    title: "Wedding Loan",
    amount: "₹2L – ₹5L",
    rate: "11.99% onwards",
    desc: "Make your dream wedding stress-free on budget.",
    features: ["High loan amount", "Long tenure", "Special rates"],
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=360&fit=crop",
  },
  {
    slug: "business",
    title: "Business Loan",
    amount: "₹1L – ₹5L",
    rate: "12.49% onwards",
    desc: "Grow your business with working capital financing.",
    features: ["Self-employed friendly", "Quick approval", "No property needed"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=360&fit=crop",
  },
  {
    slug: "education",
    title: "Education Loan",
    amount: "₹50K – ₹3L",
    rate: "11.25% onwards",
    desc: "Fund your education goals with flexible repayment.",
    features: ["Student friendly", "Moratorium option", "Low EMI"],
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=600&h=360&fit=crop",
  },
  {
    slug: "travel",
    title: "Travel Loan",
    amount: "₹50K – ₹2L",
    rate: "12.99% onwards",
    desc: "Your dream vacation — now possible with easy EMIs.",
    features: ["Quick process", "No advance", "Digital only"],
    image: "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=360&fit=crop",
  },
];

export default function LoansPage() {
  return (
    <PageShell>
      <InnerHero
        badge="LOAN PRODUCTS"
        title="All Loan Types, One Platform"
        subtitle="Every loan type on one platform — compare offers and choose the best."
        cta={{ label: "Check Eligibility →", href: "/apply" }}
        image="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&h=600&fit=crop"
      />
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <div
              key={p.slug}
              className="overflow-hidden rounded-3xl bg-white shadow-lg transition hover:-translate-y-2 hover:shadow-2xl"
            >
              <div className="relative h-44">
                <Image src={p.image} alt={p.title} fill className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h2 className="text-xl font-black">{p.title}</h2>
                  <p className="text-sm text-white/80">{p.amount}</p>
                </div>
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
