"use client";

import Image from "next/image";
import { NeerCredLogo } from "@/components/NeerCredLogo";

type ChapterId = "1" | "2" | "3";

const CHAPTERS: Record<
  ChapterId,
  {
    roman: string;
    tag: string;
    title: string;
    subtitle: string;
    art: "dream" | "problem" | "brand";
  }
> = {
  "1": {
    roman: "I",
    tag: "The Beginning",
    title: "Every Dream\nDeserves Funding",
    subtitle: "Your goals deserve a smarter path to funds.",
    art: "dream",
  },
  "2": {
    roman: "II",
    tag: "The Challenge",
    title: "Big Plans.\nNo Time to Wait.",
    subtitle: "Skip the queues. Skip the paperwork.",
    art: "problem",
  },
  "3": {
    roman: "III",
    tag: "The Solution",
    title: "Meet NeerCred",
    subtitle: "Dream Big · Borrow Smart",
    art: "brand",
  },
};

function DreamArt() {
  const icons = [
    { label: "Wedding", emoji: "💍", x: "18%", y: "28%", delay: "0s" },
    { label: "Home", emoji: "🏠", x: "72%", y: "22%", delay: "0.4s" },
    { label: "Travel", emoji: "✈️", x: "50%", y: "12%", delay: "0.8s" },
    { label: "Education", emoji: "🎓", x: "28%", y: "58%", delay: "1.1s" },
    { label: "Business", emoji: "💼", x: "68%", y: "55%", delay: "1.4s" },
  ];
  return (
    <div className="relative mx-auto h-[280px] w-[280px] sm:h-[320px] sm:w-[320px]">
      <div className="orbit-ring absolute inset-0 rounded-full border border-[#0F766E]/20 bg-gradient-to-br from-[#E6F4F1] to-white shadow-[0_24px_80px_-24px_rgba(15,118,110,0.45)]" />
      <div className="orbit-glow absolute inset-6 rounded-full bg-[#5EEAD4]/20 blur-2xl" />
      <div className="absolute left-1/2 top-1/2 flex h-28 w-28 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-[#0F766E] to-[#0891B2] shadow-xl">
        <span className="text-4xl">✨</span>
      </div>
      {icons.map((item) => (
        <div
          key={item.label}
          className="float-icon absolute flex flex-col items-center"
          style={{ left: item.x, top: item.y, animationDelay: item.delay }}
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-2xl shadow-lg ring-1 ring-[#0F766E]/10">
            {item.emoji}
          </div>
          <span className="mt-2 text-[10px] font-bold uppercase tracking-wider text-[#0F766E]">{item.label}</span>
        </div>
      ))}
    </div>
  );
}

function ProblemArt() {
  return (
    <div className="relative mx-auto h-[280px] w-[280px] sm:h-[320px] sm:w-[320px]">
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#FFF7ED] to-[#FFEDD5] shadow-xl ring-1 ring-[#FDBA74]/30" />
      <div className="absolute left-1/2 top-8 -translate-x-1/2 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#EA580C]">Bank branch</p>
        <div className="mt-3 flex items-end justify-center gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className="queue-person w-7 rounded-t-full bg-[#F97316]"
              style={{ height: `${28 + n * 8}px`, animationDelay: `${n * 0.15}s` }}
            />
          ))}
        </div>
      </div>
      <div className="paper-stack absolute bottom-10 left-8 h-16 w-20 rounded-lg bg-white shadow-md ring-1 ring-slate-200" />
      <div className="paper-stack absolute bottom-12 left-12 h-16 w-20 rounded-lg bg-white shadow-md ring-1 ring-slate-200" style={{ animationDelay: "0.2s" }} />
      <div className="absolute bottom-10 right-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-[#0B1220] text-3xl shadow-lg clock-tick">
        ⏳
      </div>
      <div className="absolute left-1/2 top-[58%] -translate-x-1/2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#EA580C] shadow-lg ring-1 ring-[#FDBA74]/40">
        Hours of waiting
      </div>
    </div>
  );
}

