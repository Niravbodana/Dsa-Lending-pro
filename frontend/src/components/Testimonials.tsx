import Image from "next/image";
import { ScrollReveal, ScrollRevealAlternate } from "@/components/ScrollReveal";

const testimonials = [
  {
    name: "Ananya Gupta",
    city: "Delhi",
    amount: "₹4,50,000",
    quote:
      "The platform made it simple to compare three lender offers and complete KYC without visiting a branch.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=faces",
  },
  {
    name: "Rohit Verma",
    city: "Bengaluru",
    amount: "₹2,80,000",
    quote:
      "Medical emergency funding with clear terms and timely disbursal. Professional experience throughout.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces",
  },
  {
    name: "Sneha Reddy",
    city: "Hyderabad",
    amount: "₹5,00,000",
    quote:
      "Compared offers for home renovation and selected the most suitable EMI structure. Highly recommend.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="bg-gradient-to-b from-slate-50 to-white py-24">
      <div className="mx-auto max-w-7xl px-4">
        <ScrollReveal variant="up" className="text-center">
          <span className="rounded-full bg-teal-50 px-4 py-1 text-sm font-bold text-teal-700">
            Client Stories
          </span>
          <h2 className="mt-4 text-4xl font-black text-slate-900">
            Trusted Across <span className="text-teal-600">India</span>
          </h2>
        </ScrollReveal>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <ScrollRevealAlternate key={t.name} index={i} delay={i * 120}>
              <div className="h-full overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg transition hover:-translate-y-2 hover:shadow-2xl">
                <div className="relative h-32 bg-gradient-to-br from-neercred-navy to-neercred-teal">
                  <Image
                    src={t.image}
                    alt={t.name}
                    width={80}
                    height={80}
                    className="absolute -bottom-10 left-8 h-20 w-20 rounded-2xl object-cover ring-4 ring-white shadow-lg"
                  />
                </div>
                <div className="px-8 pb-8 pt-14">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{t.name}</p>
                      <p className="text-sm text-slate-500">{t.city}</p>
                    </div>
                    <div className="text-sm font-semibold text-neercred-gold">{t.rating}.0</div>
                  </div>
                  <p className="mt-4 leading-relaxed text-slate-600">&ldquo;{t.quote}&rdquo;</p>
                  <p className="mt-4 text-sm font-bold text-teal-600">Loan: {t.amount}</p>
                </div>
              </div>
            </ScrollRevealAlternate>
          ))}
        </div>
      </div>
    </section>
  );
}
