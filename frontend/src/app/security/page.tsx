import Link from "next/link";
import { PageShell } from "@/components/PageShell";
import { InnerHero } from "@/components/InnerHero";
import { BRAND } from "@/lib/brand";
import { INDIAN_IMAGES } from "@/lib/indian-images";
import { IconLock, IconShield, IconCheck } from "@/components/icons";

export const metadata = { title: `Security | ${BRAND.name}` };

const measures = [
  { title: "256-bit SSL Encryption", desc: "All data in transit protected with industry-standard TLS." },
  { title: "RBI LSP Compliance", desc: "Registered Loan Service Provider under digital lending guidelines." },
  { title: "DPDP Act 2023", desc: "Full data protection with user rights to access, correct, and delete." },
  { title: "Audit Logs", desc: "Complete audit trail for admin actions and application status changes." },
  { title: "Fraud Detection", desc: "ML-powered anomaly monitoring and multi-layer KYC verification." },
  { title: "Penetration Testing", desc: "Regular security assessments and vulnerability remediation." },
];

export default function SecurityPage() {
  return (
    <PageShell>
      <InnerHero
        badge="SECURITY"
        title="Bank-Grade Security"
        subtitle="Your financial data deserves enterprise-level protection at every step."
        image={INDIAN_IMAGES.pages.security}
      />
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          {measures.map((m) => (
            <div key={m.title} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <IconShield size={24} className="text-teal-600" />
              <h3 className="mt-4 font-bold text-slate-900">{m.title}</h3>
              <p className="mt-2 text-sm text-slate-500">{m.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 rounded-2xl bg-slate-50 p-8">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <IconLock size={18} className="text-teal-600" /> Encrypted at rest & in transit
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <IconCheck size={18} className="text-teal-600" /> ISO-aligned practices
          </div>
        </div>
        <p className="mt-8 text-center text-sm text-slate-500">
          Full compliance documentation on our{" "}
          <Link href="/compliance" className="font-semibold text-teal-600 underline">
            Compliance page
          </Link>
          .
        </p>
      </div>
    </PageShell>
  );
}
