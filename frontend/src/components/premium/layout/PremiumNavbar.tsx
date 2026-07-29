"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { PremiumLogo } from "@/components/premium/brand/PremiumLogo";
import { premiumContent } from "@/lib/premium/content";

export function PremiumNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-white/10 bg-[#0A0F1C]/85 shadow-lg backdrop-blur-xl"
          : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <Link href="/" className="shrink-0">
          <PremiumLogo variant="full" height={42} />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {premiumContent.nav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            href="/dashboard"
            className="rounded-full px-4 py-2 text-sm font-semibold text-slate-300 transition hover:text-white"
          >
            Login
          </Link>
          <Link
            href="/apply"
            className="rounded-full bg-gradient-to-r from-teal-400 to-emerald-500 px-5 py-2.5 text-sm font-bold text-[#0A0F1C] shadow-lg shadow-teal-500/25 transition hover:brightness-110"
          >
            Apply Now
          </Link>
        </div>

        <button
          type="button"
          className="rounded-lg p-2 text-white lg:hidden"
          aria-label="Menu"
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? <path d="M6 6l12 12M6 18L18 6" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden border-t border-white/10 bg-[#0A0F1C]/95 backdrop-blur-xl lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4">
              {premiumContent.nav.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-200"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/dashboard" className="rounded-lg px-3 py-2.5 text-sm text-slate-300" onClick={() => setOpen(false)}>
                Login
              </Link>
              <Link
                href="/apply"
                className="mt-2 rounded-full bg-gradient-to-r from-teal-400 to-emerald-500 py-3 text-center text-sm font-bold text-[#0A0F1C]"
                onClick={() => setOpen(false)}
              >
                Apply Now
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
