"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { OfferCard } from "@/components/OfferCard";
import { IconShield } from "@/components/icons";
import { LoanGuideMascot } from "@/components/loan-guide/LoanGuideMascot";
import type { GuideField } from "@/components/loan-guide/loanGuideMessages";
import { JourneyWorkflow } from "@/components/loan-journey/JourneyWorkflow";
import { JourneyStepHeader } from "@/components/JourneyStepHeader";
import { OfferComparisonTable } from "@/components/OfferComparisonTable";
import { EligibilityFactors } from "@/components/lsp/EligibilityFactors";
import { EmptyState } from "@/components/ui/EmptyState";
import { OfferCardSkeleton, PageLoadingShell } from "@/components/ui/Skeleton";
import {
  checkEligibility,
  EligibilityResult,
  fetchOffers,
  getJourney,
  getRequiredFields,
  LoanOffer,
  panLookup,
  RequiredField,
  selectOffer,
  sendOtp,
  setPartnerPreference,
  submitDetails,
  verifyOtp,
  type JourneyState,
  type WorkflowStep,
} from "@/lib/api";
import { CONSENT_VERSIONS } from "@/lib/consent";
import {
  clearDraftMobile,
  clearStoredSessionToken,
  getDraftMobile,
  setDraftMobile,
} from "@/lib/customer-session";

type Step = "mobile" | "otp" | "details" | "offers";
type SortBy = "rate" | "amount" | "emi";
type OffersView = "compare" | "cards";
type ProfileSubStep =
  | "pan"
  | "name"
  | "dob"
  | "email"
  | "pincode"
  | "gender"
  | "income"
  | "employment"
  | "city"
  | "purpose"
  | "emi"
  | "consent";

const STEPS: Step[] = ["mobile", "otp", "details", "offers"];

const PROFILE_SUB_LABELS: Record<ProfileSubStep, string> = {
  pan: "PAN number",
  name: "Full name",
  dob: "Date of birth",
  email: "Email",
  pincode: "PIN code",
  gender: "Gender",
  income: "Monthly income",
  employment: "Employment type",
  city: "City",
  purpose: "Loan purpose",
  emi: "Existing EMI",
  consent: "Terms & consent",
};

function buildProfileSubSteps(
  requiredFields: RequiredField[],
  needsPartnerExtras: boolean,
  panVerified: boolean,
): ProfileSubStep[] {
  const needs = (key: string) => requiredFields.some((f) => f.key === key);
  const steps: ProfileSubStep[] = ["pan", "name"];
  if (needs("date_of_birth") || panVerified) steps.push("dob");
  if (needsPartnerExtras) {
    steps.push("email", "pincode");
  } else {
    if (needs("email")) steps.push("email");
    if (needs("pincode")) steps.push("pincode");
  }
  if (needs("gender")) steps.push("gender");
  steps.push("income", "employment", "city", "purpose", "emi", "consent");
  return steps;
}

function resolveProfileStepIndex(
  steps: ProfileSubStep[],
  lead: {
    pan?: string | null;
    full_name?: string | null;
    date_of_birth?: string | null;
    email?: string | null;
    pincode?: string | null;
    gender?: string | null;
    monthly_income?: number | null;
    city?: string | null;
  } | null | undefined,
): number {
  if (!lead) return 0;
  for (let i = 0; i < steps.length; i++) {
    const s = steps[i];
    switch (s) {
      case "pan":
        if (!lead.pan || lead.pan.length !== 10) return i;
        break;
      case "name":
        if (!lead.full_name?.trim()) return i;
        break;
      case "dob":
        if (!lead.date_of_birth) return i;
        break;
      case "email":
        if (!lead.email?.includes("@")) return i;
        break;
      case "pincode":
        if (!lead.pincode || lead.pincode.length !== 6) return i;
        break;
      case "gender":
        if (!lead.gender) return i;
        break;
      case "income":
        if (!lead.monthly_income || lead.monthly_income < 15000) return i;
        break;
      case "city":
        if (!lead.city?.trim()) return i;
        break;
      case "consent":
        return i;
      default:
        break;
    }
  }
  return Math.max(0, steps.length - 1);
}

