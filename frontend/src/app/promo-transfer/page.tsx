"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Coin = { id: number; left: number; delay: number; duration: number; size: number };

export default function PromoTransferPage() {
  const [progress, setProgress] = useState(8);
  const [landed, setLanded] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(100, 8 + (elapsed / 4000) * 92);
      setProgress(p);
      setLanded(Math.min(12, Math.floor((p / 100) * 12)));
      if (p < 100) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  const done = progress >= 99;

  const coins: Coin[] = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    left: 8 + (i % 7) * 12,
    delay: (i % 7) * 0.35,
    duration: 2.2 + (i % 4) * 0.3,
    size: 28 + (i % 3) * 6,
  }));

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&display=swap" rel="stylesheet" />
      <div
        className="promo-no-chrome relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-5"
        style={{
          fontFamily: "Poppins, system-ui, sans-serif",
          background: "linear-gradient(180deg, #E8F7F5 0%, #F4FBFA 45%, #FFFFFF 100%)",
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-10 top-20 h-48 w-48 rounded-full bg-[#5EEAD4]/25 blur-3xl" />
          <div className="absolute -right-8 bottom-24 h-56 w-56 rounded-full bg-[#0F766E]/15 blur-3xl" />
        </div>

        <Image src="/neercred-logo-header.svg" alt="NeerCred" width={160} height={48} className="relative z-10 mb-6 h-10 w-auto" />

        <div className="transfer-stage relative z-10 w-full max-w-sm">
          {/* Flying coins */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40">
            {coins.map((c) => (
              <span
                key={c.id}
                className="flying-coin absolute font-bold text-[#0F766E]"
                style={{
                  left: `${c.left}%`,
                  fontSize: c.size,
                  animationDelay: `${c.delay}s`,
                  animationDuration: `${c.duration}s`,
                  opacity: done ? 0 : 1,
                }}
              >
                ₹
              </span>
            ))}
          </div>

          {/* Bank target */}
          <div className={`bank-target mx-auto flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-[#0B5C56] to-[#0F766E] shadow-[0_20px_60px_-15px_rgba(15,118,110,0.65)] ${done ? "bank-landed" : ""}`}>
            <svg width="56" height="56" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path d="M3 10h18M7 15h1m4 0h1m4 0h1M5 6h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            {landed > 0 && (
              <span className="land-badge absolute -right-2 -top-2 flex h-8 w-8 items-center justify-center rounded-full bg-[#FDE68A] text-xs font-extrabold text-[#0B1220]">
                +{landed}
              </span>
            )}
          </div>

          <div className="mt-8 rounded-3xl border border-[#0F766E]/15 bg-white p-6 shadow-xl">
            <p className="text-center text-xs font-bold uppercase tracking-[0.25em] text-[#0F766E]">
              {done ? "Transfer complete" : "Disbursal in progress"}
            </p>
            <h1 className="mt-3 text-center text-2xl font-extrabold text-[#0B1220]">
              {done ? "Funds credited to your bank!" : "Transferring to your account"}
            </h1>
            <p className="mt-2 text-center text-sm text-[#64748B]">HDFC Bank · **** 4521</p>
            <p className="mt-5 text-center text-4xl font-extrabold text-[#0F766E]">₹15,00,000</p>
            <p className="text-center text-[11px] text-[#94A3B8]">Indicative disbursal amount</p>

            <div className="mt-6 h-2.5 overflow-hidden rounded-full bg-[#E2E8F0]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#0F766E] via-[#5EEAD4] to-[#FDE68A] transition-all duration-100"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-center text-xs font-semibold text-[#64748B]">{Math.round(progress)}% complete</p>
          </div>
        </div>
      </div>

      <style jsx global>{`
        nextjs-portal, [data-nextjs-toast], [data-next-mark], #__nextjs-dev-tools-menu,
        #__nextjs-build-indicator, button.fixed.bottom-6.left-6 { display: none !important; }
      `}</style>
      <style jsx>{`
        .transfer-stage { animation: rise 0.8s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @keyframes rise {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .flying-coin {
          top: -10%;
          animation: flyToBank ease-in infinite;
          text-shadow: 0 2px 8px rgba(15, 118, 110, 0.35);
        }
        @keyframes flyToBank {
          0% { transform: translate(0, 0) scale(0.6) rotate(0deg); opacity: 0; }
          12% { opacity: 1; }
          70% { transform: translate(0, 180px) scale(1.1) rotate(20deg); opacity: 1; }
          100% { transform: translate(0, 220px) scale(0.2) rotate(40deg); opacity: 0; }
        }
        .bank-target { animation: bankPulse 2s ease-in-out infinite; }
        .bank-landed { animation: bankPop 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        @keyframes bankPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 20px 60px -15px rgba(15, 118, 110, 0.55); }
          50% { transform: scale(1.04); box-shadow: 0 24px 70px -12px rgba(15, 118, 110, 0.75); }
        }
        @keyframes bankPop {
          0% { transform: scale(1); }
          40% { transform: scale(1.12); }
          100% { transform: scale(1.05); }
        }
        .land-badge { animation: badgePop 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @keyframes badgePop {
          from { transform: scale(0); }
          to { transform: scale(1); }
        }
      `}</style>
    </>
  );
}
