"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { OfferCard } from "@/components/OfferCard";
import {
  fetchOffers,
  LoanOffer,
  selectOffer,
  sendOtp,
  submitDetails,
  verifyOtp,
} from "@/lib/api";

type Step = "mobile" | "otp" | "details" | "offers" | "success";

const STEPS: Step[] = ["mobile", "otp", "details", "offers", "success"];

export default function ApplyPage() {
  const [step, setStep] = useState<Step>("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState("");
  const [offers, setOffers] = useState<LoanOffer[]>([]);
  const [selectedOffer, setSelectedOffer] = useState<LoanOffer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    full_name: "",
    pan: "",
    monthly_income: "",
    employment_type: "salaried" as "salaried" | "self_employed" | "business",
    city: "",
  });

  const stepIndex = STEPS.indexOf(step);

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await sendOtp(mobile);
      setDevOtp(res.dev_otp || null);
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await verifyOtp(mobile, otp);
      setSessionToken(res.session_token);
      setStep("details");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitDetails(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await submitDetails({
        session_token: sessionToken,
        full_name: form.full_name,
        pan: form.pan.toUpperCase(),
        monthly_income: Number(form.monthly_income),
        employment_type: form.employment_type,
        city: form.city,
      });
      const offersRes = await fetchOffers(sessionToken);
      setOffers(offersRes.offers);
      setStep("offers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit details");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectOffer(offer: LoanOffer) {
    setError("");
    setLoading(true);
    try {
      await selectOffer({
        session_token: sessionToken,
        offer_id: offer.offer_id,
        lender_name: offer.lender_name,
      });
      setSelectedOffer(offer);
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to select offer");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <Header />

      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* Progress bar */}
        <div className="mb-8 flex items-center gap-2">
          {["Mobile", "OTP", "Details", "Offers", "Done"].map((label, i) => (
            <div key={label} className="flex flex-1 flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                  i <= stepIndex
                    ? "bg-teal-600 text-white"
                    : "bg-slate-200 text-slate-400"
                }`}
              >
                {i + 1}
              </div>
              <span className="mt-1 text-xs text-slate-500">{label}</span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {step === "mobile" && (
            <form onSubmit={handleSendOtp}>
              <h2 className="text-2xl font-bold text-slate-900">Enter Mobile Number</h2>
              <p className="mt-2 text-slate-500">
                We&apos;ll send an OTP to verify your number
              </p>
              <input
                type="tel"
                maxLength={10}
                placeholder="10-digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                className="mt-6 w-full rounded-xl border border-slate-200 px-4 py-3 text-lg outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                required
              />
              <button
                type="submit"
                disabled={loading || mobile.length !== 10}
                className="mt-6 w-full rounded-xl bg-teal-600 py-3 font-bold text-white transition hover:bg-teal-700 disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send OTP →"}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp}>
              <h2 className="text-2xl font-bold text-slate-900">Verify OTP</h2>
              <p className="mt-2 text-slate-500">
                OTP sent to +91 {mobile}
                {devOtp && (
                  <span className="mt-2 block rounded-lg bg-yellow-50 px-3 py-2 text-sm font-mono text-yellow-800">
                    Dev OTP: <strong>{devOtp}</strong> (any 6 digits also work in dev mode)
                  </span>
                )}
              </p>
              <input
                type="text"
                maxLength={6}
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="mt-6 w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-2xl tracking-widest outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
                required
              />
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="mt-6 w-full rounded-xl bg-teal-600 py-3 font-bold text-white transition hover:bg-teal-700 disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify & Continue →"}
              </button>
              <button
                type="button"
                onClick={() => setStep("mobile")}
                className="mt-3 w-full text-sm text-slate-500 hover:text-teal-600"
              >
                ← Change mobile number
              </button>
            </form>
          )}

          {step === "details" && (
            <form onSubmit={handleSubmitDetails}>
              <h2 className="text-2xl font-bold text-slate-900">Your Details</h2>
              <p className="mt-2 text-slate-500">
                Help us find the best loan offers for you
              </p>
              <div className="mt-6 space-y-4">
                <input
                  type="text"
                  placeholder="Full Name (as per PAN)"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
                  required
                />
                <input
                  type="text"
                  maxLength={10}
                  placeholder="PAN Number (e.g. ABCDE1234F)"
                  value={form.pan}
                  onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 uppercase outline-none focus:border-teal-500"
                  required
                />
                <input
                  type="number"
                  placeholder="Monthly Income (₹)"
                  value={form.monthly_income}
                  onChange={(e) => setForm({ ...form, monthly_income: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
                  required
                  min={10000}
                />
                <select
                  value={form.employment_type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      employment_type: e.target.value as typeof form.employment_type,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
                >
                  <option value="salaried">Salaried</option>
                  <option value="self_employed">Self Employed</option>
                  <option value="business">Business Owner</option>
                </select>
                <input
                  type="text"
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full rounded-xl bg-teal-600 py-3 font-bold text-white transition hover:bg-teal-700 disabled:opacity-50"
              >
                {loading ? "Fetching offers..." : "Get Best Offers →"}
              </button>
            </form>
          )}

          {step === "offers" && (
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Your Loan Offers</h2>
              <p className="mt-2 text-slate-500">
                {offers.length} offers from partner lenders — sorted by best interest rate
              </p>
              <div className="mt-6 space-y-4">
                {offers.map((offer) => (
                  <OfferCard
                    key={offer.offer_id}
                    offer={offer}
                    onSelect={handleSelectOffer}
                    loading={loading}
                  />
                ))}
              </div>
            </div>
          )}

          {step === "success" && selectedOffer && (
            <div className="text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl">
                ✅
              </div>
              <h2 className="mt-6 text-2xl font-bold text-slate-900">Offer Selected!</h2>
              <p className="mt-2 text-slate-500">
                You selected <strong>{selectedOffer.lender_name}</strong> for{" "}
                <strong>
                  {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                  }).format(selectedOffer.loan_amount)}
                </strong>
              </p>
              <div className="mt-6 rounded-xl bg-teal-50 p-4 text-sm text-teal-800">
                <p className="font-semibold">Next Step (Phase 3):</p>
                <p className="mt-1">
                  Complete eKYC & digital signing on {selectedOffer.lender_name}&apos;s portal.
                  Loan will be disbursed directly to your bank account.
                </p>
              </div>
              <Link
                href="/"
                className="mt-6 inline-block rounded-xl bg-teal-600 px-8 py-3 font-bold text-white transition hover:bg-teal-700"
              >
                Back to Home
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
