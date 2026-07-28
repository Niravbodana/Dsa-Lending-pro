"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { NeerCredLogo } from "@/components/NeerCredLogo";
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

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-neercred-navy/97 shadow-[0_8px_32px_rgba(11,18,32,0.35)] backdrop-blur-xl">
      <div className="h-px bg-gradient-to-r from-transparent via-neercred-gold/50 to-transparent" />

      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2 lg:gap-6 lg:py-2.5">
        <Link href="/" className="flex shrink-0 items-center" onClick={() => setMenuOpen(false)}>
          <NeerCredLogo size={68} className="rounded-xl bg-white/95 px-2.5 py-1 shadow-sm" />
        </Link>

        <nav className="hidden items-center gap-0.5 xl:flex">
          {navLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-lg px-3.5 py-2 text-[13px] font-semibold tracking-wide transition ${
                  active
                    ? "bg-white/10 text-neercred-gold"
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <Link
            href="/compliance"
            className="rounded-lg px-3.5 py-2 text-[13px] font-semibold tracking-wide text-slate-300 transition hover:bg-white/5 hover:text-white"
          >
            Compliance
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/app"
            className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-400 transition hover:bg-white/5 hover:text-white md:flex"
          >
            <IconSmartphone size={14} /> App
          </Link>
          <Link
            href="/apply"
            className="rounded-full bg-gradient-to-r from-neercred-gold to-amber-500 px-5 py-2.5 text-sm font-bold text-neercred-navy shadow-lg shadow-amber-900/25 transition hover:brightness-110 sm:px-6"
          >
            Apply Now
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-300 hover:bg-white/10 hover:text-white xl:hidden"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <IconX size={22} /> : <IconMenu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-white/10 bg-neercred-navy px-4 py-4 xl:hidden">
          <div className="flex flex-col gap-1">
            {[...navLinks, { href: "/compliance", label: "Compliance" }, { href: "/security", label: "Security" }, { href: "/refer", label: "Refer & Earn" }].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200 hover:bg-white/5 hover:text-neercred-gold"
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
