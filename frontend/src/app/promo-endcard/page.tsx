"use client";

function EndcardLogo() {
  return (
    <svg
      width="480"
      height="162"
      viewBox="0 0 320 108"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="NeerCred — Dream Big. Borrow Smart."
      className="drop-shadow-2xl"
    >
      <defs>
        <linearGradient id="ec-blue" x1="8" y1="8" x2="36" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#22D3EE" />
          <stop offset="0.55" stopColor="#3B82F6" />
          <stop offset="1" stopColor="#1E3A8A" />
        </linearGradient>
        <linearGradient id="ec-gold" x1="42" y1="12" x2="52" y2="50" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE68A" />
          <stop offset="0.45" stopColor="#E8C547" />
          <stop offset="1" stopColor="#B8860B" />
        </linearGradient>
        <linearGradient id="ec-ring-blue" x1="6" y1="32" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="ec-ring-gold" x1="32" y1="32" x2="58" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F5D76E" />
          <stop offset="1" stopColor="#C9A227" />
        </linearGradient>
        <linearGradient id="ec-cred" x1="88" y1="0" x2="240" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2DD4BF" />
          <stop offset="0.5" stopColor="#0F766E" />
          <stop offset="1" stopColor="#5EEAD4" />
        </linearGradient>
        <linearGradient id="ec-gold-text" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDE68A" />
          <stop offset="1" stopColor="#D4A017" />
        </linearGradient>
      </defs>
      <g transform="translate(8, 14) scale(0.72)">
        <path d="M48 14 A34 34 0 0 0 48 82" stroke="url(#ec-ring-blue)" strokeWidth="2.8" fill="none" strokeLinecap="round" />
        <path d="M48 14 A34 34 0 0 1 48 82" stroke="url(#ec-ring-gold)" strokeWidth="2.8" fill="none" strokeLinecap="round" />
        <path d="M34 30 L34 66" stroke="url(#ec-blue)" strokeWidth="7.5" strokeLinecap="round" />
        <path d="M34 30 L62 66" stroke="url(#ec-blue)" strokeWidth="7.5" strokeLinecap="round" />
        <path d="M62 30 L62 66" stroke="url(#ec-gold)" strokeWidth="7.5" strokeLinecap="round" />
        <path
          d="M48 9.5 L49.8 13.8 L54.4 13.8 L50.8 16.6 L52.2 21 L48 18.4 L43.8 21 L45.2 16.6 L41.6 13.8 L46.2 13.8 Z"
          fill="url(#ec-gold)"
        />
      </g>
      <text
        x="78"
        y="48"
        fontFamily="Poppins, system-ui, sans-serif"
        fontSize="34"
        fontWeight="800"
        letterSpacing="-0.5"
        dominantBaseline="middle"
      >
        <tspan fill="#F8FAFC">Neer</tspan>
        <tspan fill="url(#ec-cred)">Cred</tspan>
      </text>
      <text
        x="78"
        y="78"
        fontFamily="Poppins, system-ui, sans-serif"
        fontSize="11"
        fontWeight="600"
        fill="url(#ec-gold-text)"
        letterSpacing="3.2"
      >
        DREAM BIG · BORROW SMART
      </text>
    </svg>
  );
}

export default function PromoEndcardPage() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&display=swap" rel="stylesheet" />
      <div
        className="promo-endcard-root relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-8"
        style={{
          background: "linear-gradient(135deg, #0B1220 0%, #0F766E 48%, #0891B2 100%)",
          fontFamily: "Poppins, system-ui, sans-serif",
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-30 blur-3xl"
            style={{ background: "radial-gradient(circle, #5EEAD4 0%, transparent 70%)" }}
          />
          <div
            className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full opacity-20 blur-3xl"
            style={{ background: "radial-gradient(circle, #D4A017 0%, transparent 70%)" }}
          />
        </div>

        <div className="endcard-logo relative z-10 flex flex-col items-center text-center">
          <EndcardLogo />
        </div>

        <p
          className="endcard-tag relative z-10 mt-6 text-center text-base font-semibold uppercase tracking-[0.35em] text-[#FDE68A]"
          style={{ textShadow: "0 2px 24px rgba(212,160,23,0.35)" }}
        >
          Purity &amp; Trust
        </p>

        <p className="endcard-site relative z-10 mt-8 text-6xl font-extrabold tracking-tight text-white">
          neercred.com
        </p>

        <p className="endcard-legal relative z-10 mt-14 max-w-xl text-center text-sm leading-relaxed text-slate-300">
          Nirav Enterprises, operating as NeerCred
          <br />
          Digital Lending Aggregator · Financial Services Platform
        </p>

        <style jsx global>{`
          nextjs-portal,
          [data-nextjs-toast],
          [data-next-mark],
          #__nextjs-dev-tools-menu,
          #__nextjs-build-indicator {
            display: none !important;
          }
          @keyframes endcardLogoIn {
            0% {
              opacity: 0;
              transform: scale(0.72) translateY(48px);
              filter: blur(12px);
            }
            55% {
              opacity: 1;
              transform: scale(1.04) translateY(-6px);
              filter: blur(0);
            }
            100% {
              opacity: 1;
              transform: scale(1) translateY(0);
              filter: blur(0);
            }
          }
          @keyframes endcardFadeUp {
            0% {
              opacity: 0;
              transform: translateY(36px);
              filter: blur(8px);
            }
            100% {
              opacity: 1;
              transform: translateY(0);
              filter: blur(0);
            }
          }
          .endcard-logo {
            animation: endcardLogoIn 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .endcard-tag {
            opacity: 0;
            animation: endcardFadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.45s forwards;
          }
          .endcard-site {
            opacity: 0;
            animation: endcardFadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.7s forwards;
          }
          .endcard-legal {
            opacity: 0;
            animation: endcardFadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) 1s forwards;
          }
        `}</style>
      </div>
    </>
  );
}
