import Link from "next/link";
import Image from "next/image";
import { ScrollReveal } from "@/components/ScrollReveal";

const stats = [
  { value: "₹5L+", label: "Max Loan", icon: "💰" },
  { value: "10.99%", label: "Lowest ROI", icon: "📉" },
  { value: "5 Min", label: "Approval", icon: "⚡" },
  { value: "50K+", label: "Happy Users", icon: "😊" },
];

const dialogues = [
  "Fulfill your dreams — don't fear EMI.",
  "Wedding, travel, medical — instant loans for every need.",
  "Zero paperwork. 100% digital. Money straight to your account.",
];

const loanCards = [
  {
    title: "Personal",
    href: "/loans",
    image: "https://images.unsplash.com/photo-1554224311-0fb870a1d0ef?w=600&h=400&fit=crop",
    rate: "10.99%",
  },
  {
    title: "Medical",
    href: "/loans",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=400&fit=crop",
    rate: "11.49%",
  },
  {
    title: "Wedding",
    href: "/loans",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=400&fit=crop",
    rate: "11.99%",
  },
  {
    title: "Business",
    href: "/loans",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop",
    rate: "12.49%",
  },
];

const lifestyleBlocks = [
  {
    title: "Home, Wedding, Dreams — All Possible",
    desc: "Neer Loan Solutions connects you with India's trusted banks and NBFCs. Compare offers, choose the best rate, and receive funds directly in your account.",
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&h=600&fit=crop",
    cta: "Explore Loans",
    href: "/loans",
  },
  {
    title: "100% Digital. Zero Branch Visits.",
    desc: "OTP login, Aadhaar eKYC, bank verification, digital eSign — the entire process from your phone. Get approved from home.",
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=900&h=600&fit=crop",
    cta: "Start Application",
    href: "/apply",
    reverse: true,
  },
];

