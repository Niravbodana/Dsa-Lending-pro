"use client";

function EndcardLogo() {
  return (
    <svg
      width="100%"
      height="auto"
      viewBox="0 0 320 108"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="NeerCred™ — Dream Big. Borrow Smart."
      className="drop-shadow-2xl"
      preserveAspectRatio="xMidYMid meet"
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
      <text x="78" y="48" fontFamily="Poppins, system-ui, sans-serif" fontSize="34" fontWeight="800" letterSpacing="-0.5" dominantBaseline="middle">
        <tspan fill="#0F172A">Neer</tspan>
        <tspan fill="url(#ec-cred)">Cred</tspan>
        <tspan fill="#64748B" fontSize="16" fontWeight="600" dx="2">™</tspan>
      </text>
      <text x="78" y="78" fontFamily="Poppins, system-ui, sans-serif" fontSize="11" fontWeight="600" fill="url(#ec-gold-text)" letterSpacing="3.2">
        DREAM BIG · BORROW SMART
      </text>
    </svg>
  );
}

function PointerCursor() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden className="drop-shadow-lg">
      <path
        d="M5.5 3.5L18.5 11.2C19.3 11.7 19.1 13 18.1 13.2L13.8 14.1L12.2 18.8C11.9 19.7 10.7 19.8 10.2 19L5.5 3.5Z"
        fill="white"
        stroke="#0B1220"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PromoEndcardPage() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&display=swap" rel="stylesheet" />
      <div
        className="promo-no-chrome promo-endcard-root relative flex min-h-dvh flex-col items-center justify-center overflow-hidden px-6 py-10"
        style={{
          background: "linear-gradient(160deg, #F0FDF9 0%, #D1FAE5 38%, #A7F3D0 72%, #86EFAC 100%)",
          fontFamily: "Poppins, system-ui, sans-serif",
        }}
      >
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute -right-24 -top-24 h-96 w-96 rounded-full opacity-50 blur-3xl"
            style={{ background: "radial-gradient(circle, #BBF7D0 0%, #ECFDF5 50%, transparent 72%)" }}
          />
          <div
            className="absolute -bottom-32 -left-24 h-80 w-80 rounded-full opacity-35 blur-3xl"
            style={{ background: "radial-gradient(circle, #6EE7B7 0%, transparent 70%)" }}
          />
        </div>

        <div className="endcard-logo relative z-10 flex max-w-[min(100%,300px)] flex-col items-center text-center">
          <EndcardLogo />
        </div>

        <p
          className="endcard-tag relative z-10 mt-5 text-center text-base font-semibold uppercase tracking-[0.35em] text-[#B45309]"
          style={{ textShadow: "0 1px 12px rgba(212,160,23,0.25)" }}
        >
          Purity &amp; Trust
        </p>

        <div className="endcard-link-wrap relative z-10 mt-8">
          <a
            href="https://www.neercred.com"
            className="endcard-link group relative inline-block text-5xl font-extrabold tracking-tight text-[#134E4A] no-underline sm:text-[3.25rem]"
          >
            <span className="relative z-10">www.neercred.com</span>
            <span className="endcard-link-underline absolute -bottom-1 left-0 h-1 w-full rounded-full bg-gradient-to-r from-[#5EEAD4] to-[#FDE68A]" />
            <span className="endcard-click-ripple pointer-events-none absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/40" />
          </a>
          <div className="endcard-cursor pointer-events-none absolute left-full top-1/2 z-20 -translate-y-1/2">
            <PointerCursor />
          </div>
        </div>

        <button
          type="button"
          className="endcard-cta relative z-10 mt-8 rounded-2xl px-12 py-4 text-lg font-bold text-white shadow-2xl"
          style={{
            background: "linear-gradient(135deg, #047857 0%, #0F766E 50%, #14B8A6 100%)",
            boxShadow: "0 12px 40px -8px rgba(15,118,110,0.45), 0 0 0 1px rgba(94,234,212,0.35)",
          }}
        >
          Apply Now →
        </button>

        <p className="endcard-legal relative z-10 mt-12 max-w-xl text-center text-sm leading-relaxed text-[#475569]">
          Nirav Enterprises, operating as NeerCred
          <br />
          Digital Lending Aggregator · Financial Services Platform
        </p>

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
          @keyframes endcardCursorMove {
            0%,
            18% {
              opacity: 0;
              transform: translate(120px, 80px) scale(1);
            }
            28% {
              opacity: 1;
              transform: translate(120px, 80px) scale(1);
            }
            52% {
              opacity: 1;
              transform: translate(-28px, 8px) scale(1);
            }
            58% {
              opacity: 1;
              transform: translate(-28px, 8px) scale(0.82);
            }
            62% {
              opacity: 1;
              transform: translate(-28px, 8px) scale(1);
            }
            100% {
              opacity: 1;
              transform: translate(-28px, 8px) scale(1);
            }
          }
          @keyframes endcardLinkPulse {
            0%,
            55% {
              text-shadow: none;
              filter: brightness(1);
            }
            62% {
              text-shadow: 0 0 28px rgba(94, 234, 212, 0.85);
              filter: brightness(1.15);
            }
            75%,
            100% {
              text-shadow: 0 0 16px rgba(94, 234, 212, 0.45);
              filter: brightness(1.05);
            }
          }
          @keyframes endcardRipple {
            0%,
            58% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(0.2);
            }
            62% {
              opacity: 0.7;
              transform: translate(-50%, -50%) scale(2.5);
            }
            75% {
              opacity: 0;
              transform: translate(-50%, -50%) scale(4);
            }
            100% {
              opacity: 0;
            }
          }
          @keyframes endcardCtaIn {
            0%,
            60% {
              opacity: 0;
              transform: translateY(24px) scale(0.94);
            }
            100% {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
          .endcard-logo {
            animation: endcardLogoIn 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .endcard-tag {
            opacity: 0;
            animation: endcardFadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.45s forwards;
          }
          .endcard-link-wrap {
            opacity: 0;
            animation: endcardFadeUp 1s cubic-bezier(0.16, 1, 0.3, 1) 0.65s forwards;
          }
          .endcard-link {
            animation: endcardLinkPulse 3.5s ease-in-out 0.65s infinite;
          }
          .endcard-cursor {
            animation: endcardCursorMove 3.5s cubic-bezier(0.22, 1, 0.36, 1) 0.8s infinite;
          }
          .endcard-click-ripple {
            animation: endcardRipple 3.5s ease-out 0.8s infinite;
          }
          .endcard-cta {
            opacity: 0;
            animation: endcardCtaIn 0.85s cubic-bezier(0.16, 1, 0.3, 1) 1.1s forwards;
          }
          .endcard-legal {
            opacity: 0;
            animation: endcardFadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) 1.25s forwards;
          }
        `}</style>
      </div>
    </>
  );
}
