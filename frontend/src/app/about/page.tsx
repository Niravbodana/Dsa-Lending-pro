import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { InnerHero } from "@/components/InnerHero";
import { FounderProfile } from "@/components/FounderProfile";
import { ScrollReveal, ScrollRevealAlternate } from "@/components/ScrollReveal";
import { BRAND } from "@/lib/brand";
import { INDIAN_IMAGES } from "@/lib/indian-images";
import { IconTarget, IconChart, IconShield, IconBolt } from "@/components/icons";

export const metadata = { title: `About Us | ${BRAND.name}` };

export default function AboutPage() {
  const milestones = [
    { year: "2019", title: "Neer Journey Begins", desc: "Sunny Bodana starts building customer-first financial services in India." },
    { year: "2024", title: "Neer Loan Solutions", desc: "Premium LSP marketplace launched — compare offers from regulated lenders." },
    { year: "2026", title: "50K+ Customers", desc: "Tens of thousands of Indians guided to the right loan with transparency." },
  ];

  const values = [
    { title: "Transparency", desc: "No hidden charges. Every fee and rate shown upfront.", Icon: IconTarget },
    { title: "Speed", desc: "Eligibility in minutes. Same-day approval possible with partners.", Icon: IconBolt },
    { title: "Security", desc: "Bank-grade encryption. DPDP Act 2023 compliant.", Icon: IconShield },
    { title: "Trust", desc: "RBI LSP guidelines followed end-to-end.", Icon: IconChart },
  ];

  return (
    <PageShell>
      <InnerHero
        badge="OUR STORY"
        title="About Neer Loan Solutions"
        subtitle="India's premium loan marketplace — founded by Sunny Bodana to make borrowing simple, transparent, and digital."
        cta={{ label: "Apply for Loan", href: "/apply" }}
        image={INDIAN_IMAGES.pages.about}
      />

      <FounderProfile />

      <div className="mx-auto max-w-6xl px-4 pb-20">
        <ScrollReveal variant="up">
          <div className="rounded-3xl bg-white p-8 shadow-lg md:p-12">
            <h2 className="text-2xl font-black text-slate-900">Who We Are</h2>
            <p className="mt-4 leading-relaxed text-slate-600">
              <strong>{BRAND.name}</strong> is a Loan Service Provider (LSP) registered under RBI guidelines. We do
              not lend directly — we connect you with India&apos;s best banks and NBFCs, help you compare offers
              side-by-side, and guide you through digital KYC to disbursal.
            </p>
            <p className="mt-4 leading-relaxed text-slate-600">
              Our mission is simple: <strong>Dream Big. Borrow Smart.</strong> Whether it&apos;s a wedding, medical
              need, home renovation, or business growth — you deserve clarity, choice, and a premium experience.
            </p>
          </div>
        </ScrollReveal>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {milestones.map((m, i) => (
            <ScrollRevealAlternate key={m.year} index={i} delay={i * 80}>
              <div className="h-full rounded-2xl border border-slate-100 bg-white p-6 shadow">
                <span className="text-3xl font-black text-teal-600">{m.year}</span>
                <h3 className="mt-2 font-bold text-slate-900">{m.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{m.desc}</p>
              </div>
            </ScrollRevealAlternate>
          ))}
        </div>

        <ScrollReveal variant="up" className="mt-16 text-center">
          <h2 className="text-2xl font-black text-slate-900">Why {BRAND.shortName}?</h2>
        </ScrollReveal>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {values.map((v, i) => (
            <ScrollRevealAlternate key={v.title} index={i} delay={i * 70}>
              <div className="flex gap-4 rounded-2xl bg-white p-6 shadow">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <v.Icon size={22} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">{v.title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{v.desc}</p>
                </div>
              </div>
            </ScrollRevealAlternate>
          ))}
        </div>

        <ScrollReveal variant="up" className="mt-16 text-center">
          <div className="rounded-3xl bg-gradient-to-r from-teal-700 to-cyan-800 px-6 py-12 text-white shadow-xl">
            <h2 className="text-2xl font-black md:text-3xl">Ready to compare your best loan offers?</h2>
            <p className="mx-auto mt-3 max-w-xl text-teal-100">
              Join thousands of Indians who trust {BRAND.shortName} for a transparent, digital borrowing journey.
            </p>
            <Link
              href="/apply"
              className="mt-8 inline-block rounded-2xl bg-amber-400 px-8 py-4 font-extrabold text-slate-900 shadow-lg transition hover:brightness-110"
            >
              Check Eligibility — Free
            </Link>
          </div>
        </ScrollReveal>
      </div>
    </PageShell>
  );
}
