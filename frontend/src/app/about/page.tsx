import { PageShell } from "@/components/PageShell";
import { InnerHero } from "@/components/InnerHero";
import { BRAND } from "@/lib/brand";

export const metadata = { title: `About Us | ${BRAND.name}` };

export default function AboutPage() {
  const milestones = [
    { year: "2024", title: "Founded", desc: "Neer Loan Solutions started with one mission — loans simple banana." },
    { year: "2025", title: "15+ Partners", desc: "HDFC, ICICI, Bajaj aur top NBFCs ke saath partnership." },
    { year: "2026", title: "50K+ Users", desc: "50,000+ Indians ne apna loan Neer se liya." },
  ];

  const values = [
    { icon: "🎯", title: "Transparency", desc: "Koi hidden charge nahi. Sab kuch clear." },
    { icon: "⚡", title: "Speed", desc: "5 minute mein eligibility, same-day approval possible." },
    { icon: "🔒", title: "Security", desc: "Bank-grade encryption, DPDP Act compliant." },
    { icon: "🤝", title: "Trust", desc: "RBI LSP guidelines ke poora palan." },
  ];

  return (
    <PageShell>
      <InnerHero
        badge="OUR STORY"
        title="About Neer Loan Solutions"
        subtitle="Hum India ka smart loan marketplace hain — MoneyView aur Navi jaisa, par aapke liye personalized."
        cta={{ label: "Apply for Loan →", href: "/apply" }}
      />
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="rounded-3xl bg-white p-8 shadow-lg md:p-12">
          <h2 className="text-2xl font-black text-slate-900">Hum Kaun Hain?</h2>
          <p className="mt-4 leading-relaxed text-slate-600">
            <strong>{BRAND.name}</strong> ek Loan Service Provider (LSP) hai jo borrowers ko India ke
            best banks aur NBFCs se connect karta hai. Hum khud loan nahi dete — hum aapko sahi lender
            tak le jaate hain, best rate pe, minimum paperwork ke saath.
          </p>
          <p className="mt-4 leading-relaxed text-slate-600">
            Mumbai se shuru hoke, aaj hum poore India mein personal loans facilitate karte hain —
            wedding, medical, travel, business, education — har need ke liye.
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
              <span className="text-3xl">{v.icon}</span>
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
