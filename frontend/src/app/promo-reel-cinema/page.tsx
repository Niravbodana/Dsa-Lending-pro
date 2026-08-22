"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

type DialogueLine = {
  speaker: string;
  name: string;
  text: string;
  at: number;
  duration: number;
  highlight?: boolean;
};

type FilmScene = {
  id: string;
  bg?: string;
  duration: number;
  mood: string;
  ken: string;
  timeLabel?: string;
  lines: DialogueLine[];
  type?: "phone" | "endcard";
  screens?: string[];
  assetBase?: string;
};

type SpeakerStyle = { name: string; color: string; align: "left" | "right" | "center" };

type Timeline = {
  id: string;
  title: string;
  tagline: string;
  cta: string;
  assetBase: string;
  totalDuration: number;
  speakers: Record<string, SpeakerStyle>;
  scenes: FilmScene[];
};

function FilmGrain() {
  return <div className="film-grain pointer-events-none absolute inset-0 z-20 opacity-[0.14]" aria-hidden />;
}

function Vignette({ mood }: { mood: string }) {
  const dark = mood === "quiet" || mood === "tension";
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10"
      style={{
        background: dark
          ? "radial-gradient(ellipse at center, transparent 38%, rgba(0,0,0,0.7) 100%)"
          : "radial-gradient(ellipse at center, transparent 48%, rgba(0,0,0,0.5) 100%)",
      }}
    />
  );
}

function SceneBg({ scene, progress, assetBase }: { scene: FilmScene; progress: number; assetBase: string }) {
  const ken = scene.ken;
  const scale = ken === "out" ? 1.12 - progress * 0.08 : 1.03 + progress * 0.09;
  const tx = ken === "left" ? progress * -2.5 : ken === "right" ? progress * 2.5 : 0;
  const filter =
    scene.mood === "quiet"
      ? "brightness(0.78) saturate(0.9)"
      : scene.mood === "warm"
        ? "brightness(0.82) saturate(0.95)"
        : "brightness(0.9) saturate(1.02)";

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="scene-bg absolute inset-[-6%] bg-cover bg-center"
        style={{
          backgroundImage: scene.bg ? `url(${assetBase}/${scene.bg})` : undefined,
          transform: `scale(${scale}) translate(${tx}%, ${progress * -1}%)`,
          filter,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(11,18,32,0.25) 0%, transparent 30%, rgba(11,18,32,0.55) 100%)",
        }}
      />
    </div>
  );
}

function PhoneOverlay({ screens, progress }: { screens: string[]; progress: number }) {
  const idx = Math.min(Math.floor(progress * screens.length * 1.08), screens.length - 1);
  return (
    <div className="absolute inset-0 z-[8] flex items-center justify-center bg-black/35">
      <div className="relative rounded-[2.4rem] border border-[#5EEAD4]/35 bg-[#0B1220] p-2 shadow-2xl" style={{ width: 270, height: 540 }}>
        <div className="h-full w-full rounded-[2rem] bg-cover bg-top" style={{ backgroundImage: `url(/promo-screens/${screens[idx]})` }} />
      </div>
    </div>
  );
}

function Endcard({ tagline, cta }: { tagline: string; cta: string }) {
  return (
    <div
      className="absolute inset-0 z-30 flex flex-col items-center justify-center px-8 text-center"
      style={{ background: "linear-gradient(135deg, #0B1220 0%, #0F766E 48%, #0891B2 100%)" }}
    >
      <p className="text-sm font-semibold tracking-[0.35em] text-[#FDE68A]">PURITY & TRUST</p>
      <h1 className="mt-4 text-5xl font-extrabold text-white">
        Neer<span className="text-[#5EEAD4]">Cred</span>
      </h1>
      <p className="mt-3 text-sm font-semibold tracking-[0.28em] text-[#FDE68A]">{tagline.toUpperCase()}</p>
      <p className="mt-8 text-2xl font-bold text-white">{cta}</p>
      <p className="mt-6 text-lg text-white/80">www.neercred.com</p>
    </div>
  );
}

function Subtitles({
  line,
  speakers,
}: {
  line: DialogueLine | null;
  speakers: Record<string, SpeakerStyle>;
}) {
  if (!line || !line.text) return null;
  const st = speakers[line.speaker] ?? { name: "", color: "#fff", align: "center" as const };
  return (
    <div className="absolute bottom-32 left-0 right-0 z-30 px-6" style={{ textAlign: st.align }}>
      {st.name ? (
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.32em]" style={{ color: st.color }}>
          {st.name}
        </p>
      ) : null}
      <p
        className={`text-[1.45rem] font-medium leading-snug text-white drop-shadow-lg ${line.highlight ? "subtitle-highlight" : ""}`}
      >
        {line.text}
      </p>
    </div>
  );
}

