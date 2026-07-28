"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { OfferCard } from "@/components/OfferCard";
import {
  checkEligibility,
  EligibilityResult,
  fetchOffers,
  LoanOffer,
  selectOffer,
  sendOtp,
  submitDetails,
  verifyOtp,
} from "@/lib/api";

type Step = "mobile" | "otp" | "details" | "eligibility" | "offers";
type SortBy = "rate" | "amount" | "emi";

const STEPS: Step[] = ["mobile", "otp", "details", "eligibility", "offers"];
const STEP_LABELS = ["Mobile", "OTP", "Details", "Eligibility", "Offers"];

export default function ApplyPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState("");
  const [offers, setOffers] = useState<LoanOffer[]>([]);
  const [partnersInfo, setPartnersInfo] = useState({ queried: 0, responded: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("rate");
  const [consent, setConsent] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    pan: "",
    monthly_income: "",
    employment_type: "salaried" as "salaried" | "self_employed" | "business",
    city: "",
    loan_purpose: "personal" as "personal" | "medical" | "wedding" | "travel" | "business" | "education",
    existing_emi: "",
  });

  const stepIndex = STEPS.indexOf(step);

  const sortedOffers = useMemo(() => {
    const copy = [...offers];
    if (sortBy === "rate") copy.sort((a, b) => a.interest_rate - b.interest_rate);
    if (sortBy === "amount") copy.sort((a, b) => b.loan_amount - a.loan_amount);
    if (sortBy === "emi") copy.sort((a, b) => a.emi - b.emi);
    return copy;
  }, [offers, sortBy]);

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
      localStorage.setItem("session_token", res.session_token);
      setStep("details");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!consent) {
      setError("Please accept the data protection & compliance terms to continue.");
      return;
    }
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
      setStep("eligibility");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit details");
    } finally {
      setLoading(false);
    }
  }

  async function handleCheckEligibility(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await checkEligibility({
        session_token: sessionToken,
        loan_purpose: form.loan_purpose,
        existing_emi: Number(form.existing_emi) || 0,
      });
      setEligibility(res.eligibility);
      if (!res.eligibility.eligible) {
        setLoading(false);
        return;
      }
      const offersRes = await fetchOffers(sessionToken);
      setOffers(offersRes.offers);
      setPartnersInfo({
        queried: offersRes.partners_queried,
        responded: offersRes.partners_responded,
      });
      setStep("offers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eligibility check failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectOffer(offer: LoanOffer) {
    setError("");
    setLoading(true);
    try {
      const res = await selectOffer({
        session_token: sessionToken,
        offer_id: offer.offer_id,
        lender_name: offer.lender_name,
        loan_amount: offer.loan_amount,
        interest_rate: offer.interest_rate,
        tenure_months: offer.tenure_months,
        emi: offer.emi,
      });
      localStorage.setItem(`app_ref_${res.application_id}`, res.application_ref);
      router.push(`/application/${res.application_id}/kyc`);
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
        <div className="mb-8 flex items-center gap-1 overflow-x-auto">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex min-w-[52px] flex-1 flex-col items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  i <= stepIndex ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-400"
                }`}
              >
                {i + 1}
              </div>
              <span className="mt-1 text-[10px] text-slate-500">{label}</span>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          {step === "mobile" && (
            <form onSubmit={handleSendOtp}>
              <h2 className="text-2xl font-bold text-slate-900">Mobile Number Daalo</h2>
              <p className="mt-2 text-slate-500">OTP se verify karenge — 30 second mein</p>
              <input
                type="tel"
                maxLength={10}
                placeholder="10-digit mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                className="mt-6 w-full rounded-xl border border-slate-200 px-4 py-3 text-lg outline-none focus:border-teal-500"
                required
              />
              <button
                type="submit"
                disabled={loading || mobile.length !== 10}
                className="mt-6 w-full rounded-xl bg-teal-600 py-3 font-bold text-white disabled:opacity-50"
              >
                {loading ? "Sending..." : "Send OTP →"}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp}>
              <h2 className="text-2xl font-bold text-slate-900">OTP Verify Karo</h2>
              <p className="mt-2 text-slate-500">+91 {mobile}</p>
              {devOtp && (
                <p className="mt-2 rounded-lg bg-yellow-50 px-3 py-2 text-sm font-mono text-yellow-800">
                  Dev OTP: <strong>{devOtp}</strong>
                </p>
              )}
              <input
                type="text"
                maxLength={6}
                placeholder="6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className="mt-6 w-full rounded-xl border border-slate-200 px-4 py-3 text-center text-2xl tracking-widest outline-none focus:border-teal-500"
                required
              />
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="mt-6 w-full rounded-xl bg-teal-600 py-3 font-bold text-white disabled:opacity-50"
              >
                {loading ? "Verifying..." : "Verify & Continue →"}
              </button>
            </form>
          )}

          {step === "details" && (
            <form onSubmit={handleSubmitDetails}>
              <h2 className="text-2xl font-bold text-slate-900">Aapki Details</h2>
              <p className="mt-2 text-slate-500">Best offers ke liye basic info chahiye</p>
              <div className="mt-6 space-y-4">
                <input
                  type="text"
                  placeholder="Full Name (PAN ke hisaab se)"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-teal-500"
                  required
                />
                <input
                  type="text"
                  maxLength={10}
                  placeholder="PAN Number"
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
                  min={15000}
                />
                <select
                  value={form.employment_type}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      employment_type: e.target.value as typeof form.employment_type,
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
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
              <label className="mt-4 flex items-start gap-3 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 accent-teal-600"
                />
                <span>
                  I agree to Neer Loan Solutions&apos;s{" "}
                  <Link href="/compliance" className="font-semibold text-teal-600 underline">
                    RBI compliance & DPDP data protection
                  </Link>{" "}
                  terms. My data will be shared with partner lenders only upon offer selection.
                </span>
              </label>
              <button
                type="submit"
                disabled={loading || !consent}
                className="mt-6 w-full rounded-xl bg-teal-600 py-3 font-bold text-white disabled:opacity-50"
              >
                {loading ? "Saving..." : "Check Eligibility →"}
              </button>
            </form>
          )}

          {step === "eligibility" && (
            <form onSubmit={handleCheckEligibility}>
              <h2 className="text-2xl font-bold text-slate-900">Eligibility Check</h2>
              <p className="mt-2 text-slate-500">Phase 2 engine — real-time partner API query</p>
              <div className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-semibold text-slate-700">Loan Purpose</label>
                  <select
                    value={form.loan_purpose}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        loan_purpose: e.target.value as typeof form.loan_purpose,
                      })
                    }
                    className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                  >
                    <option value="personal">Personal</option>
                    <option value="medical">Medical Emergency</option>
                    <option value="wedding">Wedding</option>
                    <option value="travel">Travel</option>
                    <option value="business">Business</option>
                    <option value="education">Education</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Existing Monthly EMI (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="0 if none"
                    value={form.existing_emi}
                    onChange={(e) => setForm({ ...form, existing_emi: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none"
                    min={0}
                  />
                </div>
              </div>

              {eligibility && !eligibility.eligible && (
                <div className="mt-6 rounded-xl bg-red-50 p-4">
                  <p className="font-bold text-red-700">Not Eligible</p>
                  <p className="mt-1 text-sm text-red-600">{eligibility.message}</p>
                  <p className="mt-2 text-xs text-red-500">Score: {eligibility.score}/100</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 py-3 font-bold text-white disabled:opacity-50"
              >
                {loading ? "Querying 6 partner APIs..." : "Run Eligibility & Fetch Offers →"}
              </button>
            </form>
          )}

          {step === "offers" && (
            <div>
              {eligibility && (
                <div className="mb-6 rounded-xl bg-green-50 p-4">
                  <p className="font-bold text-green-800">
                    ✅ Eligible — Score {eligibility.score}/100
                  </p>
                  <p className="text-sm text-green-700">
                    Max loan: ₹{eligibility.max_loan_amount.toLocaleString("en-IN")} • DTI:{" "}
                    {eligibility.debt_to_income_ratio}%
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Partner Offers</h2>
                  <p className="text-sm text-slate-500">
                    {offers.length} offers from {partnersInfo.responded}/{partnersInfo.queried}{" "}
                    partners (live engine)
                  </p>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="rate">Lowest ROI</option>
                  <option value="amount">Highest Amount</option>
                  <option value="emi">Lowest EMI</option>
                </select>
              </div>
              <div className="mt-6 space-y-4">
                {sortedOffers.map((offer) => (
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
        </div>
      </div>
    </main>
  );
}
