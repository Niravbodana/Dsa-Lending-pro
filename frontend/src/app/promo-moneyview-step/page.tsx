"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const STEPS: Record<
  string,
  { num: number; hindi: string; title: string; subtitle: string; screen: string }
> = {
  "1": { num: 1, hindi: "Email Daalo", title: "Shuru Karo", subtitle: "Secure OTP inbox mein", screen: "/promo-capture/02-apply-email.png" },
  "2": { num: 2, hindi: "OTP Verify", title: "Ho Gaya Verify", subtitle: "Ek minute se kam", screen: "/promo-capture/03-otp-email.png" },
  "3": { num: 3, hindi: "Profile Bharo", title: "PAN & Details", subtitle: "Ek hi form — simple", screen: "/promo-capture/04-profile.png" },
  "4": { num: 4, hindi: "Offers Dekho", title: "Best Rate Chuno", subtitle: "HDFC, ICICI, Bajaj", screen: "/promo-capture/09-offers.png" },
  "5": { num: 5, hindi: "Approved!", title: "Aap Qualify Ho Sakte Ho", subtitle: "₹15 Lakh tak · indicative", screen: "/promo-capture/12-approved.png" },
};

function StepContent() {
  const params = useSearchParams();
  const key = params.get("step") || "1";
  const step = STEPS[key] || STEPS["1"];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800;900&display=swap" rel="stylesheet" />
      <div
        className="promo-no-chrome relative flex min-h-dvh flex-col overflow-hidden px-5 pb-5 pt-4"
        style={{
          fontFamily: "Poppins, system-ui, sans-serif",
          background: "linear-gradient(180deg, #E8F7F5 0%, #F4FBFA 35%, #FFFFFF 100%)",
        }}
      >
        <div className="flex items-center justify-between">
          <Image src="/neercred-logo-header.svg" alt="NeerCred" width={140} height={42} className="h-8 w-auto" />
          <span className="rounded-full bg-[#0F766E] px-3 py-1 text-[10px] font-extrabold text-white">
            STEP {step.num}/7
          </span>
        </div>

        <div className="mv-step-head mt-5 text-center">
          <p className="text-sm font-black uppercase tracking-[0.2em] text-[#0891B2]">{step.hindi}</p>
          <h1 className="mt-2 text-2xl font-black text-[#0B1220]">{step.title}</h1>
          <p className="mt-1 text-sm font-semibold text-[#64748B]">{step.subtitle}</p>
        </div>

        <div className="relative mx-auto mt-5 flex flex-1 items-center justify-center">
          <div className="phone-glow absolute inset-x-6 top-1/2 h-56 -translate-y-1/2 rounded-full bg-[#5EEAD4]/30 blur-3xl" />
          <div className="mv-phone relative z-10 w-[min(90vw,330px)] overflow-hidden rounded-[2rem] border-[6px] border-[#1E293B] bg-[#1E293B] shadow-[0_25px_70px_-15px_rgba(15,118,110,0.6)]">
            <div className="absolute left-1/2 top-2 z-20 h-5 w-20 -translate-x-1/2 rounded-full bg-black" />
            <Image src={step.screen} alt="" width={390} height={844} className="mv-screen block w-full" priority />
          </div>
        </div>

        <div className="mv-progress mt-4 flex justify-center gap-1.5">
          {Array.from({ length: 7 }, (_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${i + 1 <= step.num ? "w-6 bg-[#0F766E]" : "w-1.5 bg-[#CBD5E1]"}`}
            />
          ))}
        </div>
      </div>

      <style jsx global>{`
        nextjs-portal, [data-nextjs-toast], [data-next-mark], #__nextjs-dev-tools-menu,
        #__nextjs-build-indicator, button.fixed.bottom-6.left-6 { display: none !important; }
      `}</style>
      <style jsx>{`
        .mv-step-head { animation: snapIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both; }
        .mv-phone { animation: snapPhone 0.6s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both; }
        .mv-screen { animation: snapScreen 0.7s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both; }
        .mv-progress { animation: snapIn 0.5s ease 0.3s both; }
        @keyframes snapIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes snapPhone {
          from { opacity: 0; transform: scale(0.88) translateY(24px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes snapScreen {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

export default function PromoMoneyViewStepPage() {
  return (
    <Suspense>
      <StepContent />
    </Suspense>
  );
}
