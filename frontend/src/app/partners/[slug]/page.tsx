import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LenderLogo } from "@/components/LenderLogo";
import { getPublicPartner } from "@/lib/api";

type Props = { params: Promise<{ slug: string }> };

export default async function PartnerDetailPage({ params }: Props) {
  const { slug } = await params;
  let partner: Awaited<ReturnType<typeof getPublicPartner>>;
  try {
    partner = await getPublicPartner(slug);
  } catch {
    notFound();
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Header />
      <div className="mx-auto max-w-4xl px-4 py-16">
        <Link href="/partners" className="text-sm font-semibold text-teal-600 hover:underline">
          ← All partners
        </Link>
        <div className="mt-8 rounded-3xl border border-slate-100 bg-white p-8 shadow-lg">
          <LenderLogo name={partner.lender_logo} className="h-12 w-28" />
          <h1 className="mt-6 text-3xl font-black text-slate-900">
            {partner.page_title || `${partner.lender_name} Personal Loans`}
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            {partner.page_description ||
              `Apply for a personal loan with ${partner.lender_name} through NeerCred.`}
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-teal-50 p-4 text-center">
              <p className="text-2xl font-black text-teal-700">{partner.mock_interest_rate}%</p>
              <p className="text-xs text-slate-500">Starting ROI</p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4 text-center">
              <p className="text-2xl font-black text-slate-800">{partner.mock_tenure_months}</p>
              <p className="text-xs text-slate-500">Max tenure (months)</p>
            </div>
            <div className="rounded-2xl bg-amber-50 p-4 text-center">
              <p className="text-lg font-bold text-amber-800">{partner.mock_processing_fee}</p>
              <p className="text-xs text-slate-500">Processing fee</p>
            </div>
          </div>

          {partner.mock_features.length > 0 && (
            <ul className="mt-8 space-y-2">
              {partner.mock_features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-slate-700">
                  <span className="text-teal-600">✓</span> {f}
                </li>
              ))}
            </ul>
          )}

          <div className="mt-10 rounded-2xl border border-slate-100 bg-slate-50 p-6">
            <h2 className="font-bold text-slate-900">Documents & details required</h2>
            <p className="mt-1 text-sm text-slate-500">
              Ye fields apply flow mein collect hoti hain jab aap is lender ka offer choose karte hain:
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {partner.required_fields.map((f) => (
                <span
                  key={f.key}
                  className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm"
                >
                  {f.label}
                </span>
              ))}
            </div>
          </div>

          <Link
            href={`/apply?partner=${partner.page_slug || slug}`}
            className="mt-10 inline-block rounded-2xl bg-gradient-to-r from-teal-600 to-cyan-600 px-10 py-4 text-lg font-bold text-white shadow-lg"
          >
            Apply with {partner.lender_name}
          </Link>
          <p className="mt-3 text-sm text-slate-500">
            NeerCred par verify karo — phir {partner.lender_name} par details auto-fill ho jayengi.
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}