function BrandArt() {
  return (
    <div className="relative mx-auto flex h-[280px] w-[280px] flex-col items-center justify-center sm:h-[320px] sm:w-[320px]">
      <div className="brand-burst absolute inset-0 rounded-full bg-[#5EEAD4]/25 blur-3xl" />
      <div className="brand-card relative z-10 flex flex-col items-center rounded-3xl bg-white px-8 py-10 shadow-[0_30px_90px_-30px_rgba(15,118,110,0.55)] ring-1 ring-[#0F766E]/15">
        <NeerCredLogo variant="header" size={56} />
        <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.28em] text-[#64748B]">Dream Big · Borrow Smart</p>
        <div className="mt-6 flex gap-3">
          {["HDFC", "ICICI", "Bajaj"].map((bank, i) => (
            <span
              key={bank}
              className="partner-pill rounded-full bg-[#E6F4F1] px-3 py-1 text-[10px] font-bold text-[#0F766E]"
              style={{ animationDelay: `${i * 0.2}s` }}
            >
              {bank}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CinematicChapterScene({ chapter }: { chapter: ChapterId }) {
  const data = CHAPTERS[chapter];
  const Art = data.art === "dream" ? DreamArt : data.art === "problem" ? ProblemArt : BrandArt;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&display=swap" rel="stylesheet" />
      <div
        className="promo-no-chrome relative flex min-h-dvh flex-col overflow-hidden px-6 py-8"
        style={{
          fontFamily: "Poppins, system-ui, sans-serif",
          background: "linear-gradient(180deg, #E8F7F5 0%, #F4FBFA 42%, #FFFFFF 100%)",
        }}
      >
        <div className="pointer-events-none absolute -right-16 top-20 h-56 w-56 rounded-full bg-[#5EEAD4]/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-32 h-48 w-48 rounded-full bg-[#0F766E]/10 blur-3xl" />

        <p className="chapter-tag relative z-10 text-center text-xs font-bold uppercase tracking-[0.35em] text-[#0F766E]">
          Chapter {data.roman} · {data.tag}
        </p>

        <div className="chapter-art relative z-10 mt-8 flex flex-1 items-center justify-center">
          <Art />
        </div>

        <div className="chapter-copy relative z-10 text-center">
          <h1 className="whitespace-pre-line text-3xl font-extrabold leading-tight text-[#0B1220] sm:text-4xl">
            {data.title}
          </h1>
          <p className="mt-4 text-base font-medium text-[#64748B]">{data.subtitle}</p>
        </div>

        <div className="chapter-logo relative z-10 mt-8 flex justify-center opacity-80">
          <Image src="/neercred-logo-header.svg" alt="" width={140} height={40} className="h-8 w-auto" />
        </div>
      </div>

      <style jsx global>{`
        nextjs-portal, [data-nextjs-toast], [data-next-mark], #__nextjs-dev-tools-menu,
        #__nextjs-build-indicator, button.fixed.bottom-6.left-6 {
          display: none !important;
        }
      `}</style>
      <style jsx>{`
        .chapter-tag, .chapter-art, .chapter-copy, .chapter-logo {
          opacity: 0;
          animation: rise 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .chapter-art { animation-delay: 0.15s; }
        .chapter-copy { animation-delay: 0.35s; }
        .chapter-logo { animation-delay: 0.55s; }
        @keyframes rise {
          from { opacity: 0; transform: translateY(28px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .orbit-ring { animation: spin 18s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .float-icon { animation: float 3.2s ease-in-out infinite; }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .queue-person { animation: sway 1.8s ease-in-out infinite; }
        @keyframes sway {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(3px); }
        }
        .paper-stack { animation: stack 2s ease-in-out infinite; }
        @keyframes stack {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        .clock-tick { animation: tick 1s step-end infinite; }
        @keyframes tick { 50% { transform: scale(1.08); } }
        .brand-burst { animation: pulse 2.4s ease-in-out infinite; }
        .brand-card { animation: pop 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both; }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(0.95); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes pop {
          from { opacity: 0; transform: scale(0.88); }
          to { opacity: 1; transform: scale(1); }
        }
        .partner-pill {
          opacity: 0;
          animation: pillIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes pillIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