export default function PromoReelCinemaPage() {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-[#0B1220]" />}>
      <ReelCinemaFilm />
    </Suspense>
  );
}

function ReelCinemaFilm() {
  const params = useSearchParams();
  const storyId = params.get("story") || "mom-doesnt-ask";
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const startRef = useRef(0);

  useEffect(() => {
    fetch(`/reel-cinema/${storyId}/timeline.json`)
      .then((r) => r.json())
      .then(setTimeline)
      .catch(console.error);
  }, [storyId]);

  useEffect(() => {
    if (params.get("autoplay") === "1" && timeline) {
      const t = setTimeout(() => setStarted(true), 350);
      return () => clearTimeout(t);
    }
  }, [timeline, params]);

  useEffect(() => {
    if (!started || !timeline) return;
    startRef.current = performance.now();
    let raf = 0;
    const tick = () => {
      const t = (performance.now() - startRef.current) / 1000;
      setElapsed(t);
      if (t < timeline.totalDuration + 0.3) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [started, timeline]);

  if (!timeline) return <div className="min-h-dvh bg-[#0B1220]" />;

  let sceneStart = 0;
  let current = timeline.scenes[0];
  let progress = 0;
  let next: FilmScene | null = null;
  let crossfade = 0;

  for (const sc of timeline.scenes) {
    const end = sceneStart + sc.duration;
    if (elapsed >= sceneStart && elapsed < end) {
      current = sc;
      progress = (elapsed - sceneStart) / sc.duration;
      const idx = timeline.scenes.indexOf(sc);
      if (idx + 1 < timeline.scenes.length) {
        next = timeline.scenes[idx + 1];
        const fadeIn = sc.duration - 1.0;
        if (elapsed - sceneStart > fadeIn) crossfade = (elapsed - sceneStart - fadeIn) / 1.0;
      }
      break;
    }
    sceneStart = end - 1.0;
  }

  const activeLine = current.lines
    .filter((l) => elapsed >= sceneStart + l.at && elapsed < sceneStart + l.at + l.duration + 0.2)
    .pop() ?? null;

  if (current.type === "endcard") {
    return (
      <div id="reel-cinema-root" className="relative h-dvh w-full overflow-hidden" data-started={started ? "1" : "0"}>
        <Endcard tagline={timeline.tagline} cta={timeline.cta} />
        <style jsx global>{`
          nextjs-portal, [data-next-mark], #__nextjs-build-indicator { display: none !important; }
        `}</style>
      </div>
    );
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&display=swap" rel="stylesheet" />
      <div
        id="reel-cinema-root"
        className="relative h-dvh w-full overflow-hidden bg-[#0B1220]"
        style={{ fontFamily: "Poppins, system-ui, sans-serif" }}
        data-started={started ? "1" : "0"}
        data-elapsed={elapsed.toFixed(2)}
      >
        <SceneBg scene={current} progress={progress} assetBase={timeline.assetBase} />
        {next && crossfade > 0 && next.type !== "endcard" && (
          <div className="absolute inset-0 z-[5]" style={{ opacity: crossfade }}>
            <SceneBg scene={next} progress={0} assetBase={timeline.assetBase} />
          </div>
        )}
        {current.type === "phone" && current.screens && <PhoneOverlay screens={current.screens} progress={progress} />}
        <Vignette mood={current.mood} />
        <FilmGrain />
        <div className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between px-5 pt-5">
          <span className="text-[10px] font-bold tracking-[0.28em] text-[#D4A017]">NEERCRED</span>
          {current.timeLabel ? (
            <span className="rounded-full bg-black/35 px-3 py-1 text-[10px] font-medium text-white/75">{current.timeLabel}</span>
          ) : (
            <span />
          )}
        </div>
        <Subtitles line={activeLine} speakers={timeline.speakers} />
        {!started && (
          <button
            type="button"
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/45 text-white"
            onClick={() => setStarted(true)}
          >
            ▶ Play
          </button>
        )}
        <style jsx global>{`
          .film-grain {
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence baseFrequency='0.9' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
            animation: grain 0.4s steps(3) infinite;
          }
          @keyframes grain {
            0% { transform: translate(0,0) }
            50% { transform: translate(-1%,1%) }
            100% { transform: translate(1%,-1%) }
          }
          .subtitle-highlight {
            text-shadow: 0 0 24px rgba(94,234,212,0.35);
            font-weight: 600;
          }
          nextjs-portal, [data-next-mark], #__nextjs-build-indicator, button.fixed.bottom-6.left-6,
          .loan-guide-root, [class*="cookie"], [class*="Cookie"], [aria-label*="Cookie"] {
            display: none !important;
          }
        `}</style>
      </div>
    </>
  );
}
