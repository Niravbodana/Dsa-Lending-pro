"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback } from "react";
import { NeerCredLogo } from "@/components/NeerCredLogo";
import { IconMenu, IconX, IconSmartphone } from "@/components/icons";
import { REF } from "@/lib/reference-theme";

const navLinks = [
  { href: "/loans", label: "Loans" },
  { href: "/rates", label: "Rates" },
  { href: "/platform", label: "Platform" },
  { href: "/about", label: "About Us" },
  { href: "/help", label: "Help" },
  { href: "/track", label: "Track Loan" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const goHome = useCallback(() => {
    setMenuOpen(false);
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2.5 lg:gap-3 lg:py-3">
        <Link href="/" onClick={goHome} aria-label="NeerCred — Go to homepage" className="shrink-0">
          <NeerCredLogo variant="header" className="h-[4.5rem] w-auto max-w-[230px] sm:h-[4.75rem]" />
        </Link>

        <nav className="hidden items-center xl:flex" aria-label="Main navigation">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-2.5 py-2 text-[13px] font-semibold transition lg:px-3 lg:text-sm"
                style={{ color: active ? REF.teal : "#334155" }}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/app"
            className="hidden items-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 md:inline-flex"
          >
            <IconSmartphone size={16} />
            Download App
          </Link>
          <Link
            href="/apply"
            className="rounded-full px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
            style={{ backgroundColor: REF.teal }}
          >
            Apply Now &gt;
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 xl:hidden"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <IconX size={22} /> : <IconMenu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-slate-100 bg-white px-4 py-4 xl:hidden" aria-label="Mobile navigation">
          <div className="flex flex-col gap-1">
            <Link href="/" onClick={goHome} className="rounded-lg px-3 py-2.5 text-sm font-semibold" style={{ color: REF.teal }}>
              Home
            </Link>
            {[...navLinks, { href: "/app", label: "Download App" }].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
