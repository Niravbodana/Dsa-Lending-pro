import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { InnerHero } from "@/components/InnerHero";
import { BRAND } from "@/lib/brand";

export const metadata = { title: `Contact Us | ${BRAND.name}` };

export default function ContactPage() {
  return (
    <PageShell>
      <InnerHero
        badge="CONTACT"
        title="Get in Touch"
        subtitle="Have a question? We're here — call, email, or WhatsApp us."
        image="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=1920&h=600&fit=crop"
      />
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <h2 className="text-xl font-black text-slate-900">Contact Information</h2>
            <ul className="mt-6 space-y-4 text-slate-600">
              <li>
                <p className="font-semibold text-slate-900">Phone</p>
                <p>{BRAND.phone}</p>
              </li>
              <li>
                <p className="font-semibold text-slate-900">Email</p>
                <p>{BRAND.email}</p>
              </li>
              <li>
                <p className="font-semibold text-slate-900">Address</p>
                <p>{BRAND.address}</p>
              </li>
              <li>
                <p className="font-semibold text-slate-900">Hours</p>
                <p>Mon–Sat, 9 AM – 7 PM IST</p>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-lg">
            <h2 className="text-xl font-black text-slate-900">Send a Message</h2>
            <form className="mt-6 space-y-4">
              <input
                type="text"
                placeholder="Your Name"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
              />
              <input
                type="email"
                placeholder="Email Address"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
              />
              <textarea
                placeholder="Your Message"
                rows={4}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
              />
              <button
                type="button"
                className="w-full rounded-xl bg-teal-600 py-3 font-bold text-white hover:bg-teal-700"
              >
                Send Message
              </button>
            </form>
            <p className="mt-4 text-sm text-slate-500">We&apos;ll respond within 24 hours.</p>
          </div>
        </div>

        <div className="mt-12 rounded-2xl bg-teal-50 p-8 text-center">
          <p className="font-bold text-teal-800">Need urgent loan help?</p>
          <Link href="/apply" className="mt-4 inline-block rounded-xl bg-teal-600 px-8 py-3 font-bold text-white">
            Apply Now →
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
