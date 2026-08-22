"use client";

import { useEffect, useRef, useState } from "react";

type DialogueLine = {
  speaker: string;
  name: string;
  text: string;
  at: number;
  duration: number;
};

type FilmScene = {
  id: string;
  bg: string;
  duration: number;
  mood: "tension" | "transition" | "hope" | "uplift";
  ken: "in" | "out" | "left" | "right";
  lines: DialogueLine[];
  type?: "phone";
  screens?: string[];
};

type Timeline = {
  totalDuration: number;
  scenes: FilmScene[];
};

const SPEAKER_STYLE: Record<string, { color: string; align: "left" | "right" | "center" }> = {
  meera: { color: "#5EEAD4", align: "left" },
  receptionist: { color: "#FDE68A", align: "right" },
  narrator: { color: "#F8FAFC", align: "center" },
};

function FilmGrain() {
  return (
    <div
      className="film-grain pointer-events-none absolute inset-0 z-20 opacity-[0.18]"
      aria-hidden
    />
  );
}

function PhoneOverlay({ screens, progress }: { screens: string[]; progress: number }) {
  const idx = Math.min(Math.floor(progress * screens.length * 1.05), screens.length - 1);
  const screen = screens[idx];
  return (
    <div className="absolute inset-0 z-[8] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div
        className="relative rounded-[2.5rem] border-2 border-[#5EEAD4]/40 bg-[#0B1220] p-2 shadow-2xl"
        style={{ width: 280, height: 560, animation: "phoneFloat 4s ease-in-out infinite" }}
      >
        <div
          className="h-full w-full rounded-[2rem] bg-cover bg-top"
          style={{ backgroundImage: `url(/promo-screens/${screen})` }}
        />
      </div>
      <style jsx>{`
        @keyframes phoneFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
      `}</style>
    </div>
  );
}

function Vignette({ mood }: { mood: FilmScene["mood"] }) {
  const intense = mood === "tension";
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10"
      style={{
        background: intense
          ? "radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.75) 100%)"
          : "radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%)",
      }}
    />
  );
}

function DialogueBox({ line, visible }: { line: DialogueLine | null; visible: boolean }) {
  if (!line || !visible) return null;
  const style = SPEAKER_STYLE[line.speaker] ?? SPEAKER_STYLE.narrator;
  return (
    <div
      className="dialogue-box absolute bottom-36 left-0 right-0 z-30 px-6 transition-all duration-500"
      style={{ textAlign: style.align }}
    >
      <p
        className="mb-2 text-xs font-bold uppercase tracking-[0.35em] opacity-90"
        style={{ color: style.color }}
      >
        {line.name}
      </p>
      <p className="dialogue-text text-[1.65rem] font-semibold leading-snug text-white drop-shadow-lg">
        {line.text}
      </p>
    </div>
  );
}

function SceneBackground({ scene, progress }: { scene: FilmScene; progress: number }) {
  const ken = scene.ken;
  const scale = ken === "out" ? 1.14 - progress * 0.1 : 1.04 + progress * 0.1;
  const tx = ken === "left" ? progress * -3 : ken === "right" ? progress * 3 : 0;
  const ty = ken === "in" ? progress * -2 : progress * 1;

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="scene-bg absolute inset-[-8%] bg-cover bg-center will-change-transform"
        style={{
          backgroundImage: `url(/promo-story3/${scene.bg})`,
          transform: `scale(${scale}) translate(${tx}%, ${ty}%)`,
          filter: scene.mood === "tension" ? "brightness(0.72) saturate(0.85)" : "brightness(0.88) saturate(1.05)",
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            scene.mood === "tension"
              ? "linear-gradient(180deg, rgba(11,18,32,0.35) 0%, rgba(11,18,32,0.15) 40%, rgba(11,18,32,0.65) 100%)"
              : "linear-gradient(180deg, rgba(11,18,32,0.2) 0%, transparent 35%, rgba(15,118,110,0.25) 100%)",
        }}
      />
    </div>
  );
}