export function Hero() {
  return (
    <section className="relative min-h-[95vh] overflow-hidden text-white">
      <Image
        src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1920&h=1080&fit=crop"
        alt="Professional team at Neer Loan Solutions"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-teal-900/80 to-cyan-900/70" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(251,191,36,0.12)_0%,_transparent_55%)]" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 lg:grid-cols-2 lg:py-24">
        <ScrollReveal variant="left">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-sm font-semibold text-amber-200 backdrop-blur">
            <span className="animate-pulse-slow">✨</span>
            India&apos;s Premium Loan Marketplace
          </div>

          <h1 className="mt-6 text-4xl font-black leading-[1.08] tracking-tight md:text-5xl lg:text-6xl">
            Smart Loans.
            <br />
            <span className="text-gradient-gold">Simple Process.</span>
            <br />
            <span className="text-3xl text-teal-100 md:text-4xl lg:text-5xl">
              Up to ₹5,00,000 — in minutes.
            </span>
          </h1>

          <p className="mt-5 max-w-lg text-lg leading-relaxed text-teal-50/90">
            <strong className="text-white">Neer Loan Solutions</strong> — compare offers from HDFC,
            ICICI, Bajaj and 15+ partner lenders. Transparent rates, RBI-compliant, fully digital.
          </p>

          <ul className="mt-6 space-y-2">
            {dialogues.map((d) => (
              <li key={d} className="flex items-center gap-2 text-sm font-medium text-amber-100/90">
                <span className="text-amber-400">✦</span> {d}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/apply"
              className="rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-8 py-4 text-lg font-extrabold text-slate-900 shadow-2xl shadow-amber-500/30 transition hover:scale-105"
            >
              Apply Now — FREE →
            </Link>
            <Link
              href="/rates"
              className="rounded-2xl border-2 border-white/30 px-8 py-4 text-lg font-bold backdrop-blur transition hover:bg-white/10"
            >
              View Rates
            </Link>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((s, i) => (
              <ScrollReveal key={s.label} variant="up" delay={i * 80}>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur transition hover:bg-white/10">
                  <span className="text-xl">{s.icon}</span>
                  <p className="mt-1 text-xl font-black">{s.value}</p>
                  <p className="text-xs text-teal-100/70">{s.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal variant="right" delay={150} className="relative flex justify-center">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-amber-400/25 to-teal-400/25 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border-4 border-white/20 shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=750&fit=crop&crop=faces"
                alt="Happy Neer Loan customer"
                width={600}
                height={750}
                className="h-[440px] w-full object-cover object-top md:h-[520px]"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/95 via-slate-900/70 to-transparent p-6">
                <p className="text-lg font-bold text-white">
                  &ldquo;₹4.2 lakh approved in 3 minutes!&rdquo;
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
                  <p className="text-xs font-medium text-slate-500">Just Approved</p>
                  <p className="text-lg font-black text-green-600">₹3,50,000</p>
                </div>
              </div>
            </div>
            <div className="absolute -right-4 top-8 rounded-2xl bg-amber-400 px-4 py-3 text-center font-black text-slate-900 shadow-xl lg:-right-8">
              <p className="text-2xl leading-none">10.99%</p>
              <p className="text-[10px] uppercase tracking-wider">Starting ROI</p>
            </div>
          </div>
        </ScrollReveal>
      </div>

      <div className="relative border-t border-white/10 bg-black/30 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-6 px-4 py-4 text-sm text-teal-100/80">
          <span>🔒 256-bit SSL</span>
          <Link href="/compliance" className="transition hover:text-white">✓ RBI LSP Compliant</Link>
          <Link href="/compliance" className="transition hover:text-white">🛡️ DPDP Act 2023</Link>
          <span>🏦 15+ Partner Banks</span>
          <span>⭐ 4.8/5 Rating</span>
        </div>
      </div>
    </section>
  );
}

export function LifestyleShowcase() {
  return (
    <section className="bg-white">
      {lifestyleBlocks.map((block, i) => (
        <div
          key={block.title}
          className={`grid items-center gap-0 lg:grid-cols-2 ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
        >
          <ScrollReveal
            variant={block.reverse ? "right" : "left"}
            className={`relative min-h-[360px] lg:min-h-[480px] ${block.reverse ? "lg:order-2" : ""}`}
          >
            <Image src={block.image} alt={block.title} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent lg:hidden" />
          </ScrollReveal>
          <ScrollReveal
            variant={block.reverse ? "left" : "right"}
            className={`px-6 py-16 lg:px-16 lg:py-24 ${block.reverse ? "lg:order-1" : ""}`}
          >
            <span className="text-sm font-bold uppercase tracking-widest text-teal-600">
              Neer Loan Solutions
            </span>
            <h2 className="mt-3 text-3xl font-black text-slate-900 md:text-4xl">{block.title}</h2>
            <p className="mt-4 text-lg leading-relaxed text-slate-600">{block.desc}</p>
            <Link
              href={block.href}
              className="mt-8 inline-flex rounded-2xl bg-teal-600 px-8 py-4 font-bold text-white shadow-lg shadow-teal-600/25 transition hover:bg-teal-700"
            >
              {block.cta} →
            </Link>
          </ScrollReveal>
        </div>
      ))}
    </section>
  );
}

export function LoanProductsStrip() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <ScrollReveal variant="up" className="text-center">
          <span className="rounded-full bg-teal-100 px-4 py-1 text-sm font-bold text-teal-700">
            LOAN PRODUCTS
          </span>
          <h2 className="mt-4 text-4xl font-black text-slate-900">
            The <span className="text-teal-600">Right Loan</span> for Every Need
          </h2>
        </ScrollReveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loanCards.map((c, i) => (
            <ScrollReveal key={c.title} variant="up" delay={i * 100}>
              <Link
                href={c.href}
                className="group block overflow-hidden rounded-3xl bg-white shadow-lg transition hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={c.image}
                    alt={`${c.title} loan`}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                  <p className="absolute bottom-4 left-4 text-xl font-black text-white">{c.title}</p>
                </div>
                <div className="flex items-center justify-between p-4">
                  <span className="text-sm text-slate-500">From {c.rate}</span>
                  <span className="text-sm font-bold text-teal-600">Apply →</span>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>
        <ScrollReveal variant="fade" className="mt-10 text-center">
          <Link href="/loans" className="font-bold text-teal-600 hover:underline">
            View All Loan Products →
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}

export function TrustGallery() {
  const images = [
    "https://images.unsplash.com/photo-1521737711862-ece3fdac9ca2?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop",
    "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=300&fit=crop",
  ];

  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 text-white">
      <div
        className="image-parallax absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "url(https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&h=600&fit=crop)",
        }}
      />
      <div className="relative mx-auto max-w-7xl px-4">
        <ScrollReveal variant="up" className="text-center">
          <h2 className="text-4xl font-black">
            Trusted by <span className="text-amber-400">Thousands</span> Across India
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-400">
            From Mumbai to Delhi — professionals, families, and entrepreneurs trust Neer Loan Solutions.
          </p>
        </ScrollReveal>
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {images.map((src, i) => (
            <ScrollReveal key={src} variant="scale" delay={i * 80}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-white/10">
                <Image src={src} alt="Neer Loan customer" fill className="object-cover" />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AppDownloadBanner() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-teal-900 py-16 text-white">
      <Image
        src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=400&fit=crop"
        alt=""
        fill
        className="object-cover opacity-20"
      />
      <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-4">
        <ScrollReveal variant="left">
          <p className="text-sm font-semibold text-teal-300">📱 MOBILE APP — COMING SOON</p>
          <h2 className="mt-2 text-3xl font-black">Neer Loan App — Loans in Your Pocket</h2>
          <p className="mt-2 max-w-md text-slate-300">
            Track applications, compare offers, EMI calculator — all in one premium app. Launching Q3 2026.
          </p>
        </ScrollReveal>
        <ScrollReveal variant="right">
          <Link
            href="/app"
            className="inline-block rounded-2xl bg-white px-8 py-4 font-bold text-slate-900 shadow-xl hover:bg-slate-100"
          >
            Join Waitlist →
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}

export function ReferBanner() {
  return (
    <section className="relative overflow-hidden bg-amber-50 py-14">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4">
        <ScrollReveal variant="left" className="flex items-center gap-6">
          <div className="relative hidden h-24 w-24 overflow-hidden rounded-2xl sm:block">
            <Image
              src="https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&h=200&fit=crop"
              alt="Friends referring"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-2xl font-black text-amber-900">🎁 Refer &amp; Earn ₹2,000</p>
            <p className="text-amber-700">Refer friends and earn on every successful disbursal</p>
          </div>
        </ScrollReveal>
        <ScrollReveal variant="right">
          <Link href="/refer" className="rounded-xl bg-amber-500 px-8 py-4 font-bold text-slate-900 shadow-lg">
            Refer Now →
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    { num: "01", title: "Verify Mobile", desc: "Secure OTP login — 30 seconds", icon: "📱", image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=260&fit=crop" },
    { num: "02", title: "Enter Details", desc: "PAN, income, city — simple form", icon: "📝", image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=260&fit=crop" },
    { num: "03", title: "Compare Offers", desc: "Choose the best rate from 15+ lenders", icon: "⚖️", image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=260&fit=crop" },
    { num: "04", title: "Money in Account", desc: "Direct disbursal from partner bank", icon: "🏦", image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=260&fit=crop" },
  ];

  return (
    <section id="how-it-works" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4">
        <ScrollReveal variant="up" className="text-center">
          <span className="rounded-full bg-teal-50 px-4 py-1 text-sm font-bold text-teal-600">SIMPLE PROCESS</span>
          <h2 className="mt-4 text-4xl font-black text-slate-900">
            Getting a Loan Is Now <span className="text-teal-600">Effortless</span>
          </h2>
        </ScrollReveal>
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <ScrollReveal key={step.num} variant="up" delay={i * 100}>
              <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg transition hover:-translate-y-2 hover:shadow-2xl">
                <div className="relative h-36">
                  <Image src={step.image} alt={step.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
                  <span className="absolute bottom-3 left-4 text-3xl">{step.icon}</span>
                </div>
                <div className="p-6">
                  <span className="text-3xl font-black text-teal-100">{step.num}</span>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-slate-500">{step.desc}</p>
                </div>
              </div>
            </ScrollReveal>
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
    { name: "Neo Finance", color: "from-purple-500 to-violet-600" },
    { name: "Axis Bank", color: "from-rose-600 to-red-700" },
  ];

  return (
    <section className="bg-slate-900 py-20 text-white">
      <div className="mx-auto max-w-7xl px-4 text-center">
        <ScrollReveal variant="up">
          <h2 className="text-3xl font-black">
            Our <span className="text-amber-400">Partner Lenders</span>
          </h2>
          <p className="mt-3 text-slate-400">India&apos;s most trusted banks &amp; NBFCs</p>
        </ScrollReveal>
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {partners.map((p, i) => (
            <ScrollReveal key={p.name} variant="scale" delay={i * 60}>
              <div className={`rounded-2xl bg-gradient-to-br ${p.color} p-5 font-bold shadow-lg`}>
                {p.name}
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export { Footer } from "@/components/Footer";
