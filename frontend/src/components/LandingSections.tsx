import Link from "next/link";
import Image from "next/image";

const stats = [
  { value: "₹5L+", label: "Max Loan", icon: "💰" },
  { value: "10.99%", label: "Lowest ROI", icon: "📉" },
  { value: "5 Min", label: "Approval", icon: "⚡" },
  { value: "50K+", label: "Happy Users", icon: "😊" },
];

const dialogues = [
  "\"Sapne poore karo, EMI se daro mat!\"",
  "\"Wedding, travel, medical — sab ke liye instant loan\"",
  "\"Zero paperwork. 100% digital. Paisa seedha account mein.\"",
];

const loanCards = [
  { icon: "💰", title: "Personal", href: "/loans" },
  { icon: "🏥", title: "Medical", href: "/loans" },
  { icon: "💍", title: "Wedding", href: "/loans" },
  { icon: "📈", title: "Business", href: "/loans" },
];

export function Hero() {
  return (
    <section className="gradient-hero relative min-h-[90vh] overflow-hidden text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(251,191,36,0.15)_0%,_transparent_50%)]" />
      <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-teal-400/10 blur-3xl" />
      <div className="absolute -right-32 bottom-20 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 lg:grid-cols-2 lg:py-20">
        <div className="order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-sm font-semibold text-amber-200">
            <span className="animate-pulse-slow">🔥</span>
            Neer Loan Solutions — 10.99% se shuru
          </div>

          <h1 className="mt-6 text-4xl font-black leading-[1.1] tracking-tight md:text-5xl lg:text-6xl">
            Apna Loan,{" "}
            <span className="text-gradient-gold">Apni Choice</span>
            <br />
            <span className="text-3xl md:text-4xl lg:text-5xl">
              ₹5,00,000 tak — <span className="text-teal-200">5 minute mein!</span>
            </span>
          </h1>

          <p className="mt-5 max-w-lg text-lg leading-relaxed text-teal-50/90">
            <strong className="text-white">MoneyView &amp; Navi jaisa experience</strong> — compare
            karo HDFC, ICICI, Bajaj aur 15+ lenders. Loan seedha aapke account mein.
          </p>

          <div className="mt-6 space-y-2">
            {dialogues.map((d) => (
              <p key={d} className="flex items-center gap-2 text-sm font-medium text-amber-100/90">
                <span className="text-amber-400">✦</span> {d}
              </p>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/apply"
              className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-8 py-4 text-lg font-extrabold text-slate-900 shadow-2xl shadow-amber-500/30 transition hover:scale-105"
            >
              Abhi Apply Karo — FREE →
            </Link>
            <Link
              href="/rates"
              className="rounded-2xl border-2 border-white/30 px-8 py-4 text-lg font-bold backdrop-blur transition hover:bg-white/10"
            >
              Rates Dekho
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition hover:bg-white/10"
              >
                <span className="text-xl">{s.icon}</span>
                <p className="mt-1 text-xl font-black">{s.value}</p>
                <p className="text-xs text-teal-100/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative order-1 flex justify-center lg:order-2">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-amber-400/20 to-teal-400/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border-4 border-white/20 shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=750&fit=crop&crop=faces"
                alt="Happy Neer Loan Solutions customer"
                width={600}
                height={750}
                className="h-[420px] w-full object-cover object-top md:h-[500px]"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/95 via-slate-900/70 to-transparent p-6">
                <p className="text-lg font-bold text-white">
                  &ldquo;Maine 3 minute mein ₹4.2 lakh ka loan liya!&rdquo;
                </p>
                <p className="mt-1 text-sm text-teal-200">
                  — Priya Sharma, Mumbai <span className="text-amber-400">★★★★★</span>
                </p>
              </div>
            </div>
            <div className="glass-card animate-float absolute -bottom-6 -left-6 max-w-[220px] rounded-2xl p-4 text-slate-800 lg:-left-10">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-lg">✅</div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Just Approved!</p>
                  <p className="text-lg font-black text-green-600">₹3,50,000</p>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 top-8 rounded-2xl bg-amber-400 px-4 py-3 text-center font-black text-slate-900 shadow-xl lg:-right-8">
              <p className="text-2xl leading-none">10.99%</p>
              <p className="text-[10px] uppercase tracking-wider">Starting ROI</p>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/10 bg-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-6 px-4 py-4 text-sm text-teal-100/80">
          <span>🔒 256-bit SSL</span>
          <Link href="/compliance" className="hover:text-white transition">✓ RBI LSP Compliant</Link>
          <Link href="/compliance" className="hover:text-white transition">🛡️ DPDP Act 2023</Link>
          <span>🏦 15+ Partner Banks</span>
          <span>⭐ 4.8/5 Rating</span>
        </div>
      </div>
    </section>
  );
}

export function LoanProductsStrip() {
  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900">Loan Products</h2>
          <Link href="/loans" className="text-sm font-bold text-teal-600 hover:underline">
            View All →
          </Link>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {loanCards.map((c) => (
            <Link
              key={c.title}
              href={c.href}
              className="rounded-2xl border border-slate-100 bg-slate-50 p-6 text-center transition hover:border-teal-200 hover:shadow-lg"
            >
              <span className="text-3xl">{c.icon}</span>
              <p className="mt-2 font-bold text-slate-900">{c.title} Loan</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AppDownloadBanner() {
  return (
    <section className="bg-gradient-to-r from-slate-900 to-teal-900 py-12 text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4">
        <div>
          <p className="text-sm font-semibold text-teal-300">📱 MOBILE APP — COMING SOON</p>
          <h2 className="mt-2 text-2xl font-black">Neer Loan App — Pocket Mein Loan</h2>
          <p className="mt-2 text-slate-300">Navi jaisa app experience. Launching Q3 2026.</p>
        </div>
        <Link
          href="/app"
          className="rounded-2xl bg-white px-8 py-4 font-bold text-slate-900 hover:bg-slate-100"
        >
          Join Waitlist →
        </Link>
      </div>
    </section>
  );
}

export function ReferBanner() {
  return (
    <section className="bg-amber-50 py-10">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4">
        <div>
          <p className="font-black text-amber-900">🎁 Refer &amp; Earn ₹2,000</p>
          <p className="text-sm text-amber-700">Dosto ko refer karo, har disbursal pe paise kamao</p>
        </div>
        <Link href="/refer" className="rounded-xl bg-amber-500 px-6 py-3 font-bold text-slate-900">
          Refer Now →
        </Link>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    { num: "01", title: "Mobile Number Daalo", desc: "OTP se verify — 30 second", icon: "📱" },
    { num: "02", title: "Details Bharo", desc: "PAN, income, city", icon: "📝" },
    { num: "03", title: "Offers Compare Karo", desc: "Sabse sasta ROI choose karo", icon: "⚖️" },
    { num: "04", title: "Loan Apne Account Mein", desc: "Partner bank seedha transfer", icon: "🏦" },
  ];

  return (
    <section id="how-it-works" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <span className="rounded-full bg-teal-50 px-4 py-1 text-sm font-bold text-teal-600">SIMPLE PROCESS</span>
          <h2 className="mt-4 text-4xl font-black text-slate-900">
            Loan Lena Ab <span className="text-teal-600">Easy</span> Hai!
          </h2>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div key={step.num} className="rounded-3xl border border-slate-100 bg-slate-50 p-8 transition hover:-translate-y-2 hover:shadow-xl">
              <span className="text-4xl">{step.icon}</span>
              <span className="mt-4 block text-4xl font-black text-teal-100">{step.num}</span>
              <h3 className="mt-2 text-xl font-bold text-slate-900">{step.title}</h3>
              <p className="mt-2 text-slate-500">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Partners() {
  const partners = [
    { name: "HDFC Bank", color: "from-blue-600 to-blue-700" },
    { name: "ICICI Bank", color: "from-orange-500 to-red-600" },
    { name: "Bajaj Finserv", color: "from-blue-500 to-indigo-600" },
    { name: "Tata Capital", color: "from-sky-600 to-blue-700" },
    { name: "MoneyView", color: "from-purple-500 to-violet-600" },
    { name: "Axis Bank", color: "from-rose-600 to-red-700" },
  ];

  return (
    <section className="bg-slate-900 py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 text-center">
        <h2 className="text-3xl font-black">Our <span className="text-amber-400">Partner Lenders</span></h2>
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {partners.map((p) => (
            <div key={p.name} className={`rounded-2xl bg-gradient-to-br ${p.color} p-5 font-bold shadow-lg`}>
              {p.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Re-export Footer from separate file
export { Footer } from "@/components/Footer";
