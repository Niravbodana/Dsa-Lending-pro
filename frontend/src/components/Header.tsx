"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useCallback, useEffect } from "react";
import { NeerCredLogo } from "@/components/NeerCredLogo";
import { IconMenu, IconX, IconSmartphone } from "@/components/icons";
import { REF } from "@/lib/reference-theme";
import { useCustomerSession } from "@/hooks/useCustomerSession";
import { journeyRedirectPath } from "@/lib/customer-session";

const navLinks = [
  { href: "/loans", label: "Loans" },
  { href: "/rates", label: "Rates" },
  { href: "/platform", label: "Platform" },
  { href: "/about", label: "About Us" },
  { href: "/help", label: "Help" },
  { href: "/track", label: "Track Loan" },
  { href: "/compliance", label: "Compliance" },
];

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, journey, logout, loading: sessionLoading } = useCustomerSession();

  const continueHref = journey ? journeyRedirectPath(journey) : "/apply";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    setMenuOpen(false);
    router.push("/");
  }, [logout, router]);

  const goHome = useCallback(() => {
    setMenuOpen(false);
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        scrolled
          ? "border-white/50 bg-white/75 py-2 shadow-[0_8px_32px_-12px_rgba(14,116,144,0.18)] backdrop-blur-2xl"
          : "border-slate-200/80 bg-white/90 py-2.5 backdrop-blur-md lg:py-3"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-2 px-4 py-2.5 lg:gap-3 lg:py-3">
        <Link href="/" onClick={goHome} aria-label="NeerCred — Go to homepage" className="shrink-0">
          <NeerCredLogo variant="header" className="h-10 sm:h-11" />
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
            App
          </Link>
          {!sessionLoading && isAuthenticated ? (
            <>
              <Link
                href={continueHref}
                className="hidden rounded-full border border-teal-200 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-800 transition hover:bg-teal-100 sm:inline-flex"
              >
                Continue
              </Link>
              <Link
                href="/dashboard"
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => void handleLogout()}
                className="hidden rounded-full px-3 py-2 text-sm font-medium text-slate-500 hover:text-slate-800 sm:inline-flex"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400"
            >
              Login
            </Link>
          )}
          <Link
            href="/apply"
            className="rounded-full px-5 py-2.5 text-sm font-bold text-white transition hover:brightness-110"
            style={{ backgroundColor: REF.teal }}
          >
            Apply Now
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
            {[...navLinks, { href: "/app", label: "App" }].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700"
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {isAuthenticated ? (
              <>
                <Link href={continueHref} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-teal-700">
                  Continue application
                </Link>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700">
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="rounded-lg px-3 py-2.5 text-left text-sm font-medium text-slate-500"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm font-semibold text-teal-700">
                Login
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
