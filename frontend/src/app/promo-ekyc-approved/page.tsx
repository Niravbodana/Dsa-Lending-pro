"use client";

export default function PromoEkycApprovedPage() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-gradient-to-br from-[#070D18] via-[#0B1528] to-[#0F172A] px-6">
      <div className="pointer-events-none absolute inset-0">
        {["🎉", "😊", "✨", "🎊", "⭐", "😄"].map((e, i) => (
          <span
            key={e + i}
            className="confetti-emoji absolute text-2xl sm:text-3xl"
            style={{
              left: `${8 + i * 15}%`,
              animationDelay: `${i * 0.35}s`,
              animationDuration: `${2.8 + i * 0.2}s`,
            }}
          >
            {e}
          </span>
        ))}
      </div>

      <div className="celebrate-card relative z-10 w-full max-w-sm rounded-3xl border border-teal-500/30 bg-white/5 p-8 text-center shadow-[0_0_60px_-12px_rgba(45,212,191,0.45)] backdrop-blur-md">
        <div className="celebrate-check mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 shadow-lg shadow-emerald-500/40">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M5 13l4 4L19 7" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-300">Lender Platform</p>
        <h1 className="mt-3 text-2xl font-extrabold leading-tight text-white sm:text-3xl">
          Your Aadhaar eKYC
          <br />
          Approved! 🎉
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-slate-300">
          Verified securely on your lending partner&apos;s platform — not on NeerCred.
        </p>
        <div className="mt-6 flex justify-center gap-3 text-3xl">
          {["😊", "🎉", "✨", "😄", "🎊"].map((e) => (
            <span key={e} className="bounce-emoji inline-block">
              {e}
            </span>
          ))}
        </div>
      </div>

      <style jsx>{`
        .confetti-emoji {
          top: -10%;
          animation: fall linear infinite;
          opacity: 0.9;
        }
        @keyframes fall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0.3; }
        }
        .celebrate-card {
          animation: cardIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
        .celebrate-check {
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes cardIn {
          from { opacity: 0; transform: scale(0.88) translateY(24px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.06); }
        }
        .bounce-emoji {
          animation: bounce 1.2s ease-in-out infinite;
        }
        .bounce-emoji:nth-child(2) { animation-delay: 0.15s; }
        .bounce-emoji:nth-child(3) { animation-delay: 0.3s; }
        .bounce-emoji:nth-child(4) { animation-delay: 0.45s; }
        .bounce-emoji:nth-child(5) { animation-delay: 0.6s; }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}
