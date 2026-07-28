"use client";

import Link from "next/link";
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

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5">
        <Link href="/" className="flex items-center" onClick={() => setMenuOpen(false)}>
          <NeerCredLogo size={40} />
        </Link>

        <nav className="hidden items-center gap-5 xl:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition hover:text-teal-700"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/compliance" className="text-sm font-medium text-slate-600 transition hover:text-teal-700">
            Compliance
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/app"
            className="hidden items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 hover:text-teal-700 md:flex"
          >
            <IconSmartphone size={14} /> App
          </Link>
          <Link
            href="/apply"
            className="rounded-full bg-slate-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg transition hover:bg-slate-800 sm:px-5"
          >
            Apply Now
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 xl:hidden"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <IconX size={22} /> : <IconMenu size={22} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-slate-100 bg-white px-4 py-4 xl:hidden">
          <div className="flex flex-col gap-1">
            {[...navLinks, { href: "/compliance", label: "Compliance" }, { href: "/security", label: "Security" }, { href: "/refer", label: "Refer & Earn" }].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
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
