import Link from "next/link";
import { BRAND } from "@/lib/brand";

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-6">
          <div className="lg:col-span-2">
            <p className="text-xl font-black text-white">
              Neer <span className="text-teal-400">Loan Solutions</span>
            </p>
            <p className="mt-3 text-sm leading-relaxed">
              India&apos;s premium personal loan marketplace. Compare offers from 15+ regulated
              partner banks and NBFCs.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href="/apply" className="rounded-lg bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-500">
                Apply Now
              </Link>
              <Link href="/partner-with-us" className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold hover:border-slate-500">
                Partner With Us
              </Link>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Products</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/loans" className="hover:text-white">Loan Products</Link></li>
              <li><Link href="/rates" className="hover:text-white">Interest Rates</Link></li>
              <li><Link href="/#emi-calculator" className="hover:text-white">EMI Calculator</Link></li>
              <li><Link href="/refer" className="hover:text-white">Refer &amp; Earn</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Company</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/about" className="hover:text-white">About</Link></li>
              <li><Link href="/platform" className="hover:text-white">Platform</Link></li>
              <li><Link href="/security" className="hover:text-white">Security</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link href="/help" className="hover:text-white">Help Center</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Legal</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              <li><Link href="/compliance" className="hover:text-white">RBI LSP</Link></li>
              <li><Link href="/compliance" className="hover:text-white">Privacy &amp; DPDP</Link></li>
              <li><Link href="/compliance" className="hover:text-white">Terms</Link></li>
              <li><Link href="/compliance" className="hover:text-white">Grievance</Link></li>
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-300">Contact</p>
            <ul className="mt-4 space-y-2 text-sm">
              <li>{BRAND.phone}</li>
              <li>{BRAND.email}</li>
              <li className="text-xs leading-relaxed">{BRAND.address}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800 pt-8 text-xs">
          <p>© 2026 {BRAND.name}. {BRAND.rbiNote}. We are an LSP — not a lender.</p>
          <p className="text-slate-500">Licensed marketplace · Regulated partners only</p>
        </div>
      </div>
    </footer>
  );
}
