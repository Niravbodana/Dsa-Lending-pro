"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useCallback } from "react";
import { NeerCredLogo } from "@/components/NeerCredLogo";
import { BRAND } from "@/lib/brand";
import { IconMenu, IconX, IconSmartphone } from "@/components/icons";

const navLinks = [
  { href: "/loans", label: "Loans" },
  { href: "/rates", label: "Rates" },
  { href: "/platform", label: "Platform" },
  { href: "/about", label: "About" },
  { href: "/help", label: "Help" },
  { href: "/track", label: "Track" },
  { href: "/dashboard", label: "Dashboard" },
];

/** Matches the cream tone baked into neercred-logo-lockup.png */
const LOGO_BAY_BG = BRAND.colors.logoBay;

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
    <header className="sticky top-0 z-50 shadow-[0_10px_40px_rgba(11,18,32,0.35)]">
      <div className="flex items-stretch">
        {/* Logo bay — same cream as lockup PNG, no white card */}
        <Link
          href="/"
          onClick={goHome}
          aria-label="NeerCred — Go to homepage"
          className="group relative flex shrink-0 items-center transition-colors hover:bg-[#faf8f3]"
          style={{ backgroundColor: LOGO_BAY_BG }}
        >
          <span
            className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-r from-transparent to-neercred-navy sm:w-14"
            aria-hidden
          />
          <NeerCredLogo className="relative z-[1] h-[60px] w-auto px-4 py-2 sm:h-[74px] sm:px-6 sm:py-2.5 lg:h-[84px] lg:px-8" />
        </Link>

        {/* Navy navigation bay */}
        <div className="flex min-w-0 flex-1 flex-col bg-neercred-navy">
          <div className="flex flex-1 items-center justify-between gap-2 px-3 py-2 sm:gap-4 sm:px-5 lg:py-2.5">
            <nav className="hidden items-center gap-0.5 lg:flex xl:gap-1" aria-label="Main navigation">
              {navLinks.map((link) => {
                const active = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-lg px-2.5 py-2 text-[13px] font-semibold tracking-wide transition-all xl:px-3.5 xl:text-sm ${
                      active
                        ? "bg-neercred-gold/20 text-neercred-gold ring-1 ring-neercred-gold/35"
                        : "text-white hover:bg-white/10 hover:text-neercred-gold"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/compliance"
                className={`rounded-lg px-2.5 py-2 text-[13px] font-semibold tracking-wide transition-all xl:px-3.5 xl:text-sm ${
                  pathname === "/compliance"
                    ? "bg-neercred-gold/20 text-neercred-gold ring-1 ring-neercred-gold/35"
                    : "text-white hover:bg-white/10 hover:text-neercred-gold"
                }`}
              >
                Compliance
              </Link>
            </nav>

            <div className="ml-auto flex items-center gap-2 sm:gap-3 lg:ml-0">
              <Link
                href="/app"
                className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-white/85 transition hover:bg-white/10 hover:text-white md:flex"
              >
                <IconSmartphone size={14} /> App
              </Link>
              <Link
                href="/apply"
                className="rounded-full bg-gradient-to-r from-neercred-gold via-amber-400 to-amber-500 px-4 py-2.5 text-xs font-bold text-neercred-navy shadow-lg shadow-black/25 transition hover:brightness-110 sm:px-6 sm:text-sm"
              >
                Apply Now
              </Link>
              <button
                type="button"
                className="rounded-lg p-2 text-white hover:bg-white/10 lg:hidden"
                aria-label="Toggle menu"
                onClick={() => setMenuOpen((open) => !open)}
              >
                {menuOpen ? <IconX size={22} /> : <IconMenu size={22} />}
              </button>
            </div>
          </div>

          {menuOpen && (
            <nav className="border-t border-white/10 px-4 py-4 lg:hidden" aria-label="Mobile navigation">
              <div className="flex flex-col gap-1">
                <Link
                  href="/"
                  onClick={goHome}
                  className="rounded-lg px-3 py-2.5 text-sm font-semibold text-neercred-gold hover:bg-white/5"
                >
                  Home
                </Link>
                {[...navLinks, { href: "/compliance", label: "Compliance" }, { href: "/security", label: "Security" }].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/90 hover:bg-white/5 hover:text-neercred-gold"
                    onClick={() => setMenuOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>
          )}
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-neercred-gold/30 via-neercred-gold/60 to-transparent" />
    </header>
  );
}
