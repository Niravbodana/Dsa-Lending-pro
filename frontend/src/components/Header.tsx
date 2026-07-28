import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-600 text-lg font-black text-white shadow-lg shadow-teal-600/30">
            D
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-amber-400 ring-2 ring-white" />
          </div>
          <div>
            <p className="text-lg font-extrabold tracking-tight text-slate-900">
              DSA Lending <span className="text-teal-600">Pro</span>
            </p>
            <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
              India&apos;s Smart Loan Marketplace
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <a href="#how-it-works" className="text-sm font-medium text-slate-600 transition hover:text-teal-600">
            Process
          </a>
          <a href="#emi-calculator" className="text-sm font-medium text-slate-600 transition hover:text-teal-600">
            EMI Calculator
          </a>
          <a href="#testimonials" className="text-sm font-medium text-slate-600 transition hover:text-teal-600">
            Reviews
          </a>
          <a href="#faq" className="text-sm font-medium text-slate-600 transition hover:text-teal-600">
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="hidden rounded-lg px-3 py-2 text-xs font-medium text-slate-400 transition hover:text-slate-600 sm:block"
          >
            Admin
          </Link>
          <Link
            href="/apply"
            className="rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-600/25 transition hover:scale-105 hover:shadow-xl"
          >
            Apply Now →
          </Link>
        </div>
      </div>
    </header>
  );
}