export default function PromoStory3FilmPage() {
  const [timeline, setTimeline] = useState<Timeline | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [started, setStarted] = useState(false);
  const startRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    fetch("/story3-timeline.json")
      .then((r) => r.json())
      .then((t: Timeline) => setTimeline(t))
      .catch(() => {
        setTimeline({
          totalDuration: 10,
          scenes: [
            {
              id: "fallback",
              bg: "story3-01-hospital-corridor.png",
              duration: 10,
              mood: "tension",
              ken: "in",
              lines: [],
            },
          ],
        });
      });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("autoplay") === "1") {
      const t = setTimeout(() => setStarted(true), 400);
      return () => clearTimeout(t);
    }
  }, [timeline]);

  useEffect(() => {
    if (!started || !timeline) return;
    startRef.current = performance.now();
    const tick = () => {
      const t = (performance.now() - startRef.current) / 1000;
      setElapsed(t);
      if (t < timeline.totalDuration + 0.5) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [started, timeline]);

  if (!timeline) {
    return <div className="min-h-dvh bg-[#0B1220]" />;
  }

  let sceneStart = 0;
  let currentScene: FilmScene = timeline.scenes[0];
  let sceneProgress = 0;
  let nextScene: FilmScene | null = null;
  let crossfade = 0;

  for (const scene of timeline.scenes) {
    const sceneEnd = sceneStart + scene.duration;
    if (elapsed >= sceneStart && elapsed < sceneEnd) {
      currentScene = scene;
      sceneProgress = (elapsed - sceneStart) / scene.duration;
      const nextIdx = timeline.scenes.indexOf(scene) + 1;
      if (nextIdx < timeline.scenes.length) {
        nextScene = timeline.scenes[nextIdx];
        const fadeStart = scene.duration - 1.4;
        if (elapsed - sceneStart > fadeStart) {
          crossfade = (elapsed - sceneStart - fadeStart) / 1.4;
        }
      }
      break;
    }
    sceneStart = sceneEnd - 1.4;
  }

  const activeLines = currentScene.lines.filter(
    (l) => elapsed >= sceneStart + l.at && elapsed < sceneStart + l.at + l.duration + 0.3,
  );
  const activeLine = activeLines.length ? activeLines[activeLines.length - 1] : null;

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@500;600;700&display=swap" rel="stylesheet" />
      <div
        id="story3-film-root"
        className="promo-no-chrome relative h-dvh w-full overflow-hidden bg-[#0B1220]"
        style={{ fontFamily: "Poppins, system-ui, sans-serif" }}
        data-started={started ? "1" : "0"}
        data-elapsed={elapsed.toFixed(2)}
      >
        <SceneBackground scene={currentScene} progress={sceneProgress} />
        {currentScene.type === "phone" && currentScene.screens && (
          <PhoneOverlay screens={currentScene.screens} progress={sceneProgress} />
        )}
        {nextScene && crossfade > 0 && (
          <div className="absolute inset-0 z-[5]" style={{ opacity: crossfade }}>
            <SceneBackground scene={nextScene} progress={0} />
          </div>
        )}
        <Vignette mood={currentScene.mood} />
        <FilmGrain />

        {/* Cinematic top bar */}
        <div className="absolute left-0 right-0 top-0 z-30 flex items-center justify-between px-5 pt-5">
          <span className="text-xs font-bold tracking-[0.3em] text-[#D4A017]">NEERCRED</span>
          <span className="rounded-full bg-black/40 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white/80">
            {currentScene.mood === "tension" ? "2:14 AM" : "Hope"}
          </span>
        </div>

        <DialogueBox line={activeLine} visible={!!activeLine} />

        {!started && (
          <button
            type="button"
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 text-lg font-bold text-white"
            onClick={() => setStarted(true)}
          >
            ▶ Play Film
          </button>
        )}

        <style jsx global>{`
          .film-grain {
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
            animation: grainShift 0.5s steps(4) infinite;
          }
          @keyframes grainShift {
            0% { transform: translate(0, 0); }
            25% { transform: translate(-2%, 1%); }
            50% { transform: translate(1%, -2%); }
            75% { transform: translate(-1%, 2%); }
            100% { transform: translate(0, 0); }
          }
          .dialogue-box {
            animation: dialogueIn 0.45s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          @keyframes dialogueIn {
            from { opacity: 0; transform: translateY(18px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .scene-bg {
            transition: filter 1.2s ease;
          }
          nextjs-portal, [data-next-mark], #__nextjs-build-indicator, button.fixed.bottom-6.left-6 {
            display: none !important;
          }
        `}</style>
      </div>
    </>
  );
}
