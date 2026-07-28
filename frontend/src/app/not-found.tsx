import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BRAND } from "@/lib/brand";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-50">
      <Header />
      <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
        <p className="text-8xl font-black text-teal-600">404</p>
        <h1 className="mt-4 text-2xl font-black text-slate-900">Page Not Found</h1>
        <p className="mt-3 text-slate-500">
          This page does not exist on {BRAND.name}. Try the homepage or apply flow.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-full bg-teal-600 px-6 py-3 text-sm font-bold text-white shadow-lg"
          >
            Homepage →
          </Link>
          <Link
            href="/apply"
            className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700"
          >
            Apply for Loan
          </Link>
          <Link
            href="/help"
            className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700"
          >
            Help Center
          </Link>
        </div>
      </div>
      <Footer />
    </main>
  );
}
