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
import { CmsField } from "@/components/cms/CmsField";

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

export function LifestyleShowcase({ config }: { config: import("@/lib/cms").SiteConfig }) {
  const blocks = config.lifestyle_showcase?.blocks?.length ? config.lifestyle_showcase.blocks : [];

  return (
    <section className="bg-white">
      {blocks.map((block, i) => (
        <div
          key={block.title}
          className={`grid items-center gap-0 lg:grid-cols-2 ${i % 2 === 1 ? "lg:flex-row-reverse" : ""}`}
        >
          <ScrollReveal
            variant={i % 2 === 1 ? "right" : "left"}
            className={`relative min-h-[360px] lg:min-h-[480px] ${i % 2 === 1 ? "lg:order-2" : ""}`}
          >
            <div className="absolute inset-0">
              <CmsField
                path={`lifestyle_showcase.blocks.${i}.image`}
                type="image"
                className="h-full w-full object-cover"
                group="Lifestyle"
              >
                {block.image}
              </CmsField>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent lg:hidden" />
          </ScrollReveal>
          <ScrollReveal
            variant={i % 2 === 1 ? "left" : "right"}
            className={`px-6 py-16 lg:px-16 lg:py-24 ${i % 2 === 1 ? "lg:order-1" : ""}`}
          >
            <span className="text-sm font-bold uppercase tracking-widest text-teal-600">
              Neer Loan Solutions
            </span>
            <CmsField
              path={`lifestyle_showcase.blocks.${i}.title`}
              as="h2"
              className="mt-3 text-3xl font-black text-slate-900 md:text-4xl"
              group="Lifestyle"
            >
              {block.title}
            </CmsField>
            <CmsField
              path={`lifestyle_showcase.blocks.${i}.desc`}
              as="p"
              className="mt-4 text-lg leading-relaxed text-slate-600"
              group="Lifestyle"
            >
              {block.desc}
            </CmsField>
            <Link
              href={block.href}
              className="mt-8 inline-flex rounded-2xl bg-teal-600 px-8 py-4 font-bold text-white shadow-lg shadow-teal-600/25 transition hover:bg-teal-700"
            >
              <CmsField path={`lifestyle_showcase.blocks.${i}.cta`} group="Lifestyle">
                {block.cta}
              </CmsField>{" "}
              →
            </Link>
          </ScrollReveal>
        </div>
      ))}
    </section>
  );
}

