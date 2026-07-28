"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import {
  getApplications,
  getDashboardProfile,
  type LoanApplication,
  type LoanOffer,
} from "@/lib/api";
import { BRAND } from "@/lib/brand";
import {
  IconArrowRight,
  IconCheckCircle,
  IconFile,
  IconShield,
  IconSparkles,
  IconChart,
} from "@/components/icons";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const DEMO_APPLICATIONS: LoanApplication[] = [
  {
    id: 1,
    application_ref: "NLR482910",
    lender_name: "NeerCred Partner Bank",
    loan_amount: 500000,
    interest_rate: 10.49,
    tenure_months: 36,
    emi: 16234,
    status: "kyc_pending",
    aadhaar_verified: true,
    bank_verified: false,
    esign_completed: false,
    disbursal_amount: null,
    created_at: new Date().toISOString(),
  },
  {
    id: 2,
    application_ref: "NLR391204",
    lender_name: "Purity Finance NBFC",
    loan_amount: 200000,
    interest_rate: 11.25,
    tenure_months: 24,
    emi: 9412,
    status: "approved",
    aadhaar_verified: true,
    bank_verified: true,
    esign_completed: true,
    disbursal_amount: null,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: 3,
    application_ref: "NLR775301",
    lender_name: "Trust Capital NBFC",
    loan_amount: 350000,
    interest_rate: 10.99,
    tenure_months: 48,
    emi: 9021,
    status: "disbursed",
    aadhaar_verified: true,
    bank_verified: true,
    esign_completed: true,
    disbursal_amount: 350000,
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
  },
];

const DEMO_OFFERS: LoanOffer[] = [
  {
    offer_id: "demo-1",
    lender_name: "NeerCred Partner Bank",
    lender_logo: "",
    loan_amount: 500000,
    interest_rate: 10.49,
    tenure_months: 36,
    emi: 16234,
    processing_fee: "₹2,500",
    approval_chance: "high",
    features: ["Instant disbursal", "Zero prepayment penalty"],
    is_best_deal: true,
  },
  {
    offer_id: "demo-2",
    lender_name: "Purity Finance NBFC",
    lender_logo: "",
    loan_amount: 500000,
    interest_rate: 11.25,
    tenure_months: 36,
    emi: 16420,
    processing_fee: "₹1,999",
    approval_chance: "high",
    features: ["Flexible tenure", "Minimal documentation"],
  },
];

const statusConfig: Record<
  string,
  { label: string; color: string; bg: string; icon: typeof IconFile }
