"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OfferCard } from "@/components/OfferCard";
import { IconCheckCircle, IconShield } from "@/components/icons";
import {
  checkEligibility,
  EligibilityResult,
  fetchOffers,
  getRequiredFields,
  LoanOffer,
  RequiredField,
  selectOffer,
  sendOtp,
  submitDetails,
  verifyOtp,
} from "@/lib/api";
import { CONSENT_VERSIONS } from "@/lib/consent";

type Step = "mobile" | "otp" | "details" | "offers";
type SortBy = "rate" | "amount" | "emi";

const STEPS: Step[] = ["mobile", "otp", "details", "offers"];
const STEP_LABELS = ["Mobile", "Verify", "Profile", "Offers"];

const STEP_TIPS: Record<Step, { title: string; hint: string }> = {
  mobile: {
    title: "Start in under a minute",
    hint: "Use your Aadhaar-linked mobile number for smoother KYC later.",
  },
  otp: {
    title: "Secure verification",
    hint: "OTP is valid for a few minutes. Never share it with anyone.",
  },
  details: {
    title: "One profile, multiple offers",
    hint: "We only ask what partner lenders need. Your data stays encrypted.",
  },
  offers: {
    title: "Compare and choose calmly",
    hint: "We highlight the best rate and lowest EMI — pick what fits your budget.",
  },
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-neercred-teal focus:ring-2 focus:ring-neercred-teal/20";

export default function ApplyPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState("");
  const [offers, setOffers] = useState<LoanOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("rate");
  const [smsConsent, setSmsConsent] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);
  const [dpdpConsent, setDpdpConsent] = useState(false);
  const [creditConsent, setCreditConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [lenderConsent, setLenderConsent] = useState(false);

  const allRequiredConsents = privacyConsent && termsConsent && dpdpConsent;

  const [requiredFields, setRequiredFields] = useState<RequiredField[]>([]);
  const needs = (key: string) => requiredFields.some((f) => f.key === key);

  useEffect(() => {
    void getRequiredFields()
      .then((res) => setRequiredFields(res.fields))
      .catch(() => setRequiredFields([]));
  }, []);

  const [form, setForm] = useState({
    full_name: "",
    pan: "",
    date_of_birth: "",
    email: "",
    pincode: "",
    gender: "" as "" | "male" | "female" | "other",
    monthly_income: "",
    employment_type: "salaried" as "salaried" | "self_employed" | "business",
    city: "",
    loan_purpose: "personal" as "personal" | "medical" | "wedding" | "travel" | "business" | "education",
    existing_emi: "",
  });

  const stepIndex = STEPS.indexOf(step);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const sortedOffers = useMemo(() => {
    const copy = [...offers];
    if (sortBy === "rate") copy.sort((a, b) => a.interest_rate - b.interest_rate);
    if (sortBy === "amount") copy.sort((a, b) => b.loan_amount - a.loan_amount);
    if (sortBy === "emi") copy.sort((a, b) => a.emi - b.emi);
    return copy;
  }, [offers, sortBy]);

  const recommendations = useMemo(() => {
    if (!offers.length) return {};
    const byRate = [...offers].sort((a, b) => a.interest_rate - b.interest_rate)[0];
    const byEmi = [...offers].sort((a, b) => a.emi - b.emi)[0];
    const byAmount = [...offers].sort((a, b) => b.loan_amount - a.loan_amount)[0];
    const map: Record<string, "rate" | "emi" | "amount"> = {};
    if (byRate) map[byRate.offer_id] = "rate";
    if (byEmi && byEmi.offer_id !== byRate?.offer_id) map[byEmi.offer_id] = "emi";
    if (byAmount && byAmount.offer_id !== byRate?.offer_id && byAmount.offer_id !== byEmi?.offer_id) {
      map[byAmount.offer_id] = "amount";
    }
    return map;
  }, [offers]);

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
      setStep("otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send OTP. Try again.");
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
      setError(err instanceof Error ? err.message : "Incorrect OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitDetails(e: React.FormEvent) {
    e.preventDefault();
    if (!allRequiredConsents) {
      setError("Please accept Privacy Policy, Terms, and data processing consent.");
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
        date_of_birth: form.date_of_birth || undefined,
        email: form.email || undefined,
        pincode: form.pincode || undefined,
        gender: form.gender || undefined,
        page_url: "/apply",
        consents: {
          dpdp_data_processing: dpdpConsent,
          privacy_policy: privacyConsent,
          terms_of_service: termsConsent,
          credit_bureau_check: creditConsent,
          marketing_communications: marketingConsent,
          privacy_version: CONSENT_VERSIONS.privacy_policy,
          terms_version: CONSENT_VERSIONS.terms_of_service,
          dpdp_version: CONSENT_VERSIONS.dpdp_data_processing,
        },
      });

      const eligRes = await checkEligibility({
        session_token: sessionToken,
        loan_purpose: form.loan_purpose,
        existing_emi: Number(form.existing_emi) || 0,
      });
      setEligibility(eligRes.eligibility);

      if (!eligRes.eligibility.eligible) {
        setError(eligRes.eligibility.message || "You may not qualify right now. Try a lower EMI or higher income.");
        return;
      }

      const offersRes = await fetchOffers(sessionToken);
      setOffers(offersRes.offers);
      setStep("offers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectOffer(offer: LoanOffer) {
    if (!lenderConsent) {
      setError("Please consent to share your details with the lender you select.");
      return;
    }
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
        lender_data_sharing_consent: true,
        page_url: "/apply",
      });
      localStorage.setItem(`app_ref_${res.application_id}`, res.application_ref);
      router.push(`/application/${res.application_id}/kyc`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not select offer. Try again.");
    } finally {
      setLoading(false);
    }
  }

  const tip = STEP_TIPS[step];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-teal-50/30">
      <Header />

      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neercred-teal">NeerCred Apply</p>
          <h1 className="mt-2 text-2xl font-bold text-neercred-navy sm:text-3xl">Your loan, step by step</h1>
          <p className="mt-2 text-sm text-slate-500">Light, secure, and guided from OTP to offer selection.</p>
        </div>

        <div className="mb-8">
          <div className="mb-3 flex justify-between text-xs font-medium text-slate-500">
            {STEP_LABELS.map((label, i) => (
              <span key={label} className={i <= stepIndex ? "text-neercred-teal" : ""}>
                {label}
              </span>
            ))}
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-gradient-to-r from-neercred-teal to-neercred-cyan transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-teal-100 bg-teal-50/50 px-5 py-4">
          <p className="font-semibold text-neercred-navy">{tip.title}</p>
          <p className="mt-1 text-sm text-slate-600">{tip.hint}</p>
        </div>

        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-neercred sm:p-8">
          {error && (
            <div className="mb-5 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {step === "mobile" && (
            <form onSubmit={handleSendOtp}>
              <h2 className="text-xl font-bold text-neercred-navy">Mobile number</h2>
              <p className="mt-1 text-sm text-slate-500">We&apos;ll send a one-time password to verify you.</p>
              <input
                type="tel"
                maxLength={10}
                inputMode="numeric"
                placeholder="10-digit mobile"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                className={`${inputClass} mt-6 text-lg`}
                required
              />
              <label className="mt-4 flex items-start gap-3 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={smsConsent}
                  onChange={(e) => setSmsConsent(e.target.checked)}
                  className="mt-1 accent-neercred-teal"
                />
                <span>I agree to receive OTP via SMS for verification (DPDP Act 2023).</span>
              </label>
              <button
                type="submit"
                disabled={loading || mobile.length !== 10 || !smsConsent}
                className="neercred-btn mt-6 w-full py-3.5 disabled:opacity-50"
              >
                {loading ? "Sending…" : "Continue"}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp}>
              <h2 className="text-xl font-bold text-neercred-navy">Enter OTP</h2>
              <p className="mt-1 text-sm text-slate-500">Sent to +91 {mobile}</p>
              {devOtp && (
                <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                  Dev mode OTP: <strong className="font-mono">{devOtp}</strong>
                </p>
              )}
              <input
                type="text"
                maxLength={6}
                inputMode="numeric"
                placeholder="• • • • • •"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                className={`${inputClass} mt-6 text-center text-2xl tracking-[0.4em]`}
                required
              />
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="neercred-btn mt-6 w-full py-3.5 disabled:opacity-50"
              >
                {loading ? "Verifying…" : "Verify & continue"}
              </button>
              <button
                type="button"
                onClick={() => setStep("mobile")}
                className="mt-3 w-full text-sm font-medium text-slate-500 hover:text-neercred-teal"
              >
                Change mobile number
              </button>
            </form>
          )}

          {step === "details" && (
            <form onSubmit={handleSubmitDetails}>
              <h2 className="text-xl font-bold text-neercred-navy">Your profile</h2>
              <p className="mt-1 text-sm text-slate-500">Tell us a little — we&apos;ll fetch personalised offers next.</p>
              <div className="mt-6 space-y-4">
                <input
                  type="text"
                  placeholder="Full name (as per PAN)"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className={inputClass}
                  required
                />
                <input
                  type="text"
                  maxLength={10}
                  placeholder="PAN number"
                  value={form.pan}
                  onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })}
                  className={`${inputClass} uppercase`}
                  required
                />
                {needs("date_of_birth") && (
                  <div>
                    <label className="text-sm font-medium text-slate-700">Date of birth</label>
                    <input
                      type="date"
                      value={form.date_of_birth}
                      onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                      className={`${inputClass} mt-1`}
                      required
                    />
                  </div>
                )}
                {needs("email") && (
                  <input
                    type="email"
                    placeholder="Email address"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={inputClass}
                    required
                  />
                )}
                {needs("pincode") && (
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="PIN code"
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "") })}
                    className={inputClass}
                    required
                  />
                )}
                {needs("gender") && (
                  <select
                    value={form.gender}
                    onChange={(e) =>
                      setForm({ ...form, gender: e.target.value as typeof form.gender })
                    }
                    className={inputClass}
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                )}
                <input
                  type="number"
                  placeholder="Monthly income (₹)"
                  value={form.monthly_income}
                  onChange={(e) => setForm({ ...form, monthly_income: e.target.value })}
                  className={inputClass}
                  required
                  min={15000}
                />
                <select
                  value={form.employment_type}
                  onChange={(e) =>
                    setForm({ ...form, employment_type: e.target.value as typeof form.employment_type })
                  }
                  className={inputClass}
                >
                  <option value="salaried">Salaried</option>
                  <option value="self_employed">Self employed</option>
                  <option value="business">Business owner</option>
                </select>
                <input
                  type="text"
                  placeholder="City"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  className={inputClass}
                  required
                />
                <div>
                  <label className="text-sm font-medium text-slate-700">Loan purpose</label>
                  <select
                    value={form.loan_purpose}
                    onChange={(e) =>
                      setForm({ ...form, loan_purpose: e.target.value as typeof form.loan_purpose })
                    }
                    className={`${inputClass} mt-1`}
                  >
                    <option value="personal">Personal</option>
                    <option value="medical">Medical</option>
                    <option value="wedding">Wedding</option>
                    <option value="travel">Travel</option>
                    <option value="business">Business</option>
                    <option value="education">Education</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Existing monthly EMI (if any)</label>
                  <input
                    type="number"
                    placeholder="0"
                    value={form.existing_emi}
                    onChange={(e) => setForm({ ...form, existing_emi: e.target.value })}
                    className={`${inputClass} mt-1`}
                    min={0}
                  />
                </div>
              </div>

              <div className="mt-6 space-y-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-600">
                <p className="flex items-center gap-2 font-semibold text-slate-800">
                  <IconShield size={16} className="text-neercred-teal" />
                  Consent
                </p>
                <label className="flex items-start gap-3">
                  <input type="checkbox" checked={privacyConsent} onChange={(e) => setPrivacyConsent(e.target.checked)} className="mt-1 accent-neercred-teal" />
                  <span>
                    I accept the{" "}
                    <Link href="/compliance" className="font-medium text-neercred-teal underline">
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
                <label className="flex items-start gap-3">
                  <input type="checkbox" checked={termsConsent} onChange={(e) => setTermsConsent(e.target.checked)} className="mt-1 accent-neercred-teal" />
                  <span>
                    I accept the{" "}
                    <Link href="/compliance" className="font-medium text-neercred-teal underline">
                      Terms of Service
                    </Link>
                    .
                  </span>
                </label>
                <label className="flex items-start gap-3">
                  <input type="checkbox" checked={dpdpConsent} onChange={(e) => setDpdpConsent(e.target.checked)} className="mt-1 accent-neercred-teal" />
                  <span>I consent to data processing under DPDP Act 2023.</span>
                </label>
                <label className="flex items-start gap-3">
                  <input type="checkbox" checked={creditConsent} onChange={(e) => setCreditConsent(e.target.checked)} className="mt-1 accent-neercred-teal" />
                  <span className="text-slate-500">Optional: credit bureau check for better offers.</span>
                </label>
                <label className="flex items-start gap-3">
                  <input type="checkbox" checked={marketingConsent} onChange={(e) => setMarketingConsent(e.target.checked)} className="mt-1 accent-neercred-teal" />
                  <span className="text-slate-500">Optional: product updates via SMS or email.</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading || !allRequiredConsents}
                className="neercred-btn mt-6 w-full py-3.5 disabled:opacity-50"
              >
                {loading ? "Finding your offers…" : "See my offers"}
              </button>
            </form>
          )}

          {step === "offers" && (
            <div>
              {eligibility && (
                <div className="mb-6 rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
                  <p className="flex items-center gap-2 font-semibold text-emerald-800">
                    <IconCheckCircle size={18} />
                    You&apos;re eligible
                  </p>
                  <p className="mt-1 text-sm text-emerald-700">
                    Up to ₹{eligibility.max_loan_amount.toLocaleString("en-IN")} · Score {eligibility.score}/100
                  </p>
                  {eligibility.factors?.length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs text-emerald-700">
                      {eligibility.factors.slice(0, 2).map((f) => (
                        <li key={f}>· {f}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-neercred-navy">Your offers</h2>
                  <p className="text-sm text-slate-500">{offers.length} personalised options from partner lenders</p>
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                  <option value="rate">Sort: lowest rate</option>
                  <option value="emi">Sort: lowest EMI</option>
                  <option value="amount">Sort: highest amount</option>
                </select>
              </div>

              <label className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/60 p-4 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={lenderConsent}
                  onChange={(e) => setLenderConsent(e.target.checked)}
                  className="mt-1 accent-neercred-teal"
                />
                <span>I consent to share my application with the lender I select, for loan processing only.</span>
              </label>

              <div className="mt-6 space-y-5">
                {sortedOffers.map((offer) => (
                  <OfferCard
                    key={offer.offer_id}
                    offer={offer}
                    onSelect={handleSelectOffer}
                    loading={loading}
                    recommended={recommendations[offer.offer_id]}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
          <IconShield size={14} />
          RBI LSP platform · 256-bit encryption · No hidden charges
        </p>
      </div>

      <Footer />
    </main>
  );
}
