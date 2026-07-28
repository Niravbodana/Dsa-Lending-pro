"use client";

import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { InnerHero } from "@/components/InnerHero";
import { BRAND } from "@/lib/brand";

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", mobile: "", message: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <PageShell>
      <InnerHero
        badge="24/7 SUPPORT"
        title="Contact Us"
        subtitle="Koi sawal hai? Hum yahan hain — call, email, ya WhatsApp pe."
      />
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-6">
            {[
              { icon: "📧", label: "Email", value: BRAND.email },
              { icon: "📞", label: "Phone", value: BRAND.phone },
              { icon: "💬", label: "WhatsApp", value: BRAND.phone },
              { icon: "📍", label: "Office", value: BRAND.address },
            ].map((c) => (
              <div key={c.label} className="flex gap-4 rounded-2xl bg-white p-6 shadow">
                <span className="text-2xl">{c.icon}</span>
                <div>
                  <p className="font-bold text-slate-900">{c.label}</p>
                  <p className="text-sm text-slate-600">{c.value}</p>
                </div>
              </div>
            ))}
            <div className="rounded-2xl bg-teal-50 p-6">
              <p className="font-bold text-teal-800">Business Hours</p>
              <p className="mt-2 text-sm text-teal-700">Mon – Sat: 9:00 AM – 7:00 PM IST</p>
              <p className="text-sm text-teal-700">Sunday: Email support only</p>
            </div>
          </div>

          <div className="rounded-2xl bg-white p-8 shadow-lg">
            {sent ? (
              <div className="text-center py-12">
                <p className="text-5xl">✅</p>
                <p className="mt-4 text-xl font-bold">Message Sent!</p>
                <p className="mt-2 text-slate-500">Hum 24 hours mein reply karenge.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <h2 className="text-xl font-bold">Send Message</h2>
                <input
                  placeholder="Your Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-xl border px-4 py-3 outline-none focus:border-teal-500"
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-xl border px-4 py-3 outline-none focus:border-teal-500"
                  required
                />
                <input
                  placeholder="Mobile (10 digits)"
                  value={form.mobile}
                  onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                  className="w-full rounded-xl border px-4 py-3 outline-none focus:border-teal-500"
                  required
                />
                <textarea
                  placeholder="Your message..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={4}
                  className="w-full rounded-xl border px-4 py-3 outline-none focus:border-teal-500"
                  required
                />
                <button
                  type="submit"
                  className="w-full rounded-xl bg-teal-600 py-3 font-bold text-white hover:bg-teal-700"
                >
                  Send Message →
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
