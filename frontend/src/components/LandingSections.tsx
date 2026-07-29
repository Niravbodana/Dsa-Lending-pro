import Link from "next/link";
import Image from "next/image";
import { ScrollReveal, ScrollRevealAlternate } from "@/components/ScrollReveal";
import {
  IconRupee,
  IconChart,
  IconBolt,
  IconUsers,
  IconCheckCircle,
  IconLock,
  IconShield,
  IconBank,
  IconStar,
} from "@/components/icons";
import { INDIAN_IMAGES } from "@/lib/indian-images";

const stats = [
  { value: "₹5L+", label: "Max Loan", Icon: IconRupee },
  { value: "10.99%", label: "Lowest ROI", Icon: IconChart },
  { value: "5 Min", label: "Approval", Icon: IconBolt },
  { value: "50K+", label: "Customers", Icon: IconUsers },
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
    image: INDIAN_IMAGES.loans.personal,
    rate: "10.99%",
  },
  {
    title: "Medical",
    href: "/loans",
    image: INDIAN_IMAGES.loans.medical,
    rate: "11.49%",
  },
  {
    title: "Wedding",
    href: "/loans",
    image: INDIAN_IMAGES.loans.wedding,
    rate: "11.99%",
  },
  {
    title: "Business",
    href: "/loans",
    image: INDIAN_IMAGES.loans.business,
    rate: "12.49%",
  },
];

const lifestyleBlocks = [
  {
    title: "Home, Wedding, Dreams — All Possible",
    desc: "Neer Loan Solutions connects you with India's trusted banks and NBFCs. Compare offers, choose the best rate, and receive funds directly in your account.",
    image: INDIAN_IMAGES.lifestyle.familyHome,
    cta: "Explore Loans",
    href: "/loans",
  },
  {
    title: "100% Digital. Zero Branch Visits.",
    desc: "OTP login, Aadhaar eKYC, bank verification, digital eSign — the entire process from your phone. Get approved from home.",
    image: INDIAN_IMAGES.lifestyle.mobileIndia,
    cta: "Start Application",
    href: "/apply",
    reverse: true,
  },
];

