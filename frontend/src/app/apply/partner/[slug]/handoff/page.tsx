"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { JourneyWorkflow } from "@/components/loan-journey/JourneyWorkflow";
import { IconCheckCircle, IconShield } from "@/components/icons";
import { getPartnerHandoff, getJourney, type PartnerHandoff } from "@/lib/api";
import { LspDisclosure } from "@/components/lsp/LspDisclosure";

const FIELD_LABELS: Record<string, string> = {
  firstName: "First Name",
  lastName: "Last Name",
  mobile: "Mobile",
  email: "Email",
  pan: "PAN",
  dob: "Date of Birth",
  occupation: "Occupation",
  monthlyIncome: "Monthly Income",
  pincode: "PIN Code",
};

export default function PartnerHandoffPage() {
  const params = useParams();
  const router = useRouter();
  const slug = String(params.slug);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [handoff, setHandoff] = useState<PartnerHandoff | null>(null);
  const [error, setError] = useState("");
  const [synced, setSynced] = useState(false);
  const [showIframe, setShowIframe] = useState(false);
  const [appRef, setAppRef] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("session_token");
    if (!t) {
      router.replace(`/apply?partner=${slug}`);
      return;
    }
    void Promise.all([getPartnerHandoff(t, slug), getJourney(t)])
      .then(([data, journey]) => {
        setHandoff(data);
        if (journey.application?.application_ref) {
          setAppRef(journey.application.application_ref);
        }
        sessionStorage.setItem("neercred_handoff_prefill", JSON.stringify(data.prefill));
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load handoff"));
  }, [router, slug]);

  useEffect(() => {
    if (!handoff) return;
    setSynced(true);
  }, [handoff]);

  function openPartnerFullScreen() {
    if (!handoff) return;
    setShowIframe(true);
    setTimeout(() => {
      iframeRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  if (!handoff && !error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="animate-pulse text-slate-500">Preparing your verified profile…</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-slate-50">
        <Header />
        <div className="mx-auto max-w-lg px-4 py-16 text-center">
          <p className="text-red-600">{error}</p>
          <Link href={`/apply?partner=${slug}`} className="mt-4 inline-block text-teal-600 underline">
            Complete profile first →
          </Link>
        </div>
        <Footer />
      </main>
    );
  }

  const prefill = handoff!.prefill;

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-teal-50/20">
      <Header />

      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-6">
          <JourneyWorkflow
            steps={[
              { id: "mobile", label: "Mobile", phase: "apply" },
              { id: "otp", label: "Verify", phase: "apply" },
              { id: "details", label: "Profile", phase: "apply" },
              { id: "offers", label: "Offers", phase: "apply" },
              { id: "kyc", label: "Partner", phase: "kyc" },
              { id: "review", label: "Offers", phase: "lender" },
              { id: "disbursal", label: "Disbursal", phase: "lender" },
            ]}
            currentStepId="kyc"
            compact
          />
        </div>

        <div className="mb-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
          <p className="flex items-center gap-2 font-bold text-emerald-800">
            <IconCheckCircle size={20} />
            {handoff!.message}
          </p>
          {appRef && (
            <p className="mt-1 font-mono text-sm text-emerald-700">
              NeerCred ref: {appRef} — track anytime on dashboard
            </p>
          )}
          <p className="mt-1 text-sm text-emerald-700">
            Your verified details will auto-fill on {handoff!.lender_name}&apos;s page.
          </p>
        </div>

        <LspDisclosure lenderName={handoff!.lender_name} className="mb-6" />

        <div className="grid gap-6 lg:grid-cols-[minmax(0,340px)_1fr]">
          {/* Verified prefill panel */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
              <IconShield size={16} className="text-teal-600" />
              Verified on NeerCred
            </p>
            <ul className="mt-4 space-y-2">
              {Object.entries(prefill)
                .filter(([k, v]) => v && !["cba_code", "lead_source", "city", "gender", "loanPurpose"].includes(k))
                .map(([key, value]) => (
                  <li
                    key={key}
                    className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2 text-sm"
                  >
                    <span className="text-slate-500">{FIELD_LABELS[key] || key}</span>
                    <span className="font-semibold text-slate-800">{value}</span>
                  </li>
                ))}
            </ul>
            {synced && (
              <p className="mt-4 text-xs text-teal-600">✓ Auto-sync ready — partner form will use these values</p>
            )}
            <button
              type="button"
              onClick={openPartnerFullScreen}
              className="neercred-btn mt-5 w-full py-3 text-sm font-bold"
            >
              Continue on {handoff!.lender_name} →
            </button>
          </div>

          {/* Partner iframe */}
          <div className="relative min-h-[520px] rounded-2xl border border-slate-200 bg-white shadow-lg overflow-hidden">
            {!showIframe ? (
              <div className="flex h-full min-h-[520px] flex-col items-center justify-center p-8 text-center">
                <p className="text-4xl">🔗</p>
                <h2 className="mt-4 text-xl font-bold text-slate-900">{handoff!.lender_name}</h2>
                <p className="mt-2 max-w-sm text-sm text-slate-500">
                  Click continue — your verified name, PAN, mobile, income &amp; PIN will auto-fill on the partner
                  page. No repeat entry on NeerCred.
                </p>
                <button
                  type="button"
                  onClick={openPartnerFullScreen}
                  className="mt-6 rounded-xl bg-teal-600 px-8 py-3 font-bold text-white hover:bg-teal-500"
                >
                  Open partner application
                </button>
              </div>
            ) : (
              <>
                <div className="border-b border-slate-100 bg-slate-50 px-4 py-2 text-xs text-slate-500">
                  {handoff!.lender_name} · powered by Choice Connect · your details are synced
                </div>
                <iframe
                  ref={iframeRef}
                  src={handoff!.embed_url}
                  title={`${handoff!.lender_name} application`}
                  className="h-[min(72vh,680px)] w-full border-0"
                  allow="clipboard-write"
                />
              </>
            )}
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Partner processing happens on {handoff!.lender_name}. NeerCred securely shares only verified fields you
          consented to.
        </p>
      </div>

      <Footer />
    </main>
  );
}
