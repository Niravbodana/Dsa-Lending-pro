import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/ScrollReveal";
import { BRAND } from "@/lib/brand";

export const FOUNDER = {
  name: "Sunny Bodana",
  role: "Founder & CEO",
  image: "/images/founder/sunny-bodana.jpg",
  downloadHref: "/images/founder/sunny-bodana-bw.png",
  downloadName: "Sunny-Bodana-Founder-Portrait.png",
} as const;

export function FounderProfile() {
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(15,118,110,0.08),transparent_55%)]" />
      <div className="relative mx-auto max-w-6xl px-4">
        <ScrollReveal variant="up" className="text-center">
          <span className="rounded-full border border-teal-200 bg-teal-50 px-4 py-1 text-xs font-bold tracking-[0.22em] text-teal-700">
            LEADERSHIP
          </span>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            Meet the Founder
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-slate-500">
            The person behind {BRAND.shortName} — building a transparent, RBI-compliant loan marketplace for India.
          </p>
        </ScrollReveal>

        <ScrollReveal variant="up" delay={80}>
          <div className="mt-12 overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white shadow-[0_32px_80px_-32px_rgba(15,23,42,0.35)] md:grid md:grid-cols-[minmax(0,0.92fr)_1.08fr]">
            <div className="relative min-h-[520px] bg-neutral-950 md:min-h-[640px]">
              <Image
                src={FOUNDER.image}
                alt={`${FOUNDER.name} — ${FOUNDER.role}, ${BRAND.name}`}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 46vw"
                className="object-cover object-[center_12%] grayscale"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent p-6 md:hidden">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
                  {FOUNDER.role}
                </p>
                <p className="mt-1 text-2xl font-black text-white">{FOUNDER.name}</p>
              </div>
            </div>

            <div className="flex flex-col justify-center px-7 py-10 md:px-12 md:py-14">
              <p className="hidden text-xs font-bold uppercase tracking-[0.22em] text-teal-700 md:block">
                {FOUNDER.role}
              </p>
              <h3 className="hidden text-4xl font-black tracking-tight text-slate-900 md:mt-3 md:block">
                {FOUNDER.name}
              </h3>
              <blockquote className="mt-6 border-l-2 border-amber-400 pl-5 text-lg font-medium leading-relaxed text-slate-800">
                Every Indian deserves a fair loan — without branch visits, hidden charges, or confusion.
              </blockquote>
              <p className="mt-6 leading-relaxed text-slate-600">
                Sunny founded {BRAND.name} so borrowers can compare regulated personal-loan offers in minutes,
                then complete KYC and disbursal with complete transparency.
              </p>
              <p className="mt-4 leading-relaxed text-slate-600">
                The platform connects you with 15+ partner banks and NBFCs under RBI LSP guidelines — a
                customer-first marketplace, not a lender.
              </p>

              <dl className="mt-8 grid grid-cols-3 gap-3 text-center">
                {[
                  { value: "15+", label: "Lenders" },
                  { value: "50K+", label: "Customers" },
                  { value: "RBI", label: "LSP Model" },
                ].map((item) => (
                  <div key={item.label} className="rounded-2xl bg-slate-50 px-2 py-3">
                    <dt className="text-lg font-black text-slate-900">{item.value}</dt>
                    <dd className="mt-0.5 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                      {item.label}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={FOUNDER.downloadHref}
                  download={FOUNDER.downloadName}
                  className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-slate-900/20 transition hover:bg-slate-800"
                >
                  Download HD Portrait
                </a>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-800"
                >
                  Contact leadership
                </Link>
              </div>
              <p className="mt-3 text-xs text-slate-400">
                Black-and-white studio portrait · PNG · for press and website use
              </p>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}

export function FounderStrip() {
  return (
    <section className="border-y border-slate-200 bg-neutral-950 py-10 text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 sm:flex-row sm:gap-8">
        <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full ring-2 ring-white/20 sm:h-28 sm:w-28">
          <Image
            src="/images/founder/sunny-bodana-square.jpg"
            alt={`${FOUNDER.name}, ${FOUNDER.role}`}
            fill
            sizes="112px"
            className="object-cover object-top grayscale"
          />
        </div>
        <div className="text-center sm:text-left">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-amber-300">{FOUNDER.role}</p>
          <p className="mt-1 text-2xl font-black">{FOUNDER.name}</p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
            Building India&apos;s premium loan marketplace — transparent offers from regulated lenders, digital
            from start to disbursal.
          </p>
        </div>
        <Link
          href="/about"
          className="shrink-0 rounded-2xl bg-white px-6 py-3 text-sm font-bold text-slate-900 transition hover:bg-amber-400"
        >
          Meet the founder
        </Link>
      </div>
    </section>
  );
}
