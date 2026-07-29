import Image from "next/image";
import { ScrollReveal, ScrollRevealAlternate } from "@/components/ScrollReveal";
import { IconCheckCircle, IconStar } from "@/components/icons";
import { HERO_REVIEWS } from "@/lib/hero-reviews";

const testimonials = HERO_REVIEWS.map((r) => ({
  name: r.name,
  city: `${r.city} · ${r.role}`,
  amount: r.loan,
  purpose: r.role.split("·")[0]?.trim() || "Business loan",
  date: "2026",
  quote: r.quote,
  rating: 5,
  image: r.image.replace("600&h=750", "200&h=200"),
}));

export function Testimonials() {
  return (
    <section id="testimonials" className="bg-gradient-to-b from-slate-50 to-white py-24">
      <div className="mx-auto max-w-7xl px-4">
        <ScrollReveal variant="up" className="text-center">
          <span className="rounded-full bg-teal-50 px-4 py-1 text-sm font-bold text-teal-700">
            Business Professionals
          </span>
          <h2 className="mt-4 text-4xl font-black text-slate-900">
            Trusted by <span className="text-teal-600">Working India</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Salaried leaders, founders, and business owners — real stories from across India.
          </p>
        </ScrollReveal>
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <ScrollRevealAlternate key={t.name} index={i} delay={i * 80}>
              <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg transition hover:-translate-y-2 hover:shadow-2xl">
                <div className="relative h-36 bg-gradient-to-br from-slate-800 to-teal-800">
                  <Image
                    src={t.image}
                    alt={t.name}
                    width={120}
                    height={120}
                    className="absolute -bottom-12 left-8 h-24 w-24 rounded-2xl object-cover ring-4 ring-white shadow-xl"
                  />
                  <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-teal-700">
                    <IconCheckCircle size={12} />
                    Verified
                  </span>
                </div>
                <div className="flex flex-1 flex-col px-8 pb-8 pt-16">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">{t.name}</p>
                      <p className="text-sm text-slate-500">{t.city}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-0.5 text-amber-500">
                        <IconStar size={14} className="fill-current" />
                        <span className="text-sm font-bold text-slate-800">{t.rating}.0</span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 flex-1 leading-relaxed text-slate-600">&ldquo;{t.quote}&rdquo;</p>
                  <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                    <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">
                      {t.purpose}
                    </span>
                    <span className="text-sm font-bold text-teal-600">Loan: {t.amount}</span>
                  </div>
                </div>
              </div>
            </ScrollRevealAlternate>
          ))}
        </div>
      </div>
    </section>
  );
}
