"use client";

function GreetingLogo() {
  return (
    <svg
      width="520"
      height="176"
      viewBox="0 0 320 108"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="NeerCred"
      className="drop-shadow-2xl"
    >
      <defs>
        <linearGradient id="gr-blue" x1="8" y1="8" x2="36" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22D3EE" />
          <stop offset="0.55" stopColor="#3B82F6" />
          <stop offset="1" stopColor="#1E3A8A" />
        </linearGradient>
        <linearGradient id="gr-gold" x1="42" y1="12" x2="52" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE68A" />
          <stop offset="0.45" stopColor="#E8C547" />
          <stop offset="1" stopColor="#B8860B" />
        </linearGradient>
        <linearGradient id="gr-ring-blue" x1="6" y1="32" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="gr-ring-gold" x1="32" y1="32" x2="58" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F5D76E" />
          <stop offset="1" stopColor="#C9A227" />
        </linearGradient>
        <linearGradient id="gr-cred" x1="88" y1="0" x2="240" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2DD4BF" />
          <stop offset="0.5" stopColor="#0F766E" />
          <stop offset="1" stopColor="#5EEAD4" />
        </linearGradient>
        <linearGradient id="gr-gold-text" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE68A" />
          <stop offset="1" stopColor="#D4A017" />
        </linearGradient>
      </defs>
      <g transform="translate(8, 14) scale(0.72)">
        <path d="M48 14 A34 34 0 0 0 48 82" stroke="url(#gr-ring-blue)" strokeWidth="2.8" fill="none" strokeLinecap="round" />
        <path d="M48 14 A34 34 0 0 1 48 82" stroke="url(#gr-ring-gold)" strokeWidth="2.8" fill="none" strokeLinecap="round" />
        <path d="M34 30 L34 66" stroke="url(#gr-blue)" strokeWidth="7.5" strokeLinecap="round" />
        <path d="M34 30 L62 66" stroke="url(#gr-blue)" strokeWidth="7.5" strokeLinecap="round" />
        <path d="M62 30 L62 66" stroke="url(#gr-gold)" strokeWidth="7.5" strokeLinecap="round" />
        <path
          d="M48 9.5 L49.8 13.8 L54.4 13.8 L50.8 16.6 L52.2 21 L48 18.4 L43.8 21 L45.2 16.6 L41.6 13.8 L46.2 13.8 Z"
          fill="url(#gr-gold)"
        />
      </g>
      <text x="78" y="48" fontFamily="Poppins, system-ui, sans-serif" fontSize="34" fontWeight="800" letterSpacing="-0.5" dominantBaseline="middle">
        <tspan fill="#F8FAFC">Neer</tspan>
        <tspan fill="url(#gr-cred)">Cred</tspan>
      </text>
      <text x="78" y="78" fontFamily="Poppins, system-ui, sans-serif" fontSize="11" fontWeight="600" fill="url(#gr-gold-text)" letterSpacing="3.2">
        DREAM BIG · BORROW SMART
      </text>
    </svg>
  );
}

export default function PromoGreetingPage() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&display=swap" rel="stylesheet" />
      <div
        className="promo-no-chrome promo-greeting-root relative flex min-h-dvh flex-col items-center justify-center overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #0B1220 0%, #0F766E 50%, #0891B2 100%)",
          fontFamily: "Poppins, system-ui, sans-serif",
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-3xl"
            style={{ background: "radial-gradient(circle, #5EEAD4 0%, transparent 68%)" }}
          />
        </div>

        <p className="greeting-welcome relative z-10 text-5xl font-extrabold tracking-tight text-[#5EEAD4] sm:text-6xl">
          Welcome to
        </p>

        <div className="greeting-logo relative z-10 mt-10">
          <GreetingLogo />
        </div>

        <p className="greeting-trust relative z-10 mt-10 text-sm font-semibold uppercase tracking-[0.35em] text-slate-300">
          Purity &amp; Trust
        </p>

        <style jsx global>{`
          nextjs-portal,
          [data-nextjs-toast],
          [data-next-mark],
          #__nextjs-dev-tools-menu,
          #__nextjs-build-indicator,
          button.fixed.bottom-6.left-6 {
            display: none !important;
            visibility: hidden !important;
          }
          @keyframes greetingWelcomeIn {
            0% {
              opacity: 0;
              transform: translateY(40px) scale(0.92);
              filter: blur(10px);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
              filter: blur(0);
            }
          }
          @keyframes greetingLogoIn {
            0% {
              opacity: 0;
              transform: scale(0.7) translateY(56px);
              filter: blur(14px);
            }
            55% {
              opacity: 1;
              transform: scale(1.05) translateY(-8px);
              filter: blur(0);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
              filter: blur(0);
            }
          }
          @keyframes greetingTrustIn {
            0% {
              opacity: 0;
              transform: translateY(24px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .greeting-welcome {
            opacity: 0;
            animation: greetingWelcomeIn 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .greeting-logo {
            opacity: 0;
            animation: greetingLogoIn 1.35s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards;
          }
          .greeting-trust {
            opacity: 0;
            animation: greetingTrustIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.65s forwards;
          }
        `}</style>
      </div>
    </>
  );
}
