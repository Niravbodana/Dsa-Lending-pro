"use client";

import Link from "next/link";
import { useState } from "react";
import { BRAND } from "@/lib/brand";

const navLinks = [
  { href: "/loans", label: "Loans" },
  { href: "/rates", label: "Rates" },
  { href: "/about", label: "About" },
  { href: "/help", label: "Help" },
  { href: "/track", label: "Track" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/compliance", label: "Compliance" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/60 bg-white/90 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-3" onClick={() => setMenuOpen(false)}>
          <div className="relative flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-600 text-lg font-black text-white shadow-lg shadow-teal-600/30">
            N
            <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full bg-amber-400 ring-2 ring-white" />
          </div>
          <div>
            <p className="text-lg font-extrabold tracking-tight text-slate-900">
              Neer <span className="text-teal-600">Loan</span>
            </p>
            <p className="text-[11px] font-medium uppercase tracking-widest text-slate-400">
              {BRAND.tagline}
            </p>
          </div>
        </Link>

        <nav className="hidden items-center gap-6 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition hover:text-teal-600"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/app"
            className="hidden rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 hover:text-teal-600 md:block"
          >
            📱 App
          </Link>
          <Link
            href="/admin"
            className="hidden rounded-lg px-3 py-2 text-xs font-medium text-slate-400 hover:text-slate-600 sm:block"
          >
            Admin
          </Link>
          <Link
            href="/apply"
            className="rounded-full bg-gradient-to-r from-teal-600 to-cyan-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-600/25 transition hover:scale-105 sm:px-5"
          >
            Apply Now →
          </Link>
          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            aria-label="Toggle menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span className="text-xl">{menuOpen ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-slate-100 bg-white px-4 py-4 lg:hidden">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/app"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700"
              onClick={() => setMenuOpen(false)}
            >
              📱 Get App
            </Link>
            <Link
              href="/refer"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-700"
              onClick={() => setMenuOpen(false)}
            >
              Refer &amp; Earn
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
