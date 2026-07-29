import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { LenderLogo } from "@/components/LenderLogo";
import { getPublicPartners } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function PartnersPage() {
  let partners: Awaited<ReturnType<typeof getPublicPartners>> = [];
  try {
    partners = await getPublicPartners();
  } catch {
    partners = [];
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Header />
      <div className="mx-auto max-w-6xl px-4 py-16">
        <h1 className="text-4xl font-black text-slate-900">Our Lending Partners</h1>
        <p className="mt-3 max-w-2xl text-slate-600">
          NeerCred se judi regulated banks aur NBFCs — har partner ke liye alag page, rates, aur
          required documents.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {partners.map((p) => (
            <Link
              key={p.partner_id}
              href={`/partners/${p.page_slug}`}
              className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <LenderLogo name={p.lender_logo} className="h-10 w-24" />
              <h2 className="mt-4 text-xl font-bold text-slate-900">{p.lender_name}</h2>
              <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                {p.page_description || "Compare personal loan offers digitally."}
              </p>
              <p className="mt-4 text-sm font-bold text-teal-600">
                From {p.mock_interest_rate}% p.a. →
              </p>
            </Link>
          ))}
        </div>
      </div>
      <Footer />
    </main>
  );
}
