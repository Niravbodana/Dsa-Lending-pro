"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

const STEPS: Record<
  string,
  { num: number; label: string; title: string; subtitle: string; screen: string }
> = {
  "1": { num: 1, label: "APPLY", title: "Start Online", subtitle: "Email verification in seconds", screen: "/promo-capture/02-apply-email.png" },
  "2": { num: 2, label: "VERIFY", title: "OTP Confirmed", subtitle: "Instant email verification", screen: "/promo-capture/03-otp-email.png" },
  "3": { num: 3, label: "PROFILE", title: "PAN & Profile", subtitle: "One guided form", screen: "/promo-capture/04-profile.png" },
  "4": { num: 4, label: "COMPARE", title: "Best Offers", subtitle: "Side-by-side comparison", screen: "/promo-capture/09-offers.png" },
  "5": { num: 5, label: "APPROVED", title: "You May Qualify", subtitle: "Up to ₹15 Lakhs · indicative", screen: "/promo-capture/12-approved.png" },
};

function StepContent() {
  const params = useSearchParams();
  const key = params.get("step") || "1";
  const step = STEPS[key] || STEPS["1"];
  const total = 7;

  return (
  <>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&display=swap" rel="stylesheet" />
    <div
      className="promo-no-chrome relative flex min-h-dvh flex-col overflow-hidden px-5 pb-6 pt-5"
      style={{
        fontFamily: "Poppins, system-ui, sans-serif",
        background: "linear-gradient(180deg, #E8F7F5 0%, #F4FBFA 38%, #FFFFFF 100%)",
      }}
    >
      <div className="flex items-center justify-between">
        <Image src="/neercred-logo-header.svg" alt="NeerCred" width={150} height={44} className="h-9 w-auto" />
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#0F766E]">
          Step {String(step.num).padStart(2, "0")} / {total}
        </p>
      </div>

      <div className="mt-4 flex justify-center gap-2">
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-700 ${i + 1 <= step.num ? "w-8 bg-[#0F766E]" : "w-2 bg-[#CBD5E1]"}`}
          />
        ))}
      </div>

      <div className="step-copy mt-6">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#0F766E]">{step.label}</p>
        <h1 className="mt-2 text-2xl font-extrabold text-[#0B1220]">{step.title}</h1>
        <p className="mt-1 text-sm font-medium text-[#64748B]">{step.subtitle}</p>
      </div>

      <div className="phone-wrap relative mx-auto mt-6 flex flex-1 items-center justify-center">
        <div className="phone-glow absolute inset-x-8 top-1/2 h-64 -translate-y-1/2 rounded-full bg-[#5EEAD4]/25 blur-3xl" />
        <div className="phone-frame relative z-10 w-[min(92vw,340px)] overflow-hidden rounded-[2.2rem] border-[6px] border-[#1E293B] bg-[#1E293B] shadow-[0_30px_80px_-20px_rgba(15,118,110,0.55)]">
          <div className="absolute left-1/2 top-2 z-20 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
          <div className="screen-shine pointer-events-none absolute inset-0 z-20 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
          <Image
            src={step.screen}
            alt=""
            width={390}
            height={844}
            className="screen-slide block w-full"
            priority
          />
        </div>
      </div>
    </div>

    <style jsx global>{`
      nextjs-portal, [data-nextjs-toast], [data-next-mark], #__nextjs-dev-tools-menu,
      #__nextjs-build-indicator, button.fixed.bottom-6.left-6 { display: none !important; }
    `}</style>
    <style jsx>{`
      .step-copy { animation: rise 0.7s cubic-bezier(0.16, 1, 0.3, 1) both; }
      .phone-frame { animation: phoneIn 1s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both; }
      .screen-slide { animation: slideUp 1.1s cubic-bezier(0.16, 1, 0.3, 1) 0.25s both; }
      .screen-shine { animation: shine 2.4s ease-in-out 0.8s infinite; }
      @keyframes rise {
        from { opacity: 0; transform: translateY(20px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes phoneIn {
        from { opacity: 0; transform: translateY(40px) scale(0.94); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes slideUp {
        from { opacity: 0; transform: translateY(24px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes shine {
        0%, 100% { opacity: 0.15; }
        50% { opacity: 0.45; transform: translateX(8%); }
      }
    `}</style>
  </>
  );
}

export default function PromoCinematicStepPage() {
  return (
    <Suspense fallback={null}>
      <StepContent />
    </Suspense>
  );
}
