"use client";

import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

type Tab = "rbi" | "dpdp" | "privacy" | "terms" | "grievance";

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "rbi", label: "RBI LSP Guidelines", icon: "🏛️" },
  { id: "dpdp", label: "Data Protection (DPDP)", icon: "🔒" },
  { id: "privacy", label: "Privacy Policy", icon: "📋" },
  { id: "terms", label: "Terms of Service", icon: "📜" },
  { id: "grievance", label: "Grievance Redressal", icon: "📞" },
];

const content: Record<Tab, { title: string; sections: { heading: string; body: string }[] }> = {
  rbi: {
    title: "RBI Loan Service Provider (LSP) Guidelines",
    sections: [
      {
        heading: "Our Role as LSP",
        body: "Neer Loan Solutions is registered as a Loan Service Provider (LSP) under RBI's digital lending guidelines. We act as a technology platform that connects borrowers with Regulated Entities (REs) — banks and NBFCs. We do NOT lend money directly.",
      },
      {
        heading: "Key RBI Compliance Points",
        body: "• All loan disbursals happen directly from the partner lender to the borrower's bank account — Neer Loan Solutions never holds customer funds.\n• We display the name of the lending partner before loan execution.\n• Key Fact Statements (KFS) are provided by the partner lender before loan agreement.\n• Cooling-off period and grievance redressal as per RBI norms.\n• No automatic increase in credit limit without explicit customer consent.",
      },
      {
        heading: "Fair Practices Code",
        body: "We follow fair lending practices: transparent pricing, no hidden charges, clear disclosure of all fees, and no harassment for loan recovery (recovery is handled by the partner lender as per RBI guidelines).",
      },
      {
        heading: "Regulatory Framework",
        body: "We comply with RBI Master Direction on Digital Lending (2022), RBI Guidelines on Loan Service Providers (2023), and all applicable circulars issued by the Reserve Bank of India.",
      },
    ],
  },
  dpdp: {
    title: "Data Protection — DPDP Act 2023",
    sections: [
      {
        heading: "Your Data, Your Rights",
        body: "Under the Digital Personal Data Protection Act (DPDP Act), 2023, you have the right to know what data we collect, why we collect it, and how we use it. You can request access, correction, or deletion of your personal data at any time.",
      },
      {
        heading: "Data We Collect",
        body: "• Identity: Name, PAN, mobile number\n• Financial: Monthly income, employment type, existing EMI obligations\n• Location: City (for lender eligibility)\n• Technical: Device info, IP address, session data (for security)\n\nWe collect only data necessary for loan eligibility assessment and partner lender matching.",
      },
      {
        heading: "How We Use Your Data",
        body: "Your data is used exclusively to:\n1. Verify your identity (OTP verification)\n2. Check loan eligibility\n3. Fetch personalized offers from partner lenders\n4. Facilitate loan application with your chosen lender\n\nWe NEVER sell your personal data to third parties.",
      },
      {
        heading: "Data Sharing with Partners",
        body: "When you select a loan offer, we share your application data ONLY with that specific partner lender to process your loan. Each partner has their own privacy policy and data handling practices, compliant with RBI and DPDP requirements.",
      },
      {
        heading: "Data Security",
        body: "• 256-bit SSL/TLS encryption for all data in transit\n• Encrypted storage for sensitive data (PAN, financial details)\n• Role-based access control for internal systems\n• Regular security audits and vulnerability assessments\n• Data retention only as long as necessary (max 5 years post last interaction)",
      },
      {
        heading: "Your Rights Under DPDP Act",
        body: "• Right to access your personal data\n• Right to correction of inaccurate data\n• Right to erasure (deletion) of your data\n• Right to grievance redressal\n• Right to nominate someone to exercise rights in case of death/incapacity\n\nContact our Data Protection Officer: dpo@neerloansolutions.com",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    sections: [
      {
        heading: "Information Collection",
        body: "We collect information you provide directly (name, PAN, income, mobile) and automatically (cookies, device information) when you use our platform.",
      },
      {
        heading: "Cookies & Tracking",
        body: "We use essential cookies for session management and analytics cookies (with consent) to improve our services. You can disable non-essential cookies in your browser settings.",
      },
      {
        heading: "Third-Party Services",
        body: "We use OTP/SMS services for verification and partner lender APIs for offer fetching. These services process data per their own privacy policies under strict data processing agreements.",
      },
      {
        heading: "Children's Privacy",
        body: "Our services are not intended for individuals under 18 years of age. We do not knowingly collect data from minors.",
      },
      {
        heading: "Policy Updates",
        body: "We may update this policy periodically. Material changes will be notified via email/SMS and prominently displayed on our website.",
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    sections: [
      {
        heading: "Acceptance of Terms",
        body: "By using Neer Loan Solutions, you agree to these terms. If you disagree, please do not use our platform.",
      },
      {
        heading: "Service Description",
        body: "Neer Loan Solutions is a loan marketplace platform. We facilitate connections between borrowers and partner lenders. We are NOT a lender and do not guarantee loan approval.",
      },
      {
        heading: "User Responsibilities",
        body: "• Provide accurate and truthful information\n• Be at least 18 years of age and an Indian resident\n• Not use the platform for fraudulent purposes\n• Maintain confidentiality of your OTP and session credentials",
      },
      {
        heading: "Limitation of Liability",
        body: "Neer Loan Solutions is not liable for loan rejection by partner lenders, delays in disbursal, or disputes between you and the lending partner. Our liability is limited to the extent permitted by law.",
      },
      {
        heading: "Governing Law",
        body: "These terms are governed by the laws of India. Disputes shall be subject to the jurisdiction of courts in Mumbai, Maharashtra.",
      },
    ],
  },
  grievance: {
    title: "Grievance Redressal",
    sections: [
      {
        heading: "How to Raise a Complaint",
        body: "If you have any complaint regarding our services, data handling, or partner lender conduct, please contact us through any of the following channels.",
      },
      {
        heading: "Contact Details",
        body: "📧 Email: grievance@neerloansolutions.com\n📞 Phone: +91 98765 43210 (Mon-Sat, 9 AM - 6 PM)\n📍 Address: Neer Loan Solutions, Mumbai, Maharashtra 400001\n\nGrievance Officer: Mr. Rajesh Kumar\nEmail: rajesh.kumar@neerloansolutions.com",
      },
      {
        heading: "Resolution Timeline",
        body: "• Acknowledgment within 24 hours\n• Resolution within 7 working days for standard complaints\n• Complex cases resolved within 30 days with regular updates\n• Escalation to RBI Ombudsman if unresolved within 30 days",
      },
      {
        heading: "RBI Ombudsman",
        body: "If your grievance is not resolved satisfactorily, you may approach the RBI Integrated Ombudsman Scheme. Visit https://cms.rbi.org.in for online complaint filing.",
      },
    ],
  },
};

export default function CompliancePage() {
  const [activeTab, setActiveTab] = useState<Tab>("rbi");
  const tab = content[activeTab];

  return (
    <main className="min-h-screen bg-slate-50">
      <Header />

      <div className="bg-gradient-to-br from-slate-900 via-teal-900 to-slate-900 py-16 text-white">
        <div className="mx-auto max-w-5xl px-4 text-center">
          <span className="rounded-full bg-white/10 px-4 py-1 text-sm font-semibold">
            Trust & Transparency
          </span>
          <h1 className="mt-4 text-4xl font-black md:text-5xl">
            RBI Compliance & Data Protection
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-teal-100">
            Your data is secure. We fully comply with RBI guidelines and the DPDP Act 2023.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 rounded-2xl bg-white p-2 shadow-lg">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                activeTab === t.id
                  ? "bg-teal-600 text-white shadow-lg"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>{t.icon}</span>
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mt-8 rounded-3xl bg-white p-8 shadow-lg md:p-12">
          <h2 className="text-2xl font-black text-slate-900 md:text-3xl">{tab.title}</h2>
          <div className="mt-8 space-y-8">
            {tab.sections.map((section) => (
              <div key={section.heading} className="border-l-4 border-teal-500 pl-6">
                <h3 className="text-lg font-bold text-slate-900">{section.heading}</h3>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-slate-600">
                  {section.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-teal-50 p-6 text-center">
          <p className="font-bold text-teal-800">
            Questions about your data or compliance?
          </p>
          <p className="mt-2 text-sm text-teal-600">
            Contact our Data Protection Officer:{" "}
            <a href="mailto:dpo@neerloansolutions.com" className="font-semibold underline">
              dpo@neerloansolutions.com
            </a>
          </p>
          <Link
            href="/apply"
            className="mt-4 inline-block rounded-xl bg-teal-600 px-8 py-3 font-bold text-white transition hover:bg-teal-700"
          >
            Apply for Loan →
          </Link>
        </div>
      </div>

      <Footer />
    </main>
  );
}
