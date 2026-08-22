"use client";

import Image from "next/image";
import { IconCheckCircle, IconShield } from "@/components/icons";

export default function PromoEkycApprovedPage() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&display=swap" rel="stylesheet" />
      <div
        className="promo-no-chrome relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6"
        style={{
          fontFamily: "Poppins, system-ui, sans-serif",
          background: "linear-gradient(180deg, #E8F7F5 0%, #F4FBFA 42%, #FFFFFF 100%)",
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          {[IconShield, IconCheckCircle, IconShield].map((Icon, i) => (
            <span
              key={i}
              className="float-shield absolute text-[#0F766E]/30"
              style={{ left: `${20 + i * 28}%`, top: `${18 + i * 8}%`, animationDelay: `${i * 0.5}s` }}
            >
              <Icon size={28} />
            </span>
          ))}
        </div>

        <Image src="/neercred-logo-header.svg" alt="NeerCred" width={160} height={48} className="relative z-10 mb-8 h-10 w-auto" />

        <div className="verify-card relative z-10 w-full max-w-sm rounded-3xl border border-[#0F766E]/15 bg-white p-8 text-center shadow-[0_24px_80px_-24px_rgba(15,118,110,0.4)]">
          <div className="verify-ring mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#0F766E] to-[#0891B2] shadow-lg">
            <svg width="52" height="52" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#0F766E]">Lender Platform</p>
          <h1 className="mt-3 text-2xl font-extrabold leading-tight text-[#0B1220]">
            Aadhaar eKYC
            <br />
            Verified
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[#64748B]">
            Verified securely on your lending partner&apos;s platform — fast, encrypted, and compliant.
          </p>
          <div className="mt-6 grid grid-cols-3 gap-2 text-center">
            {[
              { label: "Secure", value: "256-bit" },
              { label: "Status", value: "Verified" },
              { label: "Time", value: "< 2 min" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl bg-[#E6F4F1] px-2 py-3">
                <p className="text-[10px] font-bold uppercase text-[#64748B]">{item.label}</p>
                <p className="mt-1 text-sm font-extrabold text-[#0F766E]">{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx global>{`
        nextjs-portal, [data-nextjs-toast], [data-next-mark], #__nextjs-dev-tools-menu,
        #__nextjs-build-indicator, button.fixed.bottom-6.left-6 { display: none !important; }
      `}</style>
      <style jsx>{`
        .verify-card { animation: rise 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .verify-ring { animation: ringPulse 2s ease-in-out infinite; }
        .float-shield { animation: float 3s ease-in-out infinite; }
        @keyframes rise {
          from { opacity: 0; transform: translateY(28px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes ringPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(15, 118, 110, 0.35); }
          50% { transform: scale(1.05); box-shadow: 0 0 0 16px rgba(15, 118, 110, 0); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); opacity: 0.35; }
          50% { transform: translateY(-12px); opacity: 0.7; }
        }
      `}</style>
    </>
  );
}
