"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { COOKIE_CONSENT_KEY, type CookiePreferences } from "@/lib/consent";

import { getApiBase } from "@/lib/api-base";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const saved = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!saved) setVisible(true);
  }, []);

  async function savePreferences(analytics: boolean) {
    const prefs: CookiePreferences = {
      essential: true,
      analytics,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(COOKIE_CONSENT_KEY, JSON.stringify(prefs));
    setVisible(false);

    try {
      await fetch(`${getApiBase()}/api/consent/cookies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          essential: true,
          analytics,
          page_url: window.location.pathname,
        }),
      });
    } catch {
      // Preferences saved locally even if API is offline
    }
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed bottom-0 left-0 right-0 z-[60] border-t border-slate-200 bg-white p-4 shadow-2xl md:p-6"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="text-sm text-slate-600">
          <p className="font-semibold text-slate-900">We value your privacy (DPDP Act 2023)</p>
          <p className="mt-1">
            Essential cookies run the site. Analytics cookies help us improve — only with your
            consent.{" "}
            <Link href="/compliance" className="font-medium text-teal-600 underline">
              Privacy &amp; cookie policy
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => savePreferences(false)}
            className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Essential only
          </button>
          <button
            type="button"
            onClick={() => savePreferences(true)}
            className="rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}