export function LoanProductsStrip({ config }: { config: import("@/lib/cms").SiteConfig }) {
  if (config.sections?.loan_products === false) return null;
  const section = config.loan_products;
  const cards = section.cards?.length
    ? section.cards
    : loanCards.map((c) => ({ title: c.title, rate: c.rate, image: c.image }));
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4">
        <ScrollReveal variant="up" className="text-center">
          <span className="rounded-full bg-teal-100 px-4 py-1 text-sm font-bold text-teal-700">LOAN PRODUCTS</span>
          <h2 className="mt-4 text-4xl font-black text-slate-900">
            <CmsField path="loan_products.title" group="Products">{section.title}</CmsField>
          </h2>
        </ScrollReveal>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c, i) => (
            <ScrollRevealAlternate key={c.title} index={i} delay={i * 100}>
              <Link
                href="/loans"
                className="group block overflow-hidden rounded-3xl glass-panel transition hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="relative h-44 overflow-hidden">
                  <Image
                    src={c.image}
                    alt={`${c.title} loan`}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                  <CmsField
                    path={`loan_products.cards.${i}.title`}
                    as="p"
                    className="absolute bottom-4 left-4 text-xl font-black text-white"
                    group="Products"
                  >
                    {c.title}
                  </CmsField>
                </div>
                <div className="flex items-center justify-between p-4">
                  <span className="text-sm text-slate-500">
                    From <CmsField path={`loan_products.cards.${i}.rate`} group="Products">{c.rate}</CmsField>
                  </span>
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

export function TrustGallery({ config }: { config: import("@/lib/cms").SiteConfig }) {
  const section = config.trust_gallery;
  const images = section.images?.length ? section.images : INDIAN_IMAGES.trust;

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
          <CmsField
            path="trust_gallery.title"
            as="h2"
            className="text-4xl font-black"
            group="Trust Gallery"
          >
            {section.title}
          </CmsField>
          <CmsField
            path="trust_gallery.subtitle"
            as="p"
            className="mx-auto mt-4 max-w-2xl text-slate-400"
            group="Trust Gallery"
          >
            {section.subtitle}
          </CmsField>
        </ScrollReveal>
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {images.map((src, i) => (
            <ScrollReveal key={src} variant="scale" delay={i * 80}>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-white/10">
                <CmsField
                  path={`trust_gallery.images.${i}`}
                  type="image"
                  className="h-full w-full object-cover"
                  group="Trust Gallery"
                >
                  {src}
                </CmsField>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export function AppDownloadBanner({ config }: { config: import("@/lib/cms").SiteConfig }) {
  const section = config.app_download;

  return (
    <section className="relative overflow-hidden bg-gradient-to-r from-slate-900 to-teal-900 py-16 text-white">
      <CmsField
        path="app_download.image"
        type="image"
        className="absolute inset-0 h-full w-full object-cover opacity-20"
        group="App Download"
      >
        {section.image}
      </CmsField>
      <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-8 px-4">
        <ScrollReveal variant="left">
          <CmsField
            path="app_download.badge"
            as="p"
            className="text-xs font-bold uppercase tracking-[0.2em] text-teal-300"
            group="App Download"
          >
            {section.badge}
          </CmsField>
          <CmsField
            path="app_download.title"
            as="h2"
            className="mt-2 text-3xl font-black"
            group="App Download"
          >
            {section.title}
          </CmsField>
          <CmsField
            path="app_download.subtitle"
            as="p"
            className="mt-2 max-w-md text-slate-300"
            group="App Download"
          >
            {section.subtitle}
          </CmsField>
        </ScrollReveal>
        <ScrollReveal variant="right">
          <Link
            href="/app"
            className="inline-block rounded-2xl bg-white px-8 py-4 font-bold text-slate-900 shadow-xl hover:bg-slate-100"
          >
            <CmsField path="app_download.cta" group="App Download">
              {section.cta}
            </CmsField>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}

export function ReferBanner({ config }: { config: import("@/lib/cms").SiteConfig }) {
  const section = config.refer_banner;

  return (
    <section className="relative overflow-hidden border-y border-neercred-gold/20 bg-gradient-to-r from-neercred-navy to-neercred-teal py-16 text-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-4">
        <ScrollReveal variant="left" className="flex items-center gap-6">
          <div className="relative hidden h-24 w-24 overflow-hidden rounded-2xl ring-2 ring-white/20 sm:block">
            <CmsField
              path="refer_banner.image"
              type="image"
              className="h-full w-full object-cover"
              group="Refer Banner"
            >
              {section.image}
            </CmsField>
          </div>
          <div>
            <CmsField path="refer_banner.title" as="p" className="text-2xl font-bold" group="Refer Banner">
              {section.title}
            </CmsField>
            <CmsField path="refer_banner.subtitle" as="p" className="text-slate-300" group="Refer Banner">
              {section.subtitle}
            </CmsField>
          </div>
        </ScrollReveal>
        <ScrollReveal variant="right">
          <Link href="/refer" className="rounded-xl bg-gradient-to-r from-neercred-gold to-amber-500 px-8 py-4 font-bold text-neercred-navy shadow-lg transition hover:brightness-110">
            <CmsField path="refer_banner.cta" group="Refer Banner">
              {section.cta}
            </CmsField>
          </Link>
        </ScrollReveal>
      </div>
    </section>
  );
}

export function HowItWorks({ config }: { config: import("@/lib/cms").SiteConfig }) {
  if (config.sections?.how_it_works === false) return null;
  const section = config.how_it_works;
  const defaultImages = [
    INDIAN_IMAGES.howItWorks.mobile,
    INDIAN_IMAGES.howItWorks.form,
    INDIAN_IMAGES.howItWorks.compare,
    INDIAN_IMAGES.howItWorks.disbursal,
  ];
  const steps = (section.steps?.length ? section.steps : []).map((s, i) => ({
    num: String(i + 1).padStart(2, "0"),
    title: s.title,
    desc: s.desc,
    image: defaultImages[i % defaultImages.length],
  }));

  return (
    <section id="how-it-works" className="py-24">
      <div className="mx-auto max-w-7xl px-4">
        <ScrollReveal variant="up" className="text-center">
          <span className="rounded-full bg-teal-50 px-4 py-1 text-sm font-bold text-teal-600">SIMPLE PROCESS</span>
          <h2 className="mt-4 text-4xl font-black text-slate-900">
            <CmsField path="how_it_works.title" group="Process">{section.title}</CmsField>
          </h2>
          {section.subtitle && (
            <CmsField path="how_it_works.subtitle" as="p" className="mt-3 text-slate-500" group="Process">
              {section.subtitle}
            </CmsField>
          )}
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
                  <CmsField path={`how_it_works.steps.${i}.title`} as="h3" className="mt-1 text-xl font-bold text-slate-900" group="Process">
                    {step.title}
                  </CmsField>
                  <CmsField path={`how_it_works.steps.${i}.desc`} as="p" className="mt-2 text-slate-500" group="Process">
                    {step.desc}
                  </CmsField>
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
