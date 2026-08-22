"use client";

function StoryProgress({ active }: { active: number }) {
  return (
    <div className="absolute left-0 right-0 top-0 z-20 flex gap-1.5 px-4 pt-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-[#0F766E]/30">
          <div className="h-full w-full rounded-full bg-[#0F766E]" style={{ opacity: i <= active ? 1 : 0.3 }} />
        </div>
      ))}
    </div>
  );
}

function SolutionLogo() {
  return (
    <svg width="100%" viewBox="0 0 320 108" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="NeerCred™" className="max-w-[280px]">
      <defs>
        <linearGradient id="sol-blue" x1="8" y1="8" x2="36" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22D3EE" /><stop offset="1" stopColor="#1E3A8A" />
        </linearGradient>
        <linearGradient id="sol-gold" x1="42" y1="12" x2="52" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE68A" /><stop offset="1" stopColor="#B8860B" />
        </linearGradient>
        <linearGradient id="sol-cred" x1="88" y1="0" x2="240" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0F766E" /><stop offset="1" stopColor="#14B8A6" />
        </linearGradient>
      </defs>
      <g transform="translate(8, 14) scale(0.72)">
        <path d="M34 30 L34 66" stroke="url(#sol-blue)" strokeWidth="7.5" strokeLinecap="round" />
        <path d="M34 30 L62 66" stroke="url(#sol-blue)" strokeWidth="7.5" strokeLinecap="round" />
        <path d="M62 30 L62 66" stroke="url(#sol-gold)" strokeWidth="7.5" strokeLinecap="round" />
      </g>
      <text x="78" y="48" fontFamily="Poppins, system-ui, sans-serif" fontSize="34" fontWeight="800" dominantBaseline="middle">
        <tspan fill="#0F172A">Neer</tspan><tspan fill="url(#sol-cred)">Cred</tspan>
        <tspan fill="#64748B" fontSize="16" fontWeight="600" dx="2">™</tspan>
      </text>
      <text x="78" y="78" fontFamily="Poppins, system-ui, sans-serif" fontSize="11" fontWeight="600" fill="#B45309" letterSpacing="3.2">
        DREAM BIG · BORROW SMART
      </text>
    </svg>
  );
}

export default function PromoStorySolutionPage() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&display=swap" rel="stylesheet" />
      <div
        className="promo-no-chrome relative flex min-h-dvh flex-col overflow-hidden"
        style={{
          fontFamily: "Poppins, system-ui, sans-serif",
          background: "linear-gradient(160deg, #F0FDF9 0%, #D1FAE5 40%, #A7F3D0 75%, #86EFAC 100%)",
        }}
      >
        <StoryProgress active={2} />

        <div className="pointer-events-none absolute inset-0">
          <div
            className="solution-burst absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-50 blur-3xl"
            style={{ background: "radial-gradient(circle, #BBF7D0 0%, transparent 65%)" }}
          />
        </div>

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 text-center">
          <p className="solution-tag text-xs font-semibold uppercase tracking-[0.35em] text-[#047857]">The answer</p>

          <div className="solution-logo mt-8">
            <SolutionLogo />
          </div>

          <h1 className="solution-headline mt-8 text-2xl font-extrabold leading-tight text-[#0B1220]">
            Your digital lending
            <br />
            aggregator
          </h1>

          <div className="solution-pills mt-8 flex flex-wrap justify-center gap-2">
            {["Fully digital", "Up to ₹15L", "3 min apply"].map((pill) => (
              <span
                key={pill}
                className="rounded-full border border-[#0F766E]/25 bg-white/80 px-4 py-2 text-xs font-bold text-[#0F766E] shadow-sm"
              >
                {pill}
              </span>
            ))}
          </div>

          <p className="solution-cta mt-10 text-sm font-semibold text-[#475569]">
            Compare HDFC, ICICI &amp; more — one tap.
          </p>
        </div>

        <style jsx global>{`
          nextjs-portal, [data-nextjs-toast], [data-next-mark], #__nextjs-dev-tools-menu,
          #__nextjs-build-indicator, button.fixed.bottom-6.left-6 {
            display: none !important;
          }
        `}</style>
        <style jsx>{`
          .solution-burst { animation: burst 2.5s ease-in-out infinite; }
          @keyframes burst {
            0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.4; }
            50% { transform: translate(-50%, -50%) scale(1.12); opacity: 0.65; }
          }
          .solution-tag, .solution-logo, .solution-headline, .solution-pills, .solution-cta {
            opacity: 0;
            animation: reveal 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .solution-logo { animation-delay: 0.2s; }
          .solution-headline { animation-delay: 0.45s; }
          .solution-pills { animation-delay: 0.65s; }
          .solution-cta { animation-delay: 0.9s; }
          @keyframes reveal {
            from { opacity: 0; transform: translateY(32px) scale(0.94); filter: blur(8px); }
            to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
          }
        `}</style>
      </div>
    </>
  );
}
