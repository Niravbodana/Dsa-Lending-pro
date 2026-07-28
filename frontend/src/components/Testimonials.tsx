import Image from "next/image";

const testimonials = [
  {
    name: "Ananya Gupta",
    city: "Delhi",
    amount: "₹4,50,000",
    quote:
      "Wedding ke liye loan chahiye tha. DSA Lending Pro pe 4 minute mein 3 offers mile — HDFC se 11.2% pe liya. Bohot easy!",
    rating: 5,
    image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=faces",
  },
  {
    name: "Rohit Verma",
    city: "Bangalore",
    amount: "₹2,80,000",
    quote:
      "Medical emergency thi. Same day approval mila Bajaj se. Koi agent nahi, koi hidden charge nahi. Sach mein game changer.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces",
  },
  {
    name: "Sneha Reddy",
    city: "Hyderabad",
    amount: "₹5,00,000",
    quote:
      "Home renovation ke liye compare kiya sab offers. ICICI se liya — sabse kam EMI thi. Highly recommend!",
    rating: 5,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=faces",
  },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center">
          <span className="rounded-full bg-amber-50 px-4 py-1 text-sm font-bold text-amber-600">
            REAL STORIES
          </span>
          <h2 className="mt-4 text-4xl font-black text-slate-900">
            50,000+ Indians Ne <span className="text-teal-600">Bharosa Kiya</span>
          </h2>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-3xl border border-slate-100 bg-slate-50 p-8 transition hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="flex items-center gap-4">
                <Image
                  src={t.image}
                  alt={t.name}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full object-cover ring-4 ring-teal-100"
                />
                <div>
                  <p className="font-bold text-slate-900">{t.name}</p>
                  <p className="text-sm text-slate-500">{t.city}</p>
                </div>
                <div className="ml-auto text-amber-400">
                  {"★".repeat(t.rating)}
                </div>
              </div>
              <p className="mt-6 text-slate-600 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-4 text-sm font-bold text-teal-600">Loan: {t.amount}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