function validateProfileStep(
  subStep: ProfileSubStep,
  form: {
    pan: string;
    full_name: string;
    date_of_birth: string;
    email: string;
    pincode: string;
    gender: string;
    monthly_income: string;
    city: string;
  },
  needsPartnerExtras: boolean,
  preferredPartner: string,
  allRequiredConsents: boolean,
): string | null {
  switch (subStep) {
    case "pan":
      return form.pan.length !== 10 ? "Enter a valid 10-character PAN." : null;
    case "name":
      return !form.full_name.trim() ? "Enter your full name as per PAN." : null;
    case "dob":
      return !form.date_of_birth ? "Select your date of birth." : null;
    case "email":
      if (preferredPartner === "choiceconnect" || needsPartnerExtras) {
        return !form.email.includes("@") ? "Enter a valid email address." : null;
      }
      return null;
    case "pincode":
      if (preferredPartner === "choiceconnect" || needsPartnerExtras) {
        return form.pincode.length !== 6 ? "Enter a valid 6-digit PIN code." : null;
      }
      return null;
    case "gender":
      return !form.gender ? "Please select gender." : null;
    case "income":
      return Number(form.monthly_income) < 15000 ? "Minimum monthly income is ₹15,000." : null;
    case "city":
      return !form.city.trim() ? "Enter your city." : null;
    case "consent":
      return !allRequiredConsents ? "Please accept required terms to continue." : null;
    default:
      return null;
  }
}

const DEFAULT_WORKFLOW: WorkflowStep[] = [
  { id: "mobile", label: "Mobile", phase: "apply" },
  { id: "otp", label: "Verify OTP", phase: "apply" },
  { id: "details", label: "Profile", phase: "apply" },
  { id: "offers", label: "Offers", phase: "apply" },
  { id: "kyc", label: "KYC", phase: "kyc" },
  { id: "bank", label: "Bank", phase: "kyc" },
  { id: "esign", label: "eSign", phase: "kyc" },
  { id: "submit", label: "Submit", phase: "kyc" },
  { id: "review", label: "Review", phase: "lender" },
  { id: "disbursal", label: "Disbursal", phase: "lender" },
];

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-neercred-teal focus:ring-2 focus:ring-neercred-teal/20";

function ApplyPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const partnerSlug = searchParams.get("partner")?.toLowerCase() ?? "";

  const [step, setStep] = useState<Step>("mobile");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [sessionToken, setSessionToken] = useState("");
  const [offers, setOffers] = useState<LoanOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [booting, setBooting] = useState(true);
  const [error, setError] = useState("");
  const [resumeMsg, setResumeMsg] = useState("");
  const [eligibility, setEligibility] = useState<EligibilityResult | null>(null);
  const [sortBy, setSortBy] = useState<SortBy>("rate");
  const [offersView, setOffersView] = useState<OffersView>("compare");
  const [offersFetching, setOffersFetching] = useState(false);
  const [selectingOfferId, setSelectingOfferId] = useState<string | null>(null);
  const [activeField, setActiveField] = useState<GuideField>(null);
  const [panLoading, setPanLoading] = useState(false);
  const [panVerified, setPanVerified] = useState(false);
  const [workflow, setWorkflow] = useState<WorkflowStep[]>(DEFAULT_WORKFLOW);
  const [workflowStep, setWorkflowStep] = useState("mobile");
  const [preferredPartner, setPreferredPartner] = useState(partnerSlug);

  const [smsConsent, setSmsConsent] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [termsConsent, setTermsConsent] = useState(false);
  const [dpdpConsent, setDpdpConsent] = useState(false);
  const [creditConsent, setCreditConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [lenderConsent, setLenderConsent] = useState(false);
  const [profileStepIndex, setProfileStepIndex] = useState(0);

  const allRequiredConsents = privacyConsent && termsConsent && dpdpConsent;
  const allConsentsAccepted =
    privacyConsent && termsConsent && dpdpConsent && creditConsent && marketingConsent;

  const acceptAllConsents = useCallback((checked: boolean) => {
    setPrivacyConsent(checked);
    setTermsConsent(checked);
    setDpdpConsent(checked);
    setCreditConsent(checked);
    setMarketingConsent(checked);
  }, []);

  const [requiredFields, setRequiredFields] = useState<RequiredField[]>([]);
  const needs = (key: string) => requiredFields.some((f) => f.key === key);
  const needsPartnerExtras = preferredPartner === "choiceconnect" || needs("email") || needs("pincode");

  const profileSubSteps = useMemo(
    () => buildProfileSubSteps(requiredFields, needsPartnerExtras, panVerified),
    [needsPartnerExtras, panVerified, requiredFields],
  );
  const currentProfileStep = profileSubSteps[profileStepIndex] ?? "pan";

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

  const hydrateFromJourney = useCallback(async (journey: JourneyState, token: string) => {
    if (journey.workflow?.length) setWorkflow(journey.workflow);
    setWorkflowStep(journey.workflow_step);

    if (journey.lead) {
      const l = journey.lead;
      const resolvedMobile = journey.mobile ?? l.mobile;
      if (resolvedMobile) setMobile(resolvedMobile);
      setForm((f) => ({
        ...f,
        full_name: l.full_name || f.full_name,
        pan: l.pan || f.pan,
        date_of_birth: l.date_of_birth || f.date_of_birth,
        email: l.email || f.email,
        pincode: l.pincode || f.pincode,
        gender: (l.gender as typeof f.gender) || f.gender,
        monthly_income: l.monthly_income ? String(l.monthly_income) : f.monthly_income,
        employment_type: (l.employment_type as typeof f.employment_type) || f.employment_type,
        city: l.city || f.city,
        loan_purpose: (l.loan_purpose as typeof f.loan_purpose) || f.loan_purpose,
        existing_emi: l.existing_emi ? String(l.existing_emi) : f.existing_emi,
      }));
      if (l.pan) setPanVerified(true);
      if (l.preferred_partner_slug) setPreferredPartner(l.preferred_partner_slug);
    }

    if (journey.next_step === "kyc" && journey.application) {
      setResumeMsg(`Welcome back! Continue KYC with ${journey.application.lender_name}.`);
      router.replace(`/application/${journey.application.id}/kyc`);
      return;
    }
    if (journey.next_step === "dashboard") {
      setResumeMsg("You have an active application. Opening dashboard…");
      router.replace("/dashboard");
      return;
    }

    const applyStep = journey.apply_step as Step;
    if (applyStep && STEPS.includes(applyStep)) {
      setStep(applyStep);
      if (applyStep === "details" && journey.lead) {
        const extras = journey.lead.preferred_partner_slug === "choiceconnect";
        const subSteps = buildProfileSubSteps([], extras, Boolean(journey.lead.pan));
        setProfileStepIndex(resolveProfileStepIndex(subSteps, journey.lead));
      }
      if (applyStep === "offers" && token) {
        try {
          const offersRes = await fetchOffers(token);
          setOffers(offersRes.offers);
          if (journey.lead?.eligibility_score) {
            setEligibility({
              eligible: true,
              score: journey.lead.eligibility_score,
              max_loan_amount: journey.lead.max_loan_amount || 0,
              recommended_tenure: 36,
              debt_to_income_ratio: 0,
              message: "Welcome back — your offers are ready.",
              factors: [],
            });
          }
        } catch {
          setStep("details");
        }
      }
      if (journey.can_resume) {
        setResumeMsg("Welcome back! We've restored your progress — continue where you left off.");
      }
    }
  }, [router]);

  useEffect(() => {
    void getRequiredFields()
      .then((res) => setRequiredFields(res.fields))
      .catch(() => setRequiredFields([]));
  }, []);

  useEffect(() => {
    const draft = getDraftMobile();
    if (draft) setMobile(draft);

    const token = localStorage.getItem("session_token") || "";
    if (token) setSessionToken(token);

    void (async () => {
      try {
        const journey = await getJourney(token || undefined);
        if (token && journey.authenticated) {
          clearDraftMobile();
          await hydrateFromJourney(journey, token);
          if (partnerSlug && token) {
            await setPartnerPreference(token, partnerSlug).catch(() => {});
            setPreferredPartner(partnerSlug);
          }
        } else if (token && !journey.authenticated) {
          clearStoredSessionToken();
        } else if (partnerSlug) {
          setPreferredPartner(partnerSlug);
        }
      } catch {
        if (token) clearStoredSessionToken();
      } finally {
        setBooting(false);
      }
    })();
  }, [hydrateFromJourney, partnerSlug]);

  const stepIndex = STEPS.indexOf(step);
  const progress = ((stepIndex + 1) / STEPS.length) * 100;

  const journeyTitles: Record<Step, { title: string; subtitle: string }> = {
    mobile: {
      title: "Let's verify it's you",
      subtitle: "Enter your mobile number. We'll send a secure OTP — no spam, no pressure.",
    },
    otp: {
      title: "Confirm with OTP",
      subtitle: "One quick code to protect your account and unlock your saved journey.",
    },
    details: {
      title: "Build your profile",
      subtitle: "One question at a time. Neera guides you — we only ask what's needed for your offers.",
    },
    offers: {
      title: "Your personalised offers",
      subtitle: "Expert-ranked options from regulated lenders. Compare calmly, choose with confidence.",
    },
  };

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

  async function handlePanBlur() {
    if (form.pan.length !== 10 || !sessionToken || panVerified) return;
    setPanLoading(true);
    setError("");
    try {
      const res = await panLookup(sessionToken, form.pan);
      setForm((f) => ({
        ...f,
        full_name: res.full_name,
        date_of_birth: res.date_of_birth,
        gender: res.gender,
      }));
      setPanVerified(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "PAN verification failed");
    } finally {
      setPanLoading(false);
    }
  }

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
      setDraftMobile(mobile);
      setDevOtp(res.dev_otp || null);
      setStep("otp");
      setWorkflowStep("otp");
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
      clearDraftMobile();
      window.dispatchEvent(new Event("neercred:session"));
      if (preferredPartner) {
        await setPartnerPreference(res.session_token, preferredPartner).catch(() => {});
      }
      setStep("details");
      setWorkflowStep("details");
      setProfileStepIndex(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Incorrect OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitDetails(e?: React.FormEvent) {
    e?.preventDefault();
    if (!allRequiredConsents) {
      setError("Please accept Privacy Policy, Terms, and data processing consent.");
      return;
    }
    setError("");
    setLoading(true);
    setOffersFetching(true);
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
        page_url: preferredPartner ? `/apply?partner=${preferredPartner}` : "/apply",
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
      setWorkflowStep("offers");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      setOffersFetching(false);
    }
  }

  function handleProfileContinue() {
    const validationError = validateProfileStep(
      currentProfileStep,
      form,
      needsPartnerExtras,
      preferredPartner,
      allRequiredConsents,
    );
    if (validationError) {
      setError(validationError);
      return;
    }
    setError("");
    if (currentProfileStep === "pan" && form.pan.length === 10 && !panVerified) {
      void handlePanBlur();
    }
    if (profileStepIndex < profileSubSteps.length - 1) {
      setProfileStepIndex((i) => i + 1);
      return;
    }
    void handleSubmitDetails();
  }

  function handleProfileBack() {
    setError("");
    if (profileStepIndex > 0) {
      setProfileStepIndex((i) => i - 1);
      return;
    }
    setStep("otp");
    setWorkflowStep("otp");
  }

  async function handleSelectOffer(offer: LoanOffer) {
    if (!lenderConsent) {
      setError("Please consent to share your details with the lender you select.");
      return;
    }
    setError("");
    setLoading(true);
    setSelectingOfferId(offer.offer_id);
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
      if (res.workflow_mode === "external_handoff" && (res.handoff_path || res.next_step)) {
        if (res.application_id) {
          localStorage.setItem(`app_ref_${res.application_id}`, res.application_ref || "");
        }
        router.push(res.handoff_path || res.next_step || `/apply/partner/${offer.partner_slug}/handoff`);
        return;
      }
      if (res.application_id) {
        localStorage.setItem(`app_ref_${res.application_id}`, res.application_ref || "");
        router.push(`/application/${res.application_id}/kyc`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not select offer. Try again.");
    } finally {
      setLoading(false);
      setSelectingOfferId(null);
    }
  }

  if (booting) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-teal-50/30">
        <Header />
        <PageLoadingShell title="Restoring your journey" subtitle="Picking up right where you left off…" />
      </main>
    );
  }

  const bestOfferId =
    sortedOffers.find((o) => o.is_best_deal)?.offer_id ||
    [...sortedOffers].sort((a, b) => a.interest_rate - b.interest_rate)[0]?.offer_id;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-teal-50/30">
      <Header />

      <div className="mx-auto max-w-2xl px-4 py-8 sm:py-12">
        <JourneyStepHeader
          stepLabel={`Step ${stepIndex + 1} of ${STEPS.length}`}
          title={journeyTitles[step].title}
          subtitle={
            preferredPartner && step === "mobile"
              ? `Applying via partner — all steps on NeerCred, no repeat forms.`
              : journeyTitles[step].subtitle
          }
          progressPercent={progress}
        />

        <div className="mb-6 hidden sm:block">
          <JourneyWorkflow steps={workflow} currentStepId={workflowStep} />
        </div>
        <div className="mb-6 sm:hidden">
          <JourneyWorkflow steps={workflow} currentStepId={workflowStep} compact />
        </div>

        {resumeMsg && (
          <div className="mb-4 rounded-xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
            {resumeMsg}
          </div>
        )}

        <div className="mb-6 flex items-start justify-end gap-2 sm:gap-3">
          <LoanGuideMascot
            step={step}
            activeField={activeField}
            show={step !== "offers" || offers.length === 0}
            variant="inline"
          />
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
                onFocus={() => setActiveField("mobile")}
                className={`${inputClass} mt-6 text-lg`}
                required
              />
              <label className="mt-4 flex items-start gap-3 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={smsConsent}
                  onChange={(e) => setSmsConsent(e.target.checked)}
                  onFocus={() => setActiveField("sms_consent")}
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
                onFocus={() => setActiveField("otp")}
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
            <div>
              <p className="text-xs font-medium text-slate-400">
                Profile {profileStepIndex + 1} of {profileSubSteps.length} · {PROFILE_SUB_LABELS[currentProfileStep]}
              </p>
              <h2 className="mt-2 text-xl font-bold text-neercred-navy">{PROFILE_SUB_LABELS[currentProfileStep]}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {currentProfileStep === "pan" && "Enter PAN — name and details auto-fill from records."}
                {currentProfileStep === "name" && "Name as per your PAN card."}
                {currentProfileStep === "dob" && "Your date of birth as per PAN."}
                {currentProfileStep === "email" && "We'll send application updates here."}
                {currentProfileStep === "pincode" && "Your current residential PIN code."}
                {currentProfileStep === "gender" && "Select gender as per official records."}
                {currentProfileStep === "income" && "Your gross monthly income in rupees."}
                {currentProfileStep === "employment" && "How do you earn your income?"}
                {currentProfileStep === "city" && "City where you currently live."}
                {currentProfileStep === "purpose" && "What will you use this loan for?"}
                {currentProfileStep === "emi" && "Total EMI you pay on other loans each month."}
                {currentProfileStep === "consent" && "Review and accept to see your loan offers."}
              </p>

              <div className="mt-6">
                {currentProfileStep === "pan" && (
                  <div>
                    <input
                      type="text"
                      maxLength={10}
                      placeholder="ABCDE1234F"
                      value={form.pan}
                      onChange={(e) => {
                        setPanVerified(false);
                        setForm({ ...form, pan: e.target.value.toUpperCase() });
                      }}
                      onFocus={() => setActiveField("pan")}
                      onBlur={() => void handlePanBlur()}
                      className={`${inputClass} uppercase text-lg`}
                      required
                      autoFocus
                    />
                    {panLoading && <p className="mt-2 text-xs text-neercred-teal">Fetching PAN details…</p>}
                    {panVerified && (
                      <p className="mt-2 text-xs text-emerald-600">✓ PAN verified — details auto-filled</p>
                    )}
                  </div>
                )}

                {currentProfileStep === "name" && (
                  <input
                    type="text"
                    placeholder="Full name (as per PAN)"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    onFocus={() => setActiveField("full_name")}
                    className={`${inputClass} text-lg`}
                    required
                    readOnly={panVerified}
                    autoFocus
                  />
                )}

                {currentProfileStep === "dob" && (
                  <input
                    type="date"
                    value={form.date_of_birth}
                    onChange={(e) => setForm({ ...form, date_of_birth: e.target.value })}
                    className={`${inputClass} text-lg`}
                    required
                    readOnly={panVerified}
                    autoFocus
                  />
                )}

                {currentProfileStep === "email" && (
                  <input
                    type="email"
                    placeholder="you@email.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className={`${inputClass} text-lg`}
                    required={preferredPartner === "choiceconnect" || needsPartnerExtras}
                    autoFocus
                  />
                )}

                {currentProfileStep === "pincode" && (
                  <input
                    type="text"
                    maxLength={6}
                    inputMode="numeric"
                    placeholder="6-digit PIN"
                    value={form.pincode}
                    onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, "") })}
                    className={`${inputClass} text-lg`}
                    required={preferredPartner === "choiceconnect" || needsPartnerExtras}
                    autoFocus
                  />
                )}

                {currentProfileStep === "gender" && (
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value as typeof form.gender })}
                    className={`${inputClass} text-lg`}
                    autoFocus
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                )}

                {currentProfileStep === "income" && (
                  <input
                    type="number"
                    placeholder="Monthly income (₹)"
                    value={form.monthly_income}
                    onChange={(e) => setForm({ ...form, monthly_income: e.target.value })}
                    onFocus={() => setActiveField("monthly_income")}
                    className={`${inputClass} text-lg`}
                    required
                    min={15000}
                    autoFocus
                  />
                )}

                {currentProfileStep === "employment" && (
                  <select
                    value={form.employment_type}
                    onChange={(e) =>
                      setForm({ ...form, employment_type: e.target.value as typeof form.employment_type })
                    }
                    onFocus={() => setActiveField("employment_type")}
                    className={`${inputClass} text-lg`}
                    autoFocus
                  >
                    <option value="salaried">Salaried</option>
                    <option value="self_employed">Self employed</option>
                    <option value="business">Business owner</option>
                  </select>
                )}

                {currentProfileStep === "city" && (
                  <input
                    type="text"
                    placeholder="Your city"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    onFocus={() => setActiveField("city")}
                    className={`${inputClass} text-lg`}
                    required
                    autoFocus
                  />
                )}

                {currentProfileStep === "purpose" && (
                  <select
                    value={form.loan_purpose}
                    onChange={(e) =>
                      setForm({ ...form, loan_purpose: e.target.value as typeof form.loan_purpose })
                    }
                    onFocus={() => setActiveField("loan_purpose")}
                    className={`${inputClass} text-lg`}
                    autoFocus
                  >
                    <option value="personal">Personal</option>
                    <option value="medical">Medical</option>
                    <option value="wedding">Wedding</option>
                    <option value="travel">Travel</option>
                    <option value="business">Business</option>
                    <option value="education">Education</option>
                  </select>
                )}

                {currentProfileStep === "emi" && (
                  <input
                    type="number"
                    placeholder="0 if none"
                    value={form.existing_emi}
                    onChange={(e) => setForm({ ...form, existing_emi: e.target.value })}
                    onFocus={() => setActiveField("existing_emi")}
                    className={`${inputClass} text-lg`}
                    min={0}
                    autoFocus
                  />
                )}

                {currentProfileStep === "consent" && (
                  <div
                    className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4 text-sm text-slate-600"
                    onFocus={() => setActiveField("consent")}
                  >
                    <label className="flex items-center gap-3 rounded-xl border-2 border-teal-200 bg-teal-50 px-3 py-3 font-semibold text-slate-800">
                      <input
                        type="checkbox"
                        checked={allConsentsAccepted}
                        onChange={(e) => acceptAllConsents(e.target.checked)}
                        className="accent-neercred-teal"
                      />
                      Accept all terms &amp; consents
                    </label>
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={privacyConsent}
                        onChange={(e) => setPrivacyConsent(e.target.checked)}
                        className="mt-1 accent-neercred-teal"
                      />
                      <span>
                        I accept the{" "}
                        <Link href="/compliance" className="font-medium text-neercred-teal underline">
                          Privacy Policy
                        </Link>
                        .
                      </span>
                    </label>
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={termsConsent}
                        onChange={(e) => setTermsConsent(e.target.checked)}
                        className="mt-1 accent-neercred-teal"
                      />
                      <span>
                        I accept the{" "}
                        <Link href="/compliance" className="font-medium text-neercred-teal underline">
                          Terms of Service
                        </Link>
                        .
                      </span>
                    </label>
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={dpdpConsent}
                        onChange={(e) => setDpdpConsent(e.target.checked)}
                        className="mt-1 accent-neercred-teal"
                      />
                      <span>I consent to data processing under DPDP Act 2023.</span>
                    </label>
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={creditConsent}
                        onChange={(e) => setCreditConsent(e.target.checked)}
                        className="mt-1 accent-neercred-teal"
                      />
                      <span className="text-slate-500">Credit bureau check for better offers.</span>
                    </label>
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={marketingConsent}
                        onChange={(e) => setMarketingConsent(e.target.checked)}
                        className="mt-1 accent-neercred-teal"
                      />
                      <span className="text-slate-500">Product updates via SMS or email.</span>
                    </label>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={handleProfileBack}
                  className="w-full rounded-xl border border-slate-200 py-3.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={() => void handleProfileContinue()}
                  disabled={loading || (currentProfileStep === "consent" && !allRequiredConsents)}
                  className="neercred-btn w-full py-3.5 disabled:opacity-50"
                >
                  {loading
                    ? "Finding your offers…"
                    : profileStepIndex < profileSubSteps.length - 1
                      ? "Continue"
                      : "See my offers"}
                </button>
              </div>
            </div>
          )}

          {step === "offers" && (
            <div onFocus={() => setActiveField("offers")}>
              {offersFetching && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-500">Finding your best offers from partner lenders…</p>
                  <OfferCardSkeleton />
                  <OfferCardSkeleton />
                </div>
              )}

              {!offersFetching && eligibility && (
                <div className="mb-6">
                  <EligibilityFactors
                    score={eligibility.score}
                    maxAmount={eligibility.max_loan_amount}
                    factors={eligibility.factors}
                    message={eligibility.message}
                  />
                </div>
              )}

              {!offersFetching && offers.length === 0 && (
                <EmptyState
                  title="No offers matched right now"
                  description="This can happen based on income, credit profile, or lender criteria. Try adjusting your loan amount or check back soon — we'll notify you when new options appear."
                  action={{ label: "Update profile", href: "/apply" }}
                  secondaryAction={{ label: "Talk to support", href: "/help" }}
                />
              )}

              {!offersFetching && offers.length > 0 && (
                <>
                  <div className="flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500">
                        {offers.length} regulated lender{offers.length > 1 ? "s" : ""} · Compare like an expert
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="flex rounded-xl border border-slate-200 p-0.5 text-xs font-semibold">
                        <button
                          type="button"
                          onClick={() => setOffersView("compare")}
                          className={`rounded-lg px-3 py-1.5 ${offersView === "compare" ? "bg-neercred-teal text-white" : "text-slate-600"}`}
                        >
                          Compare
                        </button>
                        <button
                          type="button"
                          onClick={() => setOffersView("cards")}
                          className={`rounded-lg px-3 py-1.5 ${offersView === "cards" ? "bg-neercred-teal text-white" : "text-slate-600"}`}
                        >
                          Cards
                        </button>
                      </div>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortBy)}
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                      >
                        <option value="rate">Lowest rate</option>
                        <option value="emi">Lowest EMI</option>
                        <option value="amount">Highest amount</option>
                      </select>
                    </div>
                  </div>

                  <label className="mt-6 flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/60 p-4 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={lenderConsent}
                      onChange={(e) => setLenderConsent(e.target.checked)}
                      className="mt-1 accent-neercred-teal"
                    />
                    <span>I consent to share my application with the lender I select — processed securely inside NeerCred.</span>
                  </label>

                  <div className="mt-6">
                    {offersView === "compare" ? (
                      <OfferComparisonTable
                        offers={sortedOffers}
                        bestOfferId={bestOfferId}
                        onSelect={handleSelectOffer}
                        loading={loading}
                        loadingOfferId={selectingOfferId ?? undefined}
                      />
                    ) : (
                      <div className="space-y-5">
                        {sortedOffers.map((offer) => (
                          <OfferCard
                            key={offer.offer_id}
                            offer={offer}
                            onSelect={handleSelectOffer}
                            loading={loading && selectingOfferId === offer.offer_id}
                            recommended={recommendations[offer.offer_id]}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <p className="mt-6 flex items-center justify-center gap-2 text-center text-xs text-slate-400">
          <IconShield size={14} />
          RBI LSP platform · 256-bit encryption · End-to-end on NeerCred
        </p>
      </div>

      <Footer />
    </main>
  );
}

export default function ApplyPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-slate-50">
          <p className="animate-pulse text-slate-500">Loading…</p>
        </main>
      }
    >
      <ApplyPageInner />
    </Suspense>
  );
}
