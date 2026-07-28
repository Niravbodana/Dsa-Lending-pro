import { PageShell } from "@/components/PageShell";
import { InnerHero } from "@/components/InnerHero";
import { BRAND } from "@/lib/brand";

export const metadata = { title: `Platform | ${BRAND.name}` };

const stack = [
  { layer: "Frontend", tech: "Next.js 15, React, Tailwind CSS" },
  { layer: "API Gateway", tech: "Nginx, REST APIs" },
  { layer: "Backend", tech: "FastAPI, Python, SQLAlchemy, Pydantic" },
  { layer: "Database", tech: "PostgreSQL (prod), SQLite (dev)" },
  { layer: "Cache / Queue", tech: "Redis-ready architecture" },
  { layer: "Storage", tech: "Encrypted document storage (S3-ready)" },
];

const integrations = [
  "Partner lender offer APIs",
  "Aadhaar eKYC providers",
  "Account Aggregator / penny drop",
  "SMS & email notification gateways",
  "Partner status webhooks",
  "Analytics & funnel tracking",
];

export default function PlatformPage() {
  return (
    <PageShell>
      <InnerHero
        badge="TECHNOLOGY"
        title="Enterprise Platform Architecture"
        subtitle="Six-phase product roadmap — built for scale, compliance, and partner integration."
        image="https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1920&h=600&fit=crop"
      />
      <div className="mx-auto max-w-5xl px-4 py-16">
        <h2 className="text-2xl font-black text-slate-900">System Architecture</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {stack.map((s) => (
            <div key={s.layer} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wider text-teal-600">{s.layer}</p>
              <p className="mt-2 font-semibold text-slate-800">{s.tech}</p>
            </div>
          ))}
        </div>

        <h2 className="mt-16 text-2xl font-black text-slate-900">External Integrations</h2>
        <ul className="mt-6 grid gap-3 md:grid-cols-2">
          {integrations.map((i) => (
            <li key={i} className="rounded-xl bg-slate-50 px-5 py-4 text-sm font-medium text-slate-700">
              {i}
            </li>
          ))}
        </ul>

        <div className="mt-16 rounded-2xl bg-slate-900 p-8 text-white">
          <h2 className="text-xl font-black">Revenue Model</h2>
          <p className="mt-3 text-slate-400">
            Commission on successful disbursal — typically 1.5% to 4% based on loan amount slab.
            Tracked in admin panel with real-time commission reports.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
