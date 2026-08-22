"use client";

import Image from "next/image";
import { NeerCredLogo } from "@/components/NeerCredLogo";

export type MoneyViewSceneId = "hook" | "problem" | "solution" | "speed";

const SCENES: Record<
  MoneyViewSceneId,
  { badge: string; headline: string; sub: string; accent: string }
> = {
  hook: {
    badge: "Real Life Moment",
    headline: "College Fees\nKal Last Date",
    sub: "Sapna bada hai… par time kam hai.",
    accent: "#DC2626",
  },
  problem: {
    badge: "Problem",
    headline: "Paisa Ruke\nToh Sapna Ruke",
    sub: "Bank band. Savings kam. Tension badh rahi hai.",
    accent: "#EA580C",
  },
  solution: {
    badge: "Solution",
    headline: "NeerCred\nTry Karo!",
    sub: "Fully digital. Minutes mein apply.",
    accent: "#0F766E",
  },
  speed: {
    badge: "Fast Track",
    headline: "Loan\nMinutes Mein",
    sub: "Apply → Approve → Bank mein paisa",
    accent: "#0891B2",
  },
};

function HookArt() {
  return (
    <div className="relative mx-auto h-[300px] w-[300px]">
      <div className="letter-card absolute left-1/2 top-6 w-[220px] -translate-x-1/2 rounded-2xl bg-white p-5 shadow-2xl ring-2 ring-[#DC2626]/20">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#DC2626]">Admission Letter</p>
        <p className="mt-2 text-lg font-extrabold text-[#0B1220]">Delhi University</p>
        <p className="mt-1 text-sm text-[#64748B]">B.Com Honours — Semester 1</p>
        <div className="mt-4 rounded-xl bg-[#FEF2F2] px-3 py-2 text-center">
          <p className="text-[10px] font-bold uppercase text-[#DC2626]">Fees Due</p>
          <p className="text-2xl font-extrabold text-[#DC2626]">₹85,000</p>
        </div>
      </div>
      <div className="deadline-badge absolute bottom-8 left-1/2 -translate-x-1/2 rounded-full bg-[#DC2626] px-5 py-2 text-sm font-extrabold text-white shadow-lg">
        ⏰ Kal Last Date!
      </div>
      <div className="pulse-ring absolute inset-0 rounded-full border-4 border-[#DC2626]/30" />
    </div>
  );
}

