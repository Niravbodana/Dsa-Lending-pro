import Link from "next/link";
import { PremiumLogo } from "@/components/premium/brand/PremiumLogo";
import { premiumContent } from "@/lib/premium/content";

export function PremiumFooter() {
  const { footer, brand } = premiumContent;

  return (
    <footer className="border-t border-slate-800 bg-[#060912] text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <PremiumLogo variant="full" height={52} />
            <p className="mt-4 max-w-sm text-sm leading-relaxed">
              <span className="font-medium text-teal-400">{brand.tagline}</span>
              {" — "}
              {brand.subtagline}. RBI LSP registered marketplace.
            </p>
          </div>

          {footer.columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">{col.title}</h3>
              <ul className="mt-4 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm transition hover:text-teal-400">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 text-xs sm:flex-row">
          <p>© {new Date().getFullYear()} NeerCred · Neer Loan Solutions. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/compliance" className="hover:text-teal-400">Privacy</Link>
            <Link href="/compliance" className="hover:text-teal-400">Terms</Link>
            <Link href="/security" className="hover:text-teal-400">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
