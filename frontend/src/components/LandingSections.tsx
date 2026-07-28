import Image from "next/image";
import Link from "next/link";

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

export function Hero() {
  return (
    <section className="gradient-hero relative min-h-[90vh] overflow-hidden text-white">
      {/* Decorative elements */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(251,191,36,0.15)_0%,_transparent_50%)]" />
      <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-teal-400/10 blur-3xl" />
      <div className="absolute -right-32 bottom-20 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 lg:grid-cols-2 lg:py-20">
        {/* Left - Copy */}
        <div className="order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-sm font-semibold text-amber-200">
            <span className="animate-pulse-slow">🔥</span>
            Limited Time — 10.99% Interest Rate
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
            <strong className="text-white">Kyun bank ke chakkar kaato?</strong> Ek jagah se compare karo
            HDFC, ICICI, Bajaj aur 15+ partner lenders ke best offers. Loan seedha aapke bank account
            mein — hum sirf connect karte hain, lend nahi karte.
          </p>

          {/* Rotating dialogues */}
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
              <span className="relative z-10">Abhi Apply Karo — FREE →</span>
              <div className="absolute inset-0 -translate-x-full bg-white/30 transition group-hover:translate-x-full duration-500" />
            </Link>
            <a
              href="#emi-calculator"
              className="rounded-2xl border-2 border-white/30 px-8 py-4 text-lg font-bold backdrop-blur transition hover:bg-white/10"
            >
              EMI Calculate Karo
            </a>
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

        {/* Right - Hero Image + Card */}
        <div className="relative order-1 flex justify-center lg:order-2">
          <div className="relative w-full max-w-md">
            {/* Glow behind image */}
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-amber-400/20 to-teal-400/20 blur-2xl" />

            {/* Main hero image */}
            <div className="relative overflow-hidden rounded-[2rem] border-4 border-white/20 shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=750&fit=crop&crop=faces"
                alt="Priya - DSA Lending Pro customer success story"
                width={600}
                height={750}
                className="h-[420px] w-full object-cover object-top md:h-[500px]"
                priority
              />
              {/* Overlay quote */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/95 via-slate-900/70 to-transparent p-6">
                <p className="text-lg font-bold text-white">
                  &ldquo;Maine 3 minute mein ₹4.2 lakh ka loan liya!&rdquo;
                </p>
                <p className="mt-1 text-sm text-teal-200">
                  — Priya Sharma, Mumbai <span className="text-amber-400">★★★★★</span>
                </p>
              </div>
            </div>

            {/* Floating approval card */}
            <div className="glass-card animate-float absolute -bottom-6 -left-6 max-w-[220px] rounded-2xl p-4 text-slate-800 lg:-left-10">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-lg">
                  ✅
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Just Approved!</p>
                  <p className="text-lg font-black text-green-600">₹3,50,000</p>
                </div>
              </div>
              <p className="mt-2 text-xs text-slate-500">@ 10.99% • 36 months</p>
            </div>

            {/* Floating rate badge */}
            <div className="absolute -right-4 top-8 rounded-2xl bg-amber-400 px-4 py-3 text-center font-black text-slate-900 shadow-xl lg:-right-8">
              <p className="text-2xl leading-none">10.99%</p>
              <p className="text-[10px] uppercase tracking-wider">Starting ROI</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust strip */}
      <div className="relative border-t border-white/10 bg-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-8 px-4 py-4 text-sm text-teal-100/80">
          <span>🔒 256-bit SSL Secured</span>
          <Link href="/compliance" className="hover:text-white transition">✓ RBI LSP Compliant</Link>
          <Link href="/compliance" className="hover:text-white transition">🛡️ DPDP Act 2023</Link>
          <span>🏦 15+ Partner Banks</span>
          <span>⭐ 4.8/5 Customer Rating</span>
          <span>📱 100% Digital Process</span>
        </div>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Mobile Number Daalo",
      desc: "OTP se verify — 30 second mein ho jayega",
      icon: "📱",
    },
    {
      num: "02",
      title: "Details Bharo",
      desc: "PAN, income, city — bas itna hi chahiye",
      icon: "📝",
    },
    {
      num: "03",
      title: "Offers Compare Karo",
      desc: "Sabse sasta ROI choose karo",
      icon: "⚖️",
    },
    {
      num: "04",
      title: "Loan Apne Account Mein",
      desc: "Partner bank seedha transfer karegi",
      icon: "🏦",
    },
  ];

  return (
    <section id="how-it-works" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <span className="rounded-full bg-teal-50 px-4 py-1 text-sm font-bold text-teal-600">
            SIMPLE PROCESS
          </span>
          <h2 className="mt-4 text-4xl font-black text-slate-900">
            Loan Lena Ab <span className="text-teal-600">Mazaak</span> Hai!
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-lg text-slate-500">
            4 easy steps — MoneyView & Navi se bhi fast
          </p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <div
              key={step.num}
              className="group relative rounded-3xl border border-slate-100 bg-gradient-to-b from-slate-50 to-white p-8 transition hover:-translate-y-2 hover:border-teal-200 hover:shadow-xl"
            >
              {i < steps.length - 1 && (
                <div className="absolute -right-3 top-1/2 hidden h-0.5 w-6 bg-teal-200 lg:block" />
              )}
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
        <h2 className="text-3xl font-black">
          India&apos;s Top <span className="text-amber-400">Partner Lenders</span>
        </h2>
        <p className="mt-3 text-slate-400">
          Ek application, multiple offers — aap choose karo, hum connect karte hain
        </p>
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {partners.map((p) => (
            <div
              key={p.name}
              className={`rounded-2xl bg-gradient-to-br ${p.color} p-5 font-bold shadow-lg transition hover:scale-105`}
            >
              {p.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <p className="text-xl font-black text-slate-900">
              DSA Lending <span className="text-teal-600">Pro</span>
            </p>
            <p className="mt-2 text-sm text-slate-500">
              India&apos;s smartest personal loan marketplace. Compare, choose, get funded.
            </p>
          </div>
          <div>
            <p className="font-bold text-slate-900">Quick Links</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><a href="/apply" className="hover:text-teal-600">Apply Now</a></li>
              <li><a href="#emi-calculator" className="hover:text-teal-600">EMI Calculator</a></li>
              <li><a href="#faq" className="hover:text-teal-600">FAQ</a></li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-slate-900">Legal & Compliance</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-500">
              <li><Link href="/compliance" className="hover:text-teal-600">RBI LSP Guidelines</Link></li>
              <li><Link href="/compliance" className="hover:text-teal-600">DPDP Act / Data Protection</Link></li>
              <li><Link href="/compliance" className="hover:text-teal-600">Privacy Policy</Link></li>
              <li><Link href="/compliance" className="hover:text-teal-600">Grievance Redressal</Link></li>
            </ul>
          </div>
          <div>
            <p className="font-bold text-slate-900">Contact</p>
            <p className="mt-3 text-sm text-slate-500">
              support@dsalendingpro.com<br />
              +91 98765 43210
            </p>
          </div>
        </div>
        <div className="mt-10 border-t border-slate-100 pt-6 text-center text-sm text-slate-400">
          <p>© 2026 DSA Lending Pro. We are a Loan Service Provider — not a lender.</p>
        </div>
      </div>
    </footer>
  );
}