function ProblemArt() {
  const items = [
    { icon: "🏦", label: "Bank Closed", x: "8%", y: "15%" },
    { icon: "📄", label: "Paperwork", x: "65%", y: "10%" },
    { icon: "💸", label: "Low Savings", x: "12%", y: "62%" },
    { icon: "😰", label: "Stress", x: "68%", y: "58%" },
  ];
  return (
    <div className="relative mx-auto h-[300px] w-[300px]">
      <div className="absolute inset-4 rounded-3xl bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] shadow-xl" />
      <div className="clock-center absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#0B1220] text-4xl shadow-2xl">
        ⏳
      </div>
      {items.map((item, i) => (
        <div
          key={item.label}
          className="problem-bubble absolute flex flex-col items-center"
          style={{ left: item.x, top: item.y, animationDelay: `${i * 0.2}s` }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl shadow-lg">
            {item.icon}
          </div>
          <span className="mt-1 text-[9px] font-bold text-[#EA580C]">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function SolutionArt() {
  return (
    <div className="relative mx-auto h-[300px] w-[300px]">
      <div className="solution-glow absolute inset-0 rounded-full bg-[#5EEAD4]/30 blur-3xl" />
      <div className="phone-pop relative z-10 mx-auto w-[200px] overflow-hidden rounded-[2rem] border-[5px] border-[#1E293B] bg-[#1E293B] shadow-[0_30px_80px_-15px_rgba(15,118,110,0.7)]">
        <div className="absolute left-1/2 top-2 z-20 h-4 w-16 -translate-x-1/2 rounded-full bg-black" />
        <div className="bg-gradient-to-b from-[#E8F7F5] to-white px-4 pb-6 pt-10">
          <NeerCredLogo variant="header" size={40} />
          <p className="mt-3 text-center text-[10px] font-bold uppercase tracking-wider text-[#0F766E]">
            Dream Big · Borrow Smart
          </p>
          <div className="mt-4 rounded-2xl bg-[#0F766E] px-4 py-3 text-center text-sm font-bold text-white shadow-lg">
            Apply Now →
          </div>
          <div className="mt-3 flex justify-center gap-2">
            {["HDFC", "ICICI", "Bajaj"].map((b) => (
              <span key={b} className="rounded-full bg-[#E6F4F1] px-2 py-0.5 text-[8px] font-bold text-[#0F766E]">
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="sparkle absolute right-4 top-8 text-2xl">✨</div>
      <div className="sparkle absolute bottom-12 left-6 text-xl" style={{ animationDelay: "0.5s" }}>
        💡
      </div>
    </div>
  );
}

function SpeedArt() {
  const words = ["APPLY", "VERIFY", "APPROVE", "DISBURSE"];
  return (
    <div className="relative mx-auto flex h-[300px] w-[300px] flex-col items-center justify-center">
      <div className="speed-burst absolute inset-0 rounded-full bg-[#0891B2]/15 blur-2xl" />
      {words.map((word, i) => (
        <span
          key={word}
          className="speed-word absolute text-2xl font-black uppercase tracking-wider text-[#0F766E]"
          style={{
            top: `${18 + i * 18}%`,
            animationDelay: `${i * 0.15}s`,
            opacity: 0.15 + i * 0.2,
          }}
        >
          {word}
        </span>
      ))}
      <div className="relative z-10 text-center">
        <p className="text-6xl font-black text-[#0B1220]">5</p>
        <p className="text-xl font-extrabold uppercase tracking-[0.3em] text-[#0891B2]">Minutes</p>
        <p className="mt-2 text-sm font-bold text-[#64748B]">Poora process online</p>
      </div>
      <div className="speed-line absolute bottom-12 left-8 right-8 h-1 rounded-full bg-gradient-to-r from-[#0F766E] via-[#0891B2] to-[#5EEAD4]" />
    </div>
  );
}

const ART: Record<MoneyViewSceneId, () => JSX.Element> = {
  hook: HookArt,
  problem: ProblemArt,
  solution: SolutionArt,
  speed: SpeedArt,
};

export function MoneyViewScene({ scene }: { scene: MoneyViewSceneId }) {
  const data = SCENES[scene];
  const Art = ART[scene];

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800;900&display=swap" rel="stylesheet" />
      <div
        className="promo-no-chrome relative flex min-h-dvh flex-col overflow-hidden px-6 py-8"
        style={{
          fontFamily: "Poppins, system-ui, sans-serif",
          background: "linear-gradient(180deg, #E8F7F5 0%, #F4FBFA 40%, #FFFFFF 100%)",
        }}
      >
        <div className="pointer-events-none absolute -right-20 top-10 h-64 w-64 rounded-full bg-[#5EEAD4]/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-20 h-48 w-48 rounded-full bg-[#0F766E]/10 blur-3xl" />

        <span
          className="mv-badge relative z-10 mx-auto rounded-full px-4 py-1.5 text-[10px] font-extrabold uppercase tracking-[0.25em] text-white"
          style={{ backgroundColor: data.accent }}
        >
          {data.badge}
        </span>

        <div className="mv-art relative z-10 mt-6 flex flex-1 items-center justify-center">
          <Art />
        </div>

        <div className="mv-copy relative z-10 text-center">
          <h1 className="whitespace-pre-line text-3xl font-black leading-tight text-[#0B1220] sm:text-4xl">
            {data.headline}
          </h1>
          <p className="mt-3 text-base font-semibold text-[#64748B]">{data.sub}</p>
        </div>

        <div className="mv-logo relative z-10 mt-6 flex justify-center">
          <Image src="/neercred-logo-header.svg" alt="" width={130} height={38} className="h-7 w-auto opacity-70" />
        </div>
      </div>

      <style jsx global>{`
        nextjs-portal, [data-nextjs-toast], [data-next-mark], #__nextjs-dev-tools-menu,
        #__nextjs-build-indicator, button.fixed.bottom-6.left-6 { display: none !important; }
      `}</style>
      <style jsx>{`
        .mv-badge, .mv-art, .mv-copy, .mv-logo {
          opacity: 0;
          animation: popIn 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .mv-art { animation-delay: 0.12s; }
        .mv-copy { animation-delay: 0.28s; }
        .mv-logo { animation-delay: 0.42s; }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0.92) translateY(20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .letter-card { animation: letterDrop 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both; }
        @keyframes letterDrop {
          from { opacity: 0; transform: translateX(-50%) translateY(-30px) rotate(-3deg); }
          to { opacity: 1; transform: translateX(-50%) translateY(0) rotate(0); }
        }
        .deadline-badge { animation: shake 0.6s ease-in-out 0.8s infinite; }
        @keyframes shake {
          0%, 100% { transform: translateX(-50%); }
          25% { transform: translateX(calc(-50% - 4px)); }
          75% { transform: translateX(calc(-50% + 4px)); }
        }
        .pulse-ring { animation: pulseRing 2s ease-out infinite; }
        @keyframes pulseRing {
          0% { transform: scale(0.9); opacity: 0.8; }
          100% { transform: scale(1.15); opacity: 0; }
        }
        .clock-center { animation: tick 1s step-end infinite; }
        @keyframes tick { 50% { transform: translate(-50%, -50%) scale(1.1); } }
        .problem-bubble { animation: bubble 2.5s ease-in-out infinite; }
        @keyframes bubble {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        .phone-pop { animation: phonePop 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both; }
        @keyframes phonePop {
          from { opacity: 0; transform: scale(0.8) translateY(30px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .solution-glow { animation: glow 2s ease-in-out infinite; }
        @keyframes glow {
          0%, 100% { opacity: 0.4; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        .sparkle { animation: sparkle 1.5s ease-in-out infinite; }
        @keyframes sparkle {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        .speed-word { animation: speedFlash 1.2s ease-in-out infinite; }
        @keyframes speedFlash {
          0%, 100% { opacity: 0.1; transform: scale(0.95); }
          50% { opacity: 0.5; transform: scale(1.05); }
        }
        .speed-burst { animation: burst 2s ease-in-out infinite; }
        @keyframes burst {
          0%, 100% { transform: scale(0.9); }
          50% { transform: scale(1.1); }
        }
        .speed-line { animation: lineGrow 1.5s ease-out 0.3s both; transform-origin: left; }
        @keyframes lineGrow {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
      `}</style>
    </>
  );
}
