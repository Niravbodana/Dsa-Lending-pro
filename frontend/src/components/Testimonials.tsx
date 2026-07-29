import Image from "next/image";
import { ScrollReveal, ScrollRevealAlternate } from "@/components/ScrollReveal";
import { IconCheckCircle, IconStar } from "@/components/icons";
import { INDIAN_IMAGES } from "@/lib/indian-images";

const testimonials = [
  {
    name: "Priya Sharma",
    city: "Pune, Maharashtra",
    amount: "₹3,20,000",
    purpose: "Wedding expenses",
    date: "June 2026",
    quote:
      "Meri shaadi ke liye urgent funds chahiye the. Teen lenders ka offer ek hi jagah mila — ICICI ka EMI sabse kam tha. Ghar baithe Aadhaar KYC ho gayi, do din mein paise account mein aa gaye. Sach mein tension-free experience tha.",
    rating: 5,
    image: INDIAN_IMAGES.testimonials.priya,
  },
  {
    name: "Arjun Menon",
    city: "Kochi, Kerala",
    amount: "₹1,85,000",
    purpose: "Medical emergency",
    date: "May 2026",
    quote:
      "Papa ki surgery ke liye raat ko apply kiya. Subah tak HDFC se approval mil gaya. Koi hidden charge nahi tha — jo EMI calculator pe dikha, wahi final hua. Hospital bill time pe clear ho gaya.",
    rating: 5,
    image: INDIAN_IMAGES.testimonials.arjun,
  },
  {
    name: "Kavita Joshi",
    city: "Jaipur, Rajasthan",
    amount: "₹4,75,000",
    purpose: "Shop expansion",
    date: "April 2026",
    quote:
      "Apni boutique ke liye working capital chahiye tha. Bajaj aur ICICI dono ke offers compare kiye, customer care ne Hindi mein poora samjhaya. Paperless process tha — branch gaye bina loan mil gaya.",
    rating: 4.9,
    image: INDIAN_IMAGES.testimonials.kavita,
  },
  {
    name: "Rahul Das",
    city: "Kolkata, West Bengal",
    amount: "₹2,40,000",
    purpose: "Home renovation",
    date: "March 2026",
    quote:
      "Ghar ke renovation ke liye loan liya. Rates clearly likhe the, processing fee upfront batayi gayi thi. Track page se status check karte rahe — har step pe SMS bhi aaya. Genuine platform lagta hai.",
    rating: 5,
    image: INDIAN_IMAGES.testimonials.rahul,
  },
  {
    name: "Meera Iyer",
    city: "Chennai, Tamil Nadu",
    amount: "₹5,50,000",
    purpose: "Child's education",
    date: "February 2026",
    quote:
      "Betey ki foreign university fees ke liye apply kiya. Multiple offers milne se humne tenure choose karke EMI manage ki. Documentation simple thi — PAN, bank statement, bas. Highly recommend for parents.",
    rating: 4.8,
    image: INDIAN_IMAGES.testimonials.meera,
  },
  {
    name: "Vikram Singh",
    city: "Indore, Madhya Pradesh",
    amount: "₹1,60,000",
    purpose: "Family travel",
    date: "January 2026",
    quote:
      "Europe trip ke liye personal loan liya. 10 minute mein eligibility clear ho gayi, offers screen par side-by-side compare kiye. Disbursal 36 ghante ke andar — trip cancel nahi karna pada.",
    rating: 5,
    image: INDIAN_IMAGES.testimonials.vikram,
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="bg-gradient-to-b from-slate-50 to-white py-24">
      <div className="mx-auto max-w-7xl px-4">
        <ScrollReveal variant="up" className="text-center">
          <span className="rounded-full bg-teal-50 px-4 py-1 text-sm font-bold text-teal-700">
            Real Customer Stories
          </span>
          <h2 className="mt-4 text-4xl font-black text-slate-900">
            Bharat Bhar Ke <span className="text-teal-600">Vishwas</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-slate-600">
            Verified reviews from customers across India — wedding, medical, business, and everyday goals.
          </p>
        </ScrollReveal>
        <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((t, i) => (
            <ScrollRevealAlternate key={t.name} index={i} delay={i * 80}>
              <div className="flex h-full flex-col overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-lg transition hover:-translate-y-2 hover:shadow-2xl">
                <div className="relative h-32 bg-gradient-to-br from-neercred-navy to-neercred-teal">
                  <Image
                    src={t.image}
                    alt={`${t.name} from ${t.city}`}
                    width={80}
                    height={80}
                    className="absolute -bottom-10 left-8 h-20 w-20 rounded-2xl object-cover ring-4 ring-white shadow-lg"
                  />
                  <span className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-teal-700">
                    <IconCheckCircle size={12} />
                    Verified
                  </span>
                </div>
                <div className="flex flex-1 flex-col px-8 pb-8 pt-14">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-900">{t.name}</p>
                      <p className="text-sm text-slate-500">{t.city}</p>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-0.5 text-amber-500">
                        <IconStar size={14} className="fill-current" />
                        <span className="text-sm font-bold text-slate-800">{t.rating}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{t.date}</p>
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
