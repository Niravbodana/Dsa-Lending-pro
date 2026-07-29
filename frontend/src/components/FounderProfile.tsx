import Image from "next/image";
import Link from "next/link";
import { ScrollReveal } from "@/components/ScrollReveal";
import { BRAND } from "@/lib/brand";

const FOUNDER_IMAGE = "/images/founder/sunny-bodana.jpg";

export function FounderProfile() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-4">
        <ScrollReveal variant="up" className="text-center">
          <span className="rounded-full bg-teal-50 px-4 py-1 text-sm font-bold text-teal-700">
            MEET THE FOUNDER
          </span>
          <h2 className="mt-4 text-3xl font-black text-slate-900 md:text-4xl">
            Built on Trust, Led with Vision
          </h2>
        </ScrollReveal>

        <ScrollReveal variant="up" delay={80}>
          <div className="mt-12 overflow-hidden rounded-[2rem] border border-white/70 bg-white/60 shadow-2xl backdrop-blur-xl md:grid md:grid-cols-2">
            <div className="relative min-h-[420px] overflow-hidden bg-slate-100 md:min-h-[520px]">
              <Image
                src={FOUNDER_IMAGE}
                alt="Sunny Bodana — Founder, Neer Loan Solutions"
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-[62%_28%] scale-[1.18]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/35 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-white/10" />
            </div>

            <div className="flex flex-col justify-center p-8 md:p-12">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-600">Founder &amp; CEO</p>
              <h3 className="mt-3 text-3xl font-black text-slate-900 md:text-4xl">Sunny Bodana</h3>
              <p className="mt-5 text-lg leading-relaxed text-slate-600">
                Sunny founded {BRAND.name} with a simple belief: every Indian deserves transparent access to
                regulated personal loans — without branch visits, hidden charges, or confusion.
              </p>
              <p className="mt-4 leading-relaxed text-slate-600">
                With experience building Neer Infotech and serving communities through microfinance, Sunny brings
                a customer-first mindset to India&apos;s digital lending marketplace — connecting borrowers with
                15+ partner banks and NBFCs through one premium, RBI-compliant platform.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/apply"
                  className="rounded-2xl bg-teal-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-teal-600/25 transition hover:bg-teal-700"
                >
                  Start Your Application
                </Link>
                <Link
                  href="/contact"
                  className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-teal-200 hover:text-teal-700"
                >
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
