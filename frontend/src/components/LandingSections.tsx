import Link from "next/link";

const stats = [
  { value: "₹5L+", label: "Max Loan Amount" },
  { value: "10.99%", label: "Starting ROI" },
  { value: "5 Min", label: "Quick Approval" },
  { value: "15+", label: "Partner Lenders" },
];

const steps = [
  { num: "01", title: "Enter Mobile", desc: "Verify with OTP in seconds" },
  { num: "02", title: "Share Details", desc: "PAN, income & employment" },
  { num: "03", title: "Compare Offers", desc: "Best rates from partners" },
  { num: "04", title: "Get Loan", desc: "Direct disbursal to bank" },
];

const partners = ["HDFC Bank", "ICICI Bank", "Bajaj Finserv", "Tata Capital", "MoneyView"];

export function Hero() {
  return (
    <section className="gradient-hero relative overflow-hidden text-white">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-40" />
      <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-2 md:py-24">
        <div>
          <span className="inline-block rounded-full bg-white/20 px-4 py-1 text-sm font-medium backdrop-blur">
            🚀 Phase 1 MVP — Loan Marketplace
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-tight md:text-5xl">
            Get Personal Loan up to{" "}
            <span className="text-yellow-300">₹5,00,000</span> in Minutes
          </h1>
          <p className="mt-4 text-lg text-teal-50">
            Compare offers from multiple partner banks & NBFCs. We don&apos;t lend — our partners
            do. You choose the best offer, loan goes directly to your bank account.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/apply"
              className="rounded-full bg-white px-8 py-4 text-lg font-bold text-teal-700 shadow-xl transition hover:scale-105"
            >
              Check Eligibility →
            </Link>
            <a
              href="#how-it-works"
              className="rounded-full border-2 border-white/50 px-8 py-4 text-lg font-semibold transition hover:bg-white/10"
            >
              How it Works
            </a>
          </div>
          <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="rounded-2xl bg-white/10 p-4 backdrop-blur">
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-sm text-teal-100">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-center">
          <div className="glass-card w-full max-w-sm rounded-3xl p-6 text-slate-800">
            <p className="text-sm font-medium text-teal-600">Instant Eligibility</p>
            <p className="mt-2 text-2xl font-bold">You&apos;re pre-approved for</p>
            <p className="mt-1 text-4xl font-extrabold text-teal-700">₹3,50,000</p>
            <div className="mt-6 space-y-3">
              <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-slate-500">Interest from</span>
                <span className="font-bold text-teal-700">10.99% p.a.</span>
              </div>
              <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-slate-500">EMI starting</span>
                <span className="font-bold">₹11,450/mo</span>
              </div>
              <div className="flex justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-slate-500">Tenure</span>
                <span className="font-bold">Up to 60 months</span>
              </div>
            </div>
            <Link
              href="/apply"
              className="mt-6 block w-full rounded-xl bg-teal-600 py-3 text-center font-bold text-white transition hover:bg-teal-700"
            >
              Apply Now — It&apos;s Free
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center text-3xl font-bold text-slate-900">How It Works</h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-slate-500">
          Simple 4-step process — just like MoneyView & Navi
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.num}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-6 transition hover:shadow-lg"
            >
              <span className="text-3xl font-black text-teal-200">{step.num}</span>
              <h3 className="mt-2 text-lg font-bold text-slate-900">{step.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Partners() {
  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-6xl px-4 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Our Partner Lenders</h2>
        <p className="mt-2 text-slate-500">Real partner APIs will be integrated in Phase 2</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {partners.map((p) => (
            <div
              key={p}
              className="rounded-xl border border-slate-200 bg-white px-6 py-4 font-semibold text-slate-700 shadow-sm"
            >
              {p}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-8">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-slate-500">
        <p>© 2026 DSA Lending Pro. RBI LSP Guidelines compliant platform.</p>
        <p className="mt-1">We are a Loan Service Provider — not a lender.</p>
      </div>
    </footer>
  );
}
