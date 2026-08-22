"use client";

function StoryProgress({ active }: { active: number }) {
  return (
    <div className="absolute left-0 right-0 top-0 z-20 flex gap-1.5 px-4 pt-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-white transition-all duration-700"
            style={{ width: i < active ? "100%" : i === active ? "65%" : "0%" }}
          />
        </div>
      ))}
    </div>
  );
}

export default function PromoStoryProblemPage() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700;800&display=swap" rel="stylesheet" />
      <div
        className="promo-no-chrome relative flex min-h-dvh flex-col overflow-hidden"
        style={{
          fontFamily: "Poppins, system-ui, sans-serif",
          background: "linear-gradient(165deg, #0B1220 0%, #1E293B 45%, #0F172A 100%)",
        }}
      >
        <StoryProgress active={0} />

        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute -left-20 top-32 h-72 w-72 rounded-full opacity-30 blur-3xl"
            style={{ background: "radial-gradient(circle, #334155 0%, transparent 70%)" }}
          />
          <div
            className="problem-glow absolute right-0 top-1/3 h-80 w-80 rounded-full opacity-20 blur-3xl"
            style={{ background: "radial-gradient(circle, #0F766E 0%, transparent 70%)" }}
          />
        </div>

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 text-center">
          <p className="problem-tag text-xs font-semibold uppercase tracking-[0.35em] text-[#5EEAD4]">Real talk</p>

          <div className="problem-emoji mt-8 text-6xl">😰</div>

          <h1 className="problem-line1 mt-8 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            Shaadi ke liye loan chahiye…
          </h1>
          <p className="problem-line2 mt-5 text-xl font-semibold leading-snug text-slate-300">
            Par bank branch?
            <br />
            <span className="text-[#FDE68A]">Ghanton ki line?</span>
          </p>

          <p className="problem-line3 mt-8 max-w-xs text-sm leading-relaxed text-slate-400">
            Documents, visits, waiting — jab aapko paise abhi chahiye.
          </p>
        </div>

        <div className="relative z-10 pb-10 text-center">
          <p className="problem-hint text-xs font-medium uppercase tracking-[0.25em] text-slate-500">Swipe for a better way →</p>
        </div>

        <style jsx global>{`
          nextjs-portal, [data-nextjs-toast], [data-next-mark], #__nextjs-dev-tools-menu,
          #__nextjs-build-indicator, button.fixed.bottom-6.left-6 {
            display: none !important;
          }
        `}</style>
        <style jsx>{`
          .problem-glow { animation: glowPulse 3s ease-in-out infinite; }
          @keyframes glowPulse {
            0%, 100% { opacity: 0.15; transform: scale(1); }
            50% { opacity: 0.28; transform: scale(1.08); }
          }
          .problem-tag, .problem-emoji, .problem-line1, .problem-line2, .problem-line3, .problem-hint {
            opacity: 0;
            animation: fadeUp 0.9s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .problem-emoji { animation-delay: 0.15s; }
          .problem-line1 { animation-delay: 0.35s; }
          .problem-line2 { animation-delay: 0.55s; }
          .problem-line3 { animation-delay: 0.75s; }
          .problem-hint { animation-delay: 1.1s; }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(28px); filter: blur(6px); }
            to { opacity: 1; transform: translateY(0); filter: blur(0); }
          }
        `}</style>
      </div>
    </>
  );
}
