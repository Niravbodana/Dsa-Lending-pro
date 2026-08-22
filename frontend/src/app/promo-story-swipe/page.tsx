"use client";

function StoryProgress({ active }: { active: number }) {
  return (
    <div className="absolute left-0 right-0 top-0 z-20 flex gap-1.5 px-4 pt-3">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/25">
          <div
            className="h-full rounded-full bg-white transition-all duration-500"
            style={{ width: i < active ? "100%" : i === active ? "80%" : "0%" }}
          />
        </div>
      ))}
    </div>
  );
}

function SwipeChevrons() {
  return (
    <div className="flex flex-col items-center gap-0">
      {[0, 1, 2].map((i) => (
        <svg
          key={i}
          width="28"
          height="16"
          viewBox="0 0 24 14"
          fill="none"
          className="swipe-chevron text-white"
          style={{ animationDelay: `${i * 0.15}s`, marginTop: i > 0 ? -6 : 0 }}
          aria-hidden
        >
          <path d="M4 10L12 4L20 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ))}
    </div>
  );
}

export default function PromoStorySwipePage() {
  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&display=swap" rel="stylesheet" />
      <div
        className="promo-no-chrome relative flex min-h-dvh flex-col overflow-hidden"
        style={{
          fontFamily: "Poppins, system-ui, sans-serif",
          background: "linear-gradient(180deg, #0B1220 0%, #134E4A 55%, #0F766E 100%)",
        }}
      >
        <StoryProgress active={1} />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-8 text-center">
          <p className="swipe-kicker text-xs font-semibold uppercase tracking-[0.3em] text-[#5EEAD4]">Interactive</p>
          <h1 className="swipe-title mt-6 text-4xl font-extrabold leading-tight text-white">
            There&apos;s a
            <br />
            <span className="text-transparent" style={{ background: "linear-gradient(90deg,#5EEAD4,#FDE68A)", WebkitBackgroundClip: "text" }}>
              better way
            </span>
          </h1>
          <p className="swipe-sub mt-4 text-base text-slate-300">No branch. No queue. Fully digital.</p>
        </div>

        <div className="swipe-zone relative z-10 mx-6 mb-10 rounded-3xl border border-white/15 bg-white/5 p-8 backdrop-blur-md">
          <div className="swipe-shimmer pointer-events-none absolute inset-0 rounded-3xl" />
          <div className="relative flex flex-col items-center">
            <SwipeChevrons />
            <p className="mt-4 text-lg font-bold text-white">Swipe up</p>
            <p className="mt-1 text-sm text-slate-300">for instant loan offers</p>
            <div className="swipe-finger mt-6 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 ring-2 ring-white/20">
              <span className="text-2xl">👆</span>
            </div>
          </div>
        </div>

        <style jsx global>{`
          nextjs-portal, [data-nextjs-toast], [data-next-mark], #__nextjs-dev-tools-menu,
          #__nextjs-build-indicator, button.fixed.bottom-6.left-6 {
            display: none !important;
          }
        `}</style>
        <style jsx>{`
          .swipe-kicker, .swipe-title, .swipe-sub, .swipe-zone {
            opacity: 0;
            animation: fadeUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .swipe-title { animation-delay: 0.2s; }
          .swipe-sub { animation-delay: 0.4s; }
          .swipe-zone { animation-delay: 0.55s; }
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(24px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .swipe-chevron {
            animation: chevronBounce 1.4s ease-in-out infinite;
            opacity: 0.9;
          }
          @keyframes chevronBounce {
            0%, 100% { transform: translateY(0); opacity: 0.4; }
            50% { transform: translateY(-8px); opacity: 1; }
          }
          .swipe-finger {
            animation: fingerSwipe 2.2s cubic-bezier(0.22, 1, 0.36, 1) infinite;
          }
          @keyframes fingerSwipe {
            0%, 20% { transform: translateY(24px); opacity: 0.5; }
            45% { transform: translateY(-32px); opacity: 1; }
            70%, 100% { transform: translateY(-48px); opacity: 0; }
          }
          .swipe-shimmer {
            background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%);
            background-size: 200% 100%;
            animation: shimmer 2.5s ease-in-out infinite;
          }
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
      </div>
    </>
  );
}
