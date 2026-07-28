import { PageShell } from "@/components/PageShell";
import { InnerHero } from "@/components/InnerHero";
import { BRAND } from "@/lib/brand";
import { INDIAN_IMAGES } from "@/lib/indian-images";
import { IconTarget, IconChart, IconShield, IconBolt } from "@/components/icons";

export const metadata = { title: `About Us | ${BRAND.name}` };

export default function AboutPage() {
  const milestones = [
    { year: "2024", title: "Founded", desc: "Neer Loan Solutions started with one mission — making loans simple." },
    { year: "2025", title: "15+ Partners", desc: "Partnerships with HDFC, ICICI, Bajaj and top NBFCs." },
    { year: "2026", title: "50K+ Users", desc: "50,000+ Indians have taken loans through Neer." },
  ];

  const values = [
    { title: "Transparency", desc: "No hidden charges. Everything is clear upfront.", Icon: IconTarget },
    { title: "Speed", desc: "Eligibility in 5 minutes. Same-day approval possible.", Icon: IconBolt },
    { title: "Security", desc: "Bank-grade encryption. DPDP Act compliant.", Icon: IconShield },
    { title: "Trust", desc: "Full compliance with RBI LSP guidelines.", Icon: IconChart },
  ];

  return (
    <PageShell>
      <InnerHero
        badge="OUR STORY"
        title="About Neer Loan Solutions"
        subtitle="India's premium loan marketplace — personalized offers and a transparent process built for you."
        cta={{ label: "Apply for Loan", href: "/apply" }}
        image={INDIAN_IMAGES.pages.about}
      />
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-3xl bg-white p-8 shadow-lg md:p-12">
          <h2 className="text-2xl font-black text-slate-900">Who We Are</h2>
          <p className="mt-4 leading-relaxed text-slate-600">
            <strong>{BRAND.name}</strong> is a Loan Service Provider (LSP) that connects borrowers with
            India&apos;s best banks and NBFCs. We do not lend directly — we guide you to the right lender
            at the best rate with minimum paperwork.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {milestones.map((m) => (
            <div key={m.year} className="rounded-2xl border border-slate-100 bg-white p-6 shadow">
              <span className="text-3xl font-black text-teal-600">{m.year}</span>
              <h3 className="mt-2 font-bold text-slate-900">{m.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{m.desc}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-16 text-center text-2xl font-black">Why {BRAND.shortName}?</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {values.map((v) => (
            <div key={v.title} className="flex gap-4 rounded-2xl bg-white p-6 shadow">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <v.Icon size={22} />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{v.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageShell>
  );
}
