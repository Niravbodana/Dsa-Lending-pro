"use client";

import { useEffect, useState } from "react";

export default function PromoTransferPage() {
  const [progress, setProgress] = useState(12);

  useEffect(() => {
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const p = Math.min(100, 12 + (elapsed / 3200) * 88);
      setProgress(p);
      if (p < 100) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, []);

  const done = progress >= 99;

  return (
    <div className="promo-no-chrome flex min-h-dvh items-center justify-center bg-gradient-to-br from-[#0B1220] via-[#0F766E] to-[#0891B2] px-6">
      <div className="transfer-card w-full max-w-sm rounded-3xl border border-white/10 bg-white/5 p-8 text-center shadow-[0_0_80px_-20px_rgba(94,234,212,0.5)] backdrop-blur-xl">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#0891B2] shadow-lg">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M3 10h18M7 15h1m4 0h1m4 0h1M5 6h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2z" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </div>

        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#5EEAD4]">
          {done ? "Transfer complete" : "Live transfer"}
        </p>
        <h1 className="mt-3 text-2xl font-extrabold leading-tight text-white">
          {done ? "Money sent to your bank! 🎉" : "Transferring to your bank account"}
        </h1>
        <p className="mt-2 text-sm text-slate-300">HDFC Bank · **** 4521</p>

        <p className="mt-6 text-4xl font-extrabold text-white">₹5,00,000</p>
        <p className="mt-1 text-xs text-slate-400">Indicative disbursal amount</p>

        <div className="mt-8">
          <div className="h-2.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#0F766E] via-[#5EEAD4] to-[#FDE68A] transition-all duration-100"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-xs text-slate-400">
            <span>Processing</span>
            <span className="font-bold text-[#5EEAD4]">{Math.round(progress)}%</span>
          </div>
        </div>

        {!done ? (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-300">
            <span className="pulse-dot h-2 w-2 rounded-full bg-[#5EEAD4]" />
            <span className="pulse-dot h-2 w-2 rounded-full bg-[#5EEAD4]" style={{ animationDelay: "0.2s" }} />
            <span className="pulse-dot h-2 w-2 rounded-full bg-[#5EEAD4]" style={{ animationDelay: "0.4s" }} />
            <span className="ml-2">Real-time transfer in progress…</span>
          </div>
        ) : (
          <div className="mt-6 flex justify-center gap-2 text-2xl">
            {["🎉", "😊", "✨", "💸"].map((e) => (
              <span key={e} className="bounce-emoji inline-block">{e}</span>
            ))}
          </div>
        )}
      </div>

      <style jsx global>{`
        .promo-no-chrome ~ [role="dialog"],
        nextjs-portal,
        [data-nextjs-toast],
        [data-next-mark],
        #__nextjs-dev-tools-menu,
        #__nextjs-build-indicator,
        button.fixed.bottom-6.left-6 {
          display: none !important;
          visibility: hidden !important;
        }
      `}</style>
      <style jsx>{`
        .transfer-card { animation: cardIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @keyframes cardIn {
          from { opacity: 0; transform: scale(0.9) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .pulse-dot { animation: pulse 1.2s ease-in-out infinite; }
        @keyframes pulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .bounce-emoji { animation: bounce 1s ease-in-out infinite; }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
