"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { IconShield } from "@/components/icons";
import { sendOtp, verifyOtp } from "@/lib/api";
import {
  journeyRedirectPath,
  loadCustomerJourney,
  setStoredSessionToken,
} from "@/lib/customer-session";

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-neercred-teal focus:ring-2 focus:ring-neercred-teal/20";

function LoginInner() {
  const router = useRouter();
  const [phase, setPhase] = useState<"mobile" | "otp">("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [smsConsent, setSmsConsent] = useState(false);
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!smsConsent) {
      setError("Please allow OTP on SMS to continue.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await sendOtp(mobile, true);
      setDevOtp(res.dev_otp || null);
      setPhase("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send OTP.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await verifyOtp(mobile, otp);
      setStoredSessionToken(res.session_token);
      window.dispatchEvent(new Event("neercred:session"));
      const journey = await loadCustomerJourney(res.session_token);
      router.replace(journey ? journeyRedirectPath(journey) : "/apply");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-teal-50/30">
      <Header />
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-neercred">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neercred-teal">Customer login</p>
          <h1 className="mt-2 text-2xl font-bold text-neercred-navy">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-500">
            Login with mobile OTP — we&apos;ll restore your saved application and take you to the right step.
          </p>

          {error && (
            <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {phase === "mobile" ? (
            <form onSubmit={handleSendOtp} className="mt-6">
              <input
                type="tel"
                maxLength={10}
                inputMode="numeric"
                placeholder="10-digit mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                className={`${inputClass} text-lg`}
                required
              />
              <label className="mt-4 flex items-start gap-3 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={smsConsent}
                  onChange={(e) => setSmsConsent(e.target.checked)}
                  className="mt-1 accent-neercred-teal"
                />
                <span>I agree to receive OTP via SMS (DPDP Act 2023).</span>
              </label>
              <button
                type="submit"
                disabled={loading || mobile.length !== 10 || !smsConsent}
                className="neercred-btn mt-6 w-full py-3.5 disabled:opacity-50"
              >
                {loading ? "Sending…" : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="mt-6">
              <p className="text-sm text-slate-500">OTP sent to +91 {mobile}</p>
              {devOtp && (
                <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  Dev OTP: <strong className="font-mono">{devOtp}</strong>
                </p>
              )}
              <input
                type="text"
                maxLength={6}
                inputMode="numeric"
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className={`${inputClass} mt-4 text-center text-2xl tracking-[0.4em]`}
                required
              />
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="neercred-btn mt-6 w-full py-3.5 disabled:opacity-50"
              >
                {loading ? "Verifying…" : "Login & continue"}
              </button>
              <button
                type="button"
                onClick={() => setPhase("mobile")}
                className="mt-3 w-full text-sm font-medium text-slate-500 hover:text-neercred-teal"
              >
                Change mobile
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-slate-500">
            New customer?{" "}
            <Link href="/apply" className="font-semibold text-neercred-teal hover:underline">
              Start application
            </Link>
          </p>
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
          <IconShield size={14} />
          RBI LSP · Secure OTP login · Journey auto-saved
        </p>
      </div>
      <Footer />
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="flex min-h-screen items-center justify-center">Loading…</main>}>
      <LoginInner />
    </Suspense>
  );
}