> = {
  offer_selected: { label: "Offer Selected", color: "text-neercred-teal", bg: "bg-teal-50", icon: IconSparkles },
  kyc_pending: { label: "KYC Pending", color: "text-amber-700", bg: "bg-amber-50", icon: IconFile },
  kyc_completed: { label: "KYC Done", color: "text-neercred-cyan", bg: "bg-cyan-50", icon: IconCheckCircle },
  submitted: { label: "Submitted", color: "text-neercred-cyan", bg: "bg-cyan-50", icon: IconFile },
  under_review: { label: "Under Review", color: "text-amber-700", bg: "bg-amber-50", icon: IconFile },
  approved: { label: "Approved", color: "text-emerald-700", bg: "bg-emerald-50", icon: IconCheckCircle },
  disbursed: { label: "Disbursed", color: "text-neercred-gold", bg: "bg-amber-50", icon: IconCheckCircle },
  rejected: { label: "Rejected", color: "text-red-600", bg: "bg-red-50", icon: IconFile },
};

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "1";

  const [applications, setApplications] = useState<LoanApplication[]>([]);
  const [offers, setOffers] = useState<LoanOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    if (isDemo) {
      setApplications(DEMO_APPLICATIONS);
      setOffers(DEMO_OFFERS);
      setUserName("Rahul");
      setLoading(false);
      return;
    }

    const token = localStorage.getItem("session_token");
    if (!token) {
      router.push("/apply");
      return;
    }

    Promise.all([getDashboardProfile(token), getApplications(token)])
      .then(([profile, apps]) => {
        setUserName(profile.full_name?.split(" ")[0] || "there");
        setApplications(apps);
        setOffers([]);
      })
      .catch(() => router.push("/apply"))
      .finally(() => setLoading(false));
  }, [router, isDemo]);

  const activeApps = applications.filter((a) => !["rejected", "disbursed"].includes(a.status));
  const completedApps = applications.filter((a) => ["approved", "disbursed"].includes(a.status));

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neercred-navy">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-neercred-gold border-t-transparent" />
          <p className="text-sm text-white/70">Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
        <div className="relative overflow-hidden bg-neercred-navy">
          <div className="absolute inset-0 bg-gradient-to-br from-neercred-navy via-[#0f1a2e] to-neercred-teal/30" />
          <div className="absolute right-0 top-0 h-96 w-96 -translate-y-1/2 translate-x-1/3 rounded-full bg-neercred-gold/10 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 -translate-x-1/3 translate-y-1/2 rounded-full bg-neercred-cyan/10 blur-3xl" />

          <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-neercred-gold/30 bg-neercred-gold/15 px-3 py-1 text-xs font-semibold text-neercred-gold">
                  <IconShield size={14} />
                  {BRAND.logoTagline}
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  Welcome back,{" "}
                  <span className="bg-gradient-to-r from-neercred-gold to-amber-300 bg-clip-text text-transparent">
                    {userName}
                  </span>
                </h1>
                <p className="mt-2 max-w-lg text-sm text-slate-300 sm:text-base">
                  Track applications, compare offers, and manage your loan journey — all in one premium dashboard.
                </p>
              </div>
              <Link
                href="/apply"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-neercred-gold to-amber-500 px-6 py-3.5 text-sm font-bold text-neercred-navy shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl"
              >
                <IconSparkles size={16} />
                New Application
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              {[
                { label: "Active", value: activeApps.length, icon: IconFile, accent: "from-neercred-cyan to-teal-500" },
                { label: "Offers", value: offers.length, icon: IconSparkles, accent: "from-neercred-gold to-amber-400" },
                { label: "Approved", value: completedApps.length, icon: IconCheckCircle, accent: "from-emerald-500 to-teal-500" },
                { label: "Total Apps", value: applications.length, icon: IconChart, accent: "from-neercred-teal to-cyan-500" },
              ].map((stat) => (
                <div key={stat.label} className="neercred-card-dark rounded-2xl border border-white/10 p-4 sm:p-5">
                  <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${stat.accent}`}>
                    <stat.icon size={16} className="text-white" />
                  </div>
                  <p className="text-2xl font-bold text-white sm:text-3xl">{stat.value}</p>
                  <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10">
          {offers.length > 0 && (
            <section>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-lg font-bold text-neercred-navy">
                  <span className="h-5 w-1 rounded-full bg-gradient-to-b from-neercred-gold to-neercred-teal" />
                  Pre-approved Offers
                </h2>
                <span className="rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-neercred-teal">
                  {offers.length} waiting
                </span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {offers.map((offer, i) => (
                  <div
                    key={offer.offer_id}
                    className={`neercred-card relative overflow-hidden rounded-2xl p-5 sm:p-6 ${i === 0 ? "ring-2 ring-neercred-gold/40" : ""}`}
                  >
                    {offer.is_best_deal && (
                      <span className="absolute right-0 top-0 rounded-bl-xl bg-gradient-to-r from-neercred-gold to-amber-500 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-neercred-navy">
                        Best Rate
                      </span>
                    )}
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <div>
                        <p className="font-bold text-neercred-navy">{offer.lender_name}</p>
                        <p className="mt-0.5 text-xs text-slate-500">Personal Loan</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-neercred-teal">{offer.interest_rate}%</p>
                        <p className="text-[10px] uppercase tracking-wide text-slate-500">p.a.</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 border-y border-slate-100 py-4">
                      <div>
                        <p className="text-[10px] uppercase text-slate-500">Amount</p>
                        <p className="text-sm font-semibold text-neercred-navy">{formatCurrency(offer.loan_amount)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-slate-500">EMI</p>
                        <p className="text-sm font-semibold text-neercred-navy">{formatCurrency(offer.emi)}/mo</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase text-slate-500">Tenure</p>
                        <p className="text-sm font-semibold text-neercred-navy">{offer.tenure_months} mo</p>
                      </div>
                    </div>
                    <Link
                      href="/apply"
                      className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-neercred-cta py-2.5 text-sm font-semibold text-white transition-colors hover:brightness-110"
                    >
                      View & Accept
                      <IconArrowRight size={16} />
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-bold text-neercred-navy">
                <span className="h-5 w-1 rounded-full bg-gradient-to-b from-neercred-teal to-neercred-cyan" />
                Your Applications
              </h2>
              <Link href="/apply" className="flex items-center gap-1 text-sm font-medium text-neercred-teal hover:text-neercred-navy">
                Apply again <IconArrowRight size={14} />
              </Link>
            </div>

            {applications.length === 0 ? (
              <div className="neercred-card rounded-2xl p-12 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-neercred-teal/10 to-neercred-cyan/10">
                  <IconFile size={32} className="text-neercred-teal" />
                </div>
                <h3 className="text-lg font-semibold text-neercred-navy">No applications yet</h3>
                <p className="mt-2 mb-6 text-sm text-slate-500">Start your first loan application in under 5 minutes.</p>
                <Link href="/apply" className="neercred-btn inline-flex items-center gap-2 px-6 py-3">
                  Get Started <IconArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {applications.map((app) => {
                  const cfg = statusConfig[app.status] || statusConfig.offer_selected;
                  const StatusIcon = cfg.icon;
                  return (
                    <div
                      key={app.id}
                      className="neercred-card flex flex-col gap-4 rounded-2xl p-4 transition-shadow hover:shadow-neercred sm:flex-row sm:items-center sm:p-5"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-4">
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${cfg.bg}`}>
                          <StatusIcon size={20} className={cfg.color} />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-neercred-navy">
                            {formatCurrency(app.loan_amount)} · {app.lender_name}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            Ref {app.application_ref} · {app.tenure_months} mo · {formatDate(app.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 sm:shrink-0">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
                          <StatusIcon size={12} />
                          {cfg.label}
                        </span>
                        {["kyc_pending", "offer_selected"].includes(app.status) && (
                          <Link
                            href={`/application/${app.id}/kyc`}
                            className="rounded-xl bg-neercred-navy px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-neercred-teal"
                          >
                            Continue KYC
                          </Link>
                        )}
                        <Link
                          href={`/track?ref=${app.application_ref}`}
                          className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:border-neercred-teal hover:text-neercred-teal"
                        >
                          Track
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <div className="flex flex-col items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-neercred-navy to-neercred-teal p-6 text-white sm:flex-row sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
                <IconShield size={24} className="text-neercred-gold" />
              </div>
              <div>
                <p className="font-semibold">
                  {BRAND.appName} — {BRAND.logoTagline}
                </p>
                <p className="text-sm text-white/70">RBI-regulated partners · 256-bit encryption · Zero hidden charges</p>
              </div>
            </div>
            <p className="text-center text-xs text-white/50 sm:text-right">{BRAND.legalName}</p>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function DashboardFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-neercred-navy">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-neercred-gold border-t-transparent" />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardFallback />}>
      <DashboardContent />
    </Suspense>
  );
}
