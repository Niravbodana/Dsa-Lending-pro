import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { InnerHero } from "@/components/InnerHero";
import { FinancialProductCard } from "@/components/FinancialProductCard";
import { InstitutionalTrustRow } from "@/components/ui/InstitutionalTrustRow";
import { BRAND } from "@/lib/brand";
import { INDIAN_IMAGES } from "@/lib/indian-images";

export const metadata = { title: `Loan Products | ${BRAND.name}` };

const products = [
  {
    slug: "personal",
    title: "Personal Loan",
    amount: "₹50K – ₹5L",
    rate: "10.99% onwards",
    desc: "Flexible funds for life's plans — weddings, travel, or unexpected expenses.",
    features: ["Instant eligibility check", "No collateral required", "Flexible tenure up to 60 months"],
    image: INDIAN_IMAGES.loans.personal,
    audience: "Salaried & self-employed",
    speed: "24–48 hr disbursal",
    docs: "PAN + income proof",
    accent: "from-slate-900/90",
  },
  {
    slug: "medical",
    title: "Medical Emergency Loan",
    amount: "₹1L – ₹5L",
    rate: "11.49% onwards",
    desc: "When health can't wait — priority processing for medical emergencies.",
    features: ["Same-day approval possible", "Minimal documentation", "Hospital bill support"],
    image: INDIAN_IMAGES.loans.medical,
    audience: "Emergency healthcare",
    speed: "Same-day possible",
    docs: "PAN + medical bills",
    accent: "from-rose-900/85",
  },
  {
    slug: "wedding",
    title: "Wedding Loan",
    amount: "₹2L – ₹5L",
    rate: "11.99% onwards",
    desc: "Celebrate your big day without financial stress — plan with confidence.",
    features: ["High loan amounts", "Long tenure options", "Special festive rates"],
    image: INDIAN_IMAGES.loans.wedding,
    audience: "Couples & families",
    speed: "3–5 business days",
    docs: "PAN + income proof",
    accent: "from-amber-900/85",
  },
  {
    slug: "business",
    title: "Business Loan",
    amount: "₹1L – ₹5L",
    rate: "12.49% onwards",
    desc: "Working capital to grow your business — inventory, equipment, or expansion.",
    features: ["Self-employed friendly", "Quick approval", "No property collateral"],
    image: INDIAN_IMAGES.loans.business,
    audience: "Entrepreneurs & SMEs",
    speed: "2–4 business days",
    docs: "PAN + business proof",
    accent: "from-indigo-900/85",
  },
  {
    slug: "education",
    title: "Education Loan",
    amount: "₹50K – ₹3L",
    rate: "11.25% onwards",
    desc: "Invest in education goals with repayment that fits your future income.",
    features: ["Student-friendly terms", "Moratorium options", "Low EMI structures"],
    image: INDIAN_IMAGES.loans.education,
    audience: "Students & parents",
    speed: "3–5 business days",
    docs: "PAN + admission proof",
    accent: "from-cyan-900/85",
  },
  {
    slug: "travel",
    title: "Travel Loan",
    amount: "₹50K – ₹2L",
    rate: "12.99% onwards",
    desc: "Your dream vacation — spread the cost with easy, predictable EMIs.",
    features: ["100% digital process", "No advance payment", "Quick disbursal"],
    image: INDIAN_IMAGES.loans.travel,
    audience: "Travel planners",
    speed: "24–48 hr disbursal",
    docs: "PAN + income proof",
    accent: "from-teal-900/85",
  },
];

export default function LoansPage() {
  return (
    <PageShell>
      <InnerHero
        badge="LOAN PRODUCTS"
        title="Every loan type. One trusted marketplace."
        subtitle="Compare offers from RBI-regulated lenders — choose wisely, borrow confidently."
        cta={{ label: "Check eligibility →", href: "/apply" }}
        image={INDIAN_IMAGES.pages.loansBanner}
      />

      <div className="border-b border-slate-100 bg-white py-6">
        <div className="mx-auto max-w-6xl px-4">
          <InstitutionalTrustRow />
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 max-w-2xl">
          <h2 className="text-2xl font-bold text-neercred-navy">Find the right loan for your goal</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            Each product is designed for a specific need. We compare partner lenders so you get the best fit — not just the fastest approval.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <FinancialProductCard key={p.slug} product={p} />
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-teal-100 bg-gradient-to-r from-teal-50 to-cyan-50/50 p-8 text-center">
          <p className="text-lg font-bold text-neercred-navy">Not sure which loan fits?</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            Start with a quick eligibility check — Neera, your financial guide, will help you through every step.
          </p>
          <Link href="/apply" className="neercred-btn mt-6 inline-flex px-8 py-3.5 text-sm">
            Start eligibility check →
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
