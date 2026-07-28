import Link from "next/link";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 text-lg font-bold text-white">
            D
          </div>
          <div>
            <p className="text-lg font-bold text-slate-900">DSA Lending Pro</p>
            <p className="text-xs text-slate-500">Personal Loan Marketplace</p>
          </div>
        </Link>
        <Link
          href="/apply"
          className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-teal-600/20 transition hover:bg-teal-700"
        >
          Check Eligibility
        </Link>
      </div>
    </header>
  );
}
