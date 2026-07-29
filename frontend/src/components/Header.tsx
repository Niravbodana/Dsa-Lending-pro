"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback } from "react";
import { NeerCredLogo } from "@/components/NeerCredLogo";
import { IconMenu, IconX, IconSmartphone } from "@/components/icons";

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
    <header className="sticky top-0 z-50 border-b border-slate-200/90 bg-white/98 shadow-sm backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:py-3">
        <Link
          href="/"
          onClick={goHome}
          aria-label="NeerCred — Go to homepage"
          className="flex shrink-0 items-center"
        >
          <NeerCredLogo size={52} className="h-12 w-auto sm:h-14 lg:h-[3.75rem]" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                  active
                    ? "bg-teal-50 text-neercred-teal"
                    : "text-slate-700 hover:bg-slate-50 hover:text-neercred-teal"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/compliance"
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              pathname === "/compliance"
                ? "bg-teal-50 text-neercred-teal"
                : "text-slate-700 hover:bg-slate-50 hover:text-neercred-teal"
            }`}
          >
            Compliance
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/app"
            className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:text-neercred-teal md:flex"
          >
            <IconSmartphone size={14} /> App
          </Link>
          <Link
            href="/apply"
            className="rounded-full bg-neercred-cta px-5 py-2.5 text-sm font-bold text-white shadow-neercred transition hover:brightness-110"
          >
            Apply Now
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100 lg:hidden"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <IconX size={22} /> : <IconMenu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-slate-100 bg-white px-4 py-4 lg:hidden" aria-label="Mobile navigation">
          <div className="flex flex-col gap-1">
            <Link
              href="/"
              onClick={goHome}
              className="rounded-lg px-3 py-2.5 text-sm font-semibold text-neercred-teal hover:bg-slate-50"
            >
              Home
            </Link>
            {[...navLinks, { href: "/compliance", label: "Compliance" }, { href: "/security", label: "Security" }].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-neercred-teal"
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
