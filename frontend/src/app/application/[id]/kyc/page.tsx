"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { NeerCredLogo } from "@/components/NeerCredLogo";
import { INDIAN_IMAGES } from "@/lib/indian-images";
import {
  aadhaarSendOtp,
  aadhaarVerify,
  bankVerify,
  esignComplete,
  getJourney,
  getKycStatus,
  submitApplication,
} from "@/lib/api";
import { JourneyWorkflow } from "@/components/loan-journey/JourneyWorkflow";
import { JourneyStepHeader } from "@/components/JourneyStepHeader";
import { LspDisclosure } from "@/components/lsp/LspDisclosure";
import { KfsDocument } from "@/components/lsp/KfsDocument";

type KycStep = "aadhaar" | "aadhaar_otp" | "bank" | "kfs" | "esign" | "submit" | "done";

export default function KycPage() {
  const params = useParams();
  const router = useRouter();
  const appId = Number(params.id);

  const [step, setStep] = useState<KycStep>("aadhaar");
  const [token, setToken] = useState("");
  const [aadhaar, setAadhaar] = useState("");
  const [aadhaarOtp, setAadhaarOtp] = useState("");
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [account, setAccount] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [address, setAddress] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [appRef, setAppRef] = useState("");
  const [lenderName, setLenderName] = useState("");
  const [workflowStep, setWorkflowStep] = useState("kyc");

  useEffect(() => {
    const t = localStorage.getItem("session_token");
    const ref = localStorage.getItem(`app_ref_${appId}`);
    if (!t) {
      router.push("/apply");
      return;
    }
    setToken(t);
    if (ref) setAppRef(ref);

    void (async () => {
      try {
        const [kyc, journey] = await Promise.all([
          getKycStatus(t, appId),
          getJourney(t),
        ]);
        setAppRef(kyc.application_ref);
        setLenderName(kyc.lender_name);
        setWorkflowStep(journey.workflow_step);
        if (kyc.address) setAddress(kyc.address);
        if (kyc.kyc_step === "done") setStep("done");
        else if (kyc.kyc_step === "submit") setStep("submit");
        else if (kyc.kyc_step === "esign") setStep("esign");
        else if (kyc.kyc_step === "kfs") setStep("kfs");
        else if (kyc.kyc_step === "bank") setStep("bank");
        else if (kyc.aadhaar_verified) setStep("bank");
      } catch {
        /* fresh KYC */
      }
    })();
  }, [appId, router]);

  const steps: KycStep[] = ["aadhaar", "bank", "kfs", "esign", "submit", "done"];

  async function handleAadhaar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await aadhaarSendOtp({ session_token: token, application_id: appId, aadhaar });
      setDevOtp(res.dev_otp || null);
      setStep("aadhaar_otp");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleAadhaarOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await aadhaarVerify({ session_token: token, application_id: appId, otp: aadhaarOtp });
      setStep("bank");
      setWorkflowStep("bank");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid OTP");
    } finally {
      setLoading(false);
    }
  }

  async function handleBank(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await bankVerify({
        session_token: token,
        application_id: appId,
        account_number: account,
        ifsc,
        address,
      });
      setStep("esign");
      setWorkflowStep("esign");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleEsign(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await esignComplete({
        session_token: token,
        application_id: appId,
        agreed,
        page_url: `/application/${appId}/kyc`,
      });
      setStep("submit");
      setWorkflowStep("submit");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      await submitApplication({ session_token: token, application_id: appId });
      setStep("done");
      setWorkflowStep("review");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  const stepIndex = step === "aadhaar_otp" ? 0 : steps.indexOf(step as typeof steps[number]);

  const kycTitles: Record<KycStep, { title: string; subtitle: string }> = {
    aadhaar: {
      title: "Verify your identity",
      subtitle: "Aadhaar eKYC confirms who you are — required by RBI for all digital loans.",
    },
    aadhaar_otp: {
      title: "Enter Aadhaar OTP",
      subtitle: "We sent a one-time code to your Aadhaar-linked mobile via UIDAI.",
    },
    bank: {
      title: "Link your bank account",
      subtitle: "Disbursal happens here — we verify ownership before transferring funds.",
    },
    kfs: {
      title: "Review Key Fact Statement",
      subtitle: "RBI requires you to review fees, APR, and cooling-off rights before signing.",
    },
    esign: {
      title: "Sign your loan agreement",
      subtitle: "Digital eSign is legally binding. Review terms before you agree.",
    },
    submit: {
      title: "Submit to lender",
      subtitle: "One final step — your verified profile goes to the lender for approval.",
    },
    done: {
      title: "Application submitted",
      subtitle: "You're all set. We'll notify you when the lender updates your status.",
    },
  };

  return (
    <>
      <Header />
      <main className="min-h-screen bg-slate-50">
        <div className="relative overflow-hidden bg-neercred-navy py-8 text-white">
          <Image
            src={INDIAN_IMAGES.howItWorks.form}
            alt=""
            fill
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-neercred-navy/95 to-neercred-teal/80" />
          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 text-center sm:flex-row sm:text-left">
            <NeerCredLogo dark size={48} className="h-10 w-auto shrink-0" />
            <div>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold">Phase 3 — KYC &amp; eSign</span>
              {appRef && <p className="mt-2 font-mono text-sm text-teal-200">Ref: {appRef}</p>}
              <p className="mt-1 text-sm text-slate-300">
                {lenderName
                  ? `All steps with ${lenderName} — inside NeerCred, no external redirect`
                  : "Secure Aadhaar, bank verification & digital signing"}
              </p>
            </div>
          </div>
        </div>

      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-6">
          <JourneyWorkflow
            steps={[
              { id: "mobile", label: "Mobile", phase: "apply" },
              { id: "otp", label: "Verify", phase: "apply" },
              { id: "details", label: "Profile", phase: "apply" },
              { id: "offers", label: "Offers", phase: "apply" },
              { id: "kyc", label: "KYC", phase: "kyc" },
              { id: "bank", label: "Bank", phase: "kyc" },
              { id: "esign", label: "eSign", phase: "kyc" },
              { id: "submit", label: "Submit", phase: "kyc" },
              { id: "review", label: "Review", phase: "lender" },
              { id: "disbursal", label: "Disbursal", phase: "lender" },
            ]}
            currentStepId={workflowStep}
            compact
          />
        </div>

        <div className="mb-8 flex justify-between">
          {["Aadhaar", "Bank", "KFS", "eSign", "Submit", "Done"].map((label, i) => (
            <div key={label} className="flex flex-col items-center">
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

        <JourneyStepHeader
          stepLabel={`Verification · Step ${stepIndex + 1} of ${steps.length}`}
          title={kycTitles[step].title}
          subtitle={kycTitles[step].subtitle}
          progressPercent={((stepIndex + 1) / steps.length) * 100}
          trustNote="UIDAI & NPCI compliant · End-to-end encrypted"
        />

        <LspDisclosure lenderName={lenderName} className="mb-4" />

        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-neercred">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
          )}

          {(step === "aadhaar" || step === "aadhaar_otp") && (
            <>
              {step === "aadhaar" ? (
                <form onSubmit={handleAadhaar}>
                  <h2 className="text-2xl font-bold">Aadhaar eKYC</h2>
                  <p className="mt-2 text-slate-500">OTP will be sent to your Aadhaar-linked mobile via UIDAI</p>
                  <input
                    placeholder="12-digit Aadhaar number"
                    value={aadhaar}
                    onChange={(e) => setAadhaar(e.target.value.replace(/\D/g, "").slice(0, 12))}
                    className="mt-6 w-full rounded-xl border px-4 py-3 outline-none focus:border-teal-500"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading || aadhaar.length !== 12}
                    className="mt-6 w-full rounded-xl bg-teal-600 py-3 font-bold text-white disabled:opacity-50"
                  >
                    Send Aadhaar OTP →
                  </button>
                </form>
              ) : (
                <form onSubmit={handleAadhaarOtp}>
                  <h2 className="text-2xl font-bold">Aadhaar OTP</h2>
                  {devOtp && (
                    <p className="mt-2 rounded-lg bg-yellow-50 px-3 py-2 text-sm font-mono text-yellow-800">
                      Dev OTP: {devOtp}
                    </p>
                  )}
                  <input
                    placeholder="6-digit OTP"
                    value={aadhaarOtp}
                    onChange={(e) => setAadhaarOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="mt-6 w-full rounded-xl border px-4 py-3 text-center text-2xl tracking-widest"
                    required
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 w-full rounded-xl bg-teal-600 py-3 font-bold text-white"
                  >
                    Verify Aadhaar →
                  </button>
                </form>
              )}
            </>
          )}

          {step === "bank" && (
            <form onSubmit={handleBank}>
              <h2 className="text-2xl font-bold">Bank Verification</h2>
              <p className="mt-2 text-slate-500">Penny drop — ₹1 credit & reverse for verification</p>
              <div className="mt-6 space-y-4">
                <input
                  placeholder="Bank Account Number"
                  value={account}
                  onChange={(e) => setAccount(e.target.value.replace(/\D/g, ""))}
                  className="w-full rounded-xl border px-4 py-3 outline-none focus:border-teal-500"
                  required
                />
                <input
                  placeholder="IFSC Code"
                  value={ifsc}
                  onChange={(e) => setIfsc(e.target.value.toUpperCase().slice(0, 11))}
                  className="w-full rounded-xl border px-4 py-3 uppercase outline-none"
                  required
                />
                <textarea
                  placeholder="Current Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows={3}
                  className="w-full rounded-xl border px-4 py-3 outline-none"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="mt-6 w-full rounded-xl bg-teal-600 py-3 font-bold text-white"
              >
                Verify Bank Account →
              </button>
            </form>
          )}

          {step === "kfs" && token && (
            <KfsDocument
              applicationId={appId}
              sessionToken={token}
              onAccepted={() => {
                setStep("esign");
                setWorkflowStep("esign");
              }}
            />
          )}

          {step === "esign" && (
            <form onSubmit={handleEsign}>
              <h2 className="text-2xl font-bold">Digital Loan Agreement</h2>
              <div className="mt-4 max-h-48 overflow-y-auto rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                <p>
                  I hereby authorize the lender to process my personal loan application. I confirm
                  that all information provided is accurate. I agree to the terms of the loan
                  agreement including interest rate, EMI, processing fees, and foreclosure charges as
                  disclosed in the Key Fact Statement. Loan will be disbursed directly to my
                  verified bank account. This agreement is governed by RBI guidelines and DPDP Act
                  2023.
                </p>
              </div>
              <label className="mt-4 flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 accent-teal-600"
                />
                <span>
                  I have read and agree to the loan agreement and{" "}
                  <Link href="/compliance" className="text-teal-600 underline">
                    RBI/DPDP compliance terms
                  </Link>
                </span>
              </label>
              <button
                type="submit"
                disabled={loading || !agreed}
                className="mt-6 w-full rounded-xl bg-teal-600 py-3 font-bold text-white disabled:opacity-50"
              >
                Sign Digitally →
              </button>
            </form>
          )}

          {step === "submit" && (
            <div className="text-center">
              <p className="text-4xl">📤</p>
              <h2 className="mt-4 text-2xl font-bold">Ready to Submit</h2>
              <p className="mt-2 text-slate-500">
                Your application will be sent to the partner lender for final approval
              </p>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="mt-6 w-full rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 py-3 font-bold text-white"
              >
                {loading ? "Submitting..." : "Submit Application →"}
              </button>
            </div>
          )}

          {step === "done" && (
            <div className="text-center">
              <p className="text-5xl">🎉</p>
              <h2 className="mt-4 text-2xl font-bold text-green-700">Application Submitted!</h2>
              <p className="mt-2 text-slate-500">
                The partner lender will review your application. Track status on your dashboard.
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <Link
                  href="/dashboard"
                  className="rounded-xl bg-teal-600 py-3 font-bold text-white"
                >
                  Go to Dashboard →
                </Link>
                <Link href={`/track?ref=${appRef}`} className="text-sm text-teal-600 underline">
                  Track Application
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
      </main>
      <Footer />
    </>
  );
}