export function Hero() {
  return (
    <section className="gradient-hero relative min-h-[92vh] overflow-hidden text-white">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(251,191,36,0.15)_0%,_transparent_50%)]" />
      <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-teal-400/10 blur-3xl" />
      <div className="absolute -right-32 bottom-20 h-96 w-96 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-2 lg:py-20">
        <ScrollReveal variant="left">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-sm font-semibold text-amber-200">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse-slow" />
            RBI LSP Registered · Premium Marketplace
          </div>

          <h1 className="mt-6 text-4xl font-black leading-[1.08] tracking-tight md:text-5xl lg:text-6xl">
            Your Loan.
            <br />
            <span className="text-gradient-gold">Your Choice.</span>
            <br />
            <span className="text-3xl text-teal-100 md:text-4xl lg:text-5xl">
              Up to ₹5,00,000 — in minutes.
            </span>
          </h1>

          <p className="mt-5 max-w-lg text-lg leading-relaxed text-teal-50/90">
            <strong className="text-white">Neer Loan Solutions</strong> connects you with HDFC,
            ICICI, Bajaj and 15+ regulated lenders. Transparent pricing. Fully digital.
          </p>

          <ul className="mt-6 space-y-2">
            {dialogues.map((d) => (
              <li key={d} className="flex items-center gap-3 text-sm font-medium text-amber-100/90">
                <IconCheckCircle size={16} className="shrink-0 text-amber-400" />
                {d}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              href="/apply"
              className="rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 px-8 py-4 text-lg font-extrabold text-slate-900 shadow-2xl shadow-amber-500/30 transition hover:scale-[1.02]"
            >
              Apply Now
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
                  <s.Icon size={20} className="text-amber-300" />
                  <p className="mt-2 text-xl font-black">{s.value}</p>
                  <p className="text-xs text-teal-100/70">{s.label}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal variant="right" delay={150} className="relative flex justify-center">
          <div className="relative w-full max-w-md">
            <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-amber-400/20 to-teal-400/20 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border-4 border-white/20 shadow-2xl">
              <Image
                src={INDIAN_IMAGES.hero.customer}
                alt="Neer Loan Solutions customer"
                width={600}
                height={750}
                className="h-[440px] w-full object-cover object-top md:h-[500px]"
                priority
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/95 via-slate-900/70 to-transparent p-6">
                <p className="text-lg font-bold text-white">
                  &ldquo;Clear terms, smooth KYC, and timely disbursal.&rdquo;
                </p>
                <p className="mt-1 flex items-center gap-2 text-sm text-teal-200">
                  — Priya Sharma, Mumbai
                  <span className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <IconStar key={n} size={12} className="fill-current" />
                    ))}
                  </span>
                </p>
              </div>
            </div>
            <div className="glass-card animate-float absolute -bottom-6 -left-6 max-w-[220px] rounded-2xl p-4 text-slate-800 lg:-left-10">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <IconCheckCircle size={20} />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500">Loan Disbursed</p>
                  <p className="text-lg font-bold text-neercred-navy">₹3,50,000</p>
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

      <div className="relative border-t border-white/10 bg-black/20 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-8 px-4 py-4 text-sm text-teal-100/80">
          <span className="flex items-center gap-2"><IconLock size={14} /> 256-bit SSL</span>
          <Link href="/compliance" className="flex items-center gap-2 transition hover:text-white">
            <IconShield size={14} /> RBI LSP Compliant
          </Link>
          <Link href="/security" className="flex items-center gap-2 transition hover:text-white">
            <IconShield size={14} /> DPDP Act 2023
          </Link>
          <span className="flex items-center gap-2"><IconBank size={14} /> 15+ Partner Banks</span>
          <span className="flex items-center gap-2"><IconStar size={14} className="text-amber-400" /> 4.8/5 Rating</span>
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
            <ScrollRevealAlternate key={c.title} index={i} delay={i * 100}>
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
            </ScrollRevealAlternate>
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
  const images = INDIAN_IMAGES.trust;

  return (
    <section className="relative overflow-hidden bg-slate-950 py-24 text-white">
      <div
        className="image-parallax absolute inset-0 opacity-20"
        style={{
          backgroundImage: `url(${INDIAN_IMAGES.pages.trustBg})`,
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
        src={INDIAN_IMAGES.misc.appBanner}
        alt=""
        fill
        className="object-cover opacity-20"
      />
      <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-4">
        <ScrollReveal variant="left">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300">Mobile App — Coming Soon</p>
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
    <section className="relative overflow-hidden border-y border-neercred-gold/20 bg-gradient-to-r from-neercred-navy to-neercred-teal py-16 text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4">
        <ScrollReveal variant="left" className="flex items-center gap-6">
          <div className="relative hidden h-24 w-24 overflow-hidden rounded-2xl ring-2 ring-white/20 sm:block">
            <Image
              src={INDIAN_IMAGES.misc.referThumb}
              alt="Referral program"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <p className="text-2xl font-bold">Refer &amp; Earn</p>
            <p className="text-slate-300">Earn rewards on every successful referral disbursal</p>
          </div>
        </ScrollReveal>
        <ScrollReveal variant="right">
          <Link href="/refer" className="rounded-xl bg-gradient-to-r from-neercred-gold to-amber-500 px-8 py-4 font-bold text-neercred-navy shadow-lg transition hover:brightness-110">
            View Program
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    { num: "01", title: "Verify Mobile", desc: "Secure OTP login — 30 seconds", image: INDIAN_IMAGES.howItWorks.mobile },
    { num: "02", title: "Enter Details", desc: "PAN, income, city — simple form", image: INDIAN_IMAGES.howItWorks.form },
    { num: "03", title: "Compare Offers", desc: "Choose the best rate from 15+ lenders", image: INDIAN_IMAGES.howItWorks.compare },
    { num: "04", title: "Money in Account", desc: "Direct disbursal from partner bank", image: INDIAN_IMAGES.howItWorks.disbursal },
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
            <ScrollRevealAlternate key={step.num} index={i} delay={i * 100}>
              <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg transition hover:-translate-y-2 hover:shadow-2xl">
                <div className="relative h-36">
                  <Image src={step.image} alt={step.title} fill className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 to-transparent" />
                  <span className="absolute bottom-3 left-4 rounded-lg bg-white/90 px-2 py-1 text-xs font-bold text-slate-900">
                    Step {step.num}
                  </span>
                </div>
                <div className="p-6">
                  <span className="text-3xl font-black text-teal-100">{step.num}</span>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-2 text-slate-500">{step.desc}</p>
                </div>
              </div>
            </ScrollRevealAlternate>
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
