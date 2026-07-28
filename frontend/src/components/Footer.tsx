import Link from "next/link";
import { BRAND } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-900 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <p className="text-xl font-black text-white">
              Neer <span className="text-teal-400">Loan Solutions</span>
            </p>
            <p className="mt-3 text-sm leading-relaxed text-slate-400">
              India&apos;s smart personal loan marketplace. Compare offers from 15+ partner banks
              &amp; NBFCs — transparent, digital, RBI-compliant.
            </p>
            <div className="mt-4 flex gap-3">
              <Link href="/app" className="rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold hover:bg-slate-700">
                📱 Get App
              </Link>
              <Link href="/refer" className="rounded-lg bg-amber-500/20 px-4 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/30">
                Refer &amp; Earn ₹2000
              </Link>
            </div>
          </div>

          <div>
            <p className="font-bold text-white">Loans</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/loans" className="hover:text-teal-400">All Loan Products</Link></li>
              <li><Link href="/apply" className="hover:text-teal-400">Personal Loan</Link></li>
              <li><Link href="/rates" className="hover:text-teal-400">Interest Rates</Link></li>
              <li><Link href="/#emi-calculator" className="hover:text-teal-400">EMI Calculator</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-bold text-white">Company</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/about" className="hover:text-teal-400">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-teal-400">Contact</Link></li>
              <li><Link href="/partner-with-us" className="hover:text-teal-400">Partner With Us</Link></li>
              <li><Link href="/help" className="hover:text-teal-400">Help Center</Link></li>
            </ul>
          </div>

          <div>
            <p className="font-bold text-white">Legal</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li><Link href="/compliance" className="hover:text-teal-400">RBI LSP Guidelines</Link></li>
              <li><Link href="/compliance" className="hover:text-teal-400">Privacy &amp; DPDP</Link></li>
              <li><Link href="/compliance" className="hover:text-teal-400">Terms of Service</Link></li>
              <li><Link href="/compliance" className="hover:text-teal-400">Grievance</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-8 text-xs text-slate-500">
          <p>© 2026 {BRAND.name}. {BRAND.rbiNote}. We are an LSP — not a lender.</p>
          <p>{BRAND.email} · {BRAND.phone}</p>
        </div>
      </div>
    </footer>
  );
}
