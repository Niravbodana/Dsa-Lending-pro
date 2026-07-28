import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { InnerHero } from "@/components/InnerHero";
import { BRAND } from "@/lib/brand";

export const metadata = { title: `Interest Rates & Charges | ${BRAND.name}` };

const rateTable = [
  { lender: "HDFC Bank", min: "10.99%", max: "14.99%", fee: "Up to 2%", tenure: "12–60 mo" },
  { lender: "ICICI Bank", min: "11.49%", max: "15.49%", fee: "1.5%", tenure: "12–60 mo" },
  { lender: "Bajaj Finserv", min: "12.99%", max: "16.99%", fee: "2.5%", tenure: "12–60 mo" },
  { lender: "Tata Capital", min: "13.25%", max: "17.25%", fee: "2%", tenure: "12–48 mo" },
  { lender: "Axis Bank", min: "11.75%", max: "15.75%", fee: "2%", tenure: "12–48 mo" },
  { lender: "Neo Finance NBFC", min: "14.49%", max: "18.49%", fee: "3%", tenure: "6–36 mo" },
];

const charges = [
  { name: "Processing Fee", value: "1% – 3% of loan amount", note: "Varies by lender" },
  { name: "GST on Processing", value: "18% on processing fee", note: "As per govt norms" },
  { name: "Foreclosure Charges", value: "0% – 4%", note: "Many partners offer zero foreclosure" },
  { name: "Late Payment Penalty", value: "2% per month on overdue EMI", note: "Set by lender" },
  { name: "Bounce Charges", value: "₹500 – ₹750 per instance", note: "If EMI bounces" },
  { name: "Stamp Duty", value: "As per state laws", note: "On loan agreement" },
];

export default function RatesPage() {
  return (
    <PageShell>
      <InnerHero
        badge="TRANSPARENT PRICING"
        title="Interest Rates & Charges"
        subtitle="No hidden charges — everything in a clear, transparent table."
      />
      <div className="mx-auto max-w-5xl px-4 py-16">
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg">
          <div className="bg-teal-600 px-6 py-4">
            <h2 className="text-lg font-bold text-white">Partner Lender Rates</h2>
            <p className="text-sm text-teal-100">Rates as of 2026 — subject to change per lender policy</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-6 py-4">Lender</th>
                  <th className="px-6 py-4">Min ROI</th>
                  <th className="px-6 py-4">Max ROI</th>
                  <th className="px-6 py-4">Processing Fee</th>
                  <th className="px-6 py-4">Tenure</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rateTable.map((r) => (
                  <tr key={r.lender} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-semibold">{r.lender}</td>
                    <td className="px-6 py-4 text-green-600 font-bold">{r.min}</td>
                    <td className="px-6 py-4">{r.max}</td>
                    <td className="px-6 py-4">{r.fee}</td>
                    <td className="px-6 py-4">{r.tenure}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <h2 className="mt-12 text-2xl font-black">Other Charges</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {charges.map((c) => (
            <div key={c.name} className="rounded-2xl border bg-white p-5 shadow-sm">
              <p className="font-bold text-slate-900">{c.name}</p>
              <p className="mt-1 text-teal-600 font-semibold">{c.value}</p>
              <p className="mt-1 text-xs text-slate-400">{c.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 rounded-2xl bg-amber-50 p-6 text-center">
          <p className="font-bold text-amber-900">Your exact rate depends on your profile</p>
          <p className="mt-2 text-sm text-amber-800">
            Apply now — get personalized offers in 2 minutes
          </p>
          <Link href="/apply" className="mt-4 inline-block rounded-xl bg-amber-500 px-8 py-3 font-bold text-slate-900">
            Get My Rate →
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
