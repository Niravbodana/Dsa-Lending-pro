import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { InnerHero } from "@/components/InnerHero";
import { BRAND } from "@/lib/brand";

export const metadata = { title: `Download App | ${BRAND.name}` };

export default function AppPage() {
  const features = [
    "⚡ 2-minute loan eligibility check",
    "📊 Compare offers from 15+ lenders",
    "🔔 Real-time application status alerts",
    "📅 EMI calculator & repayment schedule",
    "🔒 Biometric login & secure KYC",
    "💬 WhatsApp loan tracking",
  ];

  return (
    <PageShell>
      <InnerHero
        badge="MOBILE APP"
        title="Neer Loan App — Coming Soon"
        subtitle="Premium mobile app — loans in your pocket. Track, apply, compare. Launching Q3 2026."
      />
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <h2 className="text-2xl font-black">App Features</h2>
            <ul className="mt-6 space-y-4">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-3 text-slate-700">
                  <span className="text-lg">{f.split(" ")[0]}</span>
                  <span>{f.slice(f.indexOf(" ") + 1)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-4">
              <div className="flex items-center gap-3 rounded-2xl bg-slate-900 px-6 py-4 text-white opacity-60">
                <span className="text-2xl">▶️</span>
                <div>
                  <p className="text-xs">GET IT ON</p>
                  <p className="font-bold">Google Play</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-slate-900 px-6 py-4 text-white opacity-60">
                <span className="text-2xl">🍎</span>
                <div>
                  <p className="text-xs">Download on the</p>
                  <p className="font-bold">App Store</p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-400">Notify me when app launches:</p>
            <Link
              href="/contact"
              className="mt-2 inline-block rounded-xl bg-teal-600 px-6 py-3 font-bold text-white"
            >
              Join Waitlist →
            </Link>
          </div>

          <div className="flex justify-center">
            <div className="relative h-[500px] w-[260px] rounded-[3rem] border-8 border-slate-800 bg-gradient-to-b from-teal-600 to-cyan-700 p-4 shadow-2xl">
              <div className="h-full overflow-hidden rounded-[2.2rem] bg-white p-4">
                <p className="text-center text-xs font-bold text-teal-600">{BRAND.shortName}</p>
                <p className="mt-4 text-center text-2xl font-black text-slate-900">
                  ₹5,00,000
                </p>
                <p className="text-center text-xs text-slate-500">Pre-approved amount</p>
                <div className="mt-6 space-y-2">
                  <div className="rounded-lg bg-teal-50 p-3 text-center text-sm font-bold text-teal-700">
                    Check Eligibility
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 text-center text-xs text-slate-500">
                    Track Application
                  </div>
                  <div className="rounded-lg bg-slate-50 p-3 text-center text-xs text-slate-500">
                    EMI Calculator
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-500">
            For now, use our website —{" "}
            <Link href="/apply" className="font-bold text-teal-600 underline">
              Apply on Web →
            </Link>
          </p>
        </div>
      </div>
    </PageShell>
  );
}
