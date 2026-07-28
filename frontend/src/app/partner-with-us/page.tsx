import { PageShell } from "@/components/PageShell";
import { InnerHero } from "@/components/InnerHero";
import { BRAND } from "@/lib/brand";

export const metadata = { title: `Partner With Us | ${BRAND.name}` };

export default function PartnerPage() {
  const benefits = [
    { icon: "📊", title: "Quality Leads", desc: "Pre-verified, eligible customers ready to convert." },
    { icon: "🔗", title: "API Integration", desc: "REST API for real-time offer fetch & status webhooks." },
    { icon: "💰", title: "Commission Model", desc: "Pay only on disbursal — no upfront cost." },
    { icon: "📱", title: "Digital First", desc: "100% paperless KYC flow for your customers." },
  ];

  return (
    <PageShell>
      <InnerHero
        badge="FOR LENDERS & DSA"
        title="Partner With Neer Loan Solutions"
        subtitle="Banks, NBFCs, and DSA agents — grow together with Neer Loan Solutions."
        cta={{ label: "Contact Partnership Team →", href: "/contact" }}
      />
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {benefits.map((b) => (
            <div key={b.title} className="rounded-2xl bg-white p-8 shadow-lg">
              <span className="text-3xl">{b.icon}</span>
              <h3 className="mt-4 text-xl font-bold">{b.title}</h3>
              <p className="mt-2 text-slate-500">{b.desc}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-3xl bg-slate-900 p-8 text-white md:p-12">
          <h2 className="text-2xl font-black">API Integration Ready</h2>
          <p className="mt-4 text-slate-300">
            Partner lenders can integrate via REST API for offer generation and webhook-based status
            updates. Documentation available on request.
          </p>
          <div className="mt-6 rounded-xl bg-slate-800 p-4 font-mono text-sm text-green-400">
            POST /api/webhooks/partner/status<br />
            POST /api/partner/offers (coming soon)
          </div>
          <p className="mt-6 text-sm text-slate-400">
            Email: partnerships@neerloansolutions.com
          </p>
        </div>
      </div>
    </PageShell>
  );
}
