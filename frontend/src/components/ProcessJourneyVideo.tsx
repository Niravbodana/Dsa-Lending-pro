"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ScrollReveal } from "@/components/ScrollReveal";
import { IconArrowRight, IconPlay } from "@/components/icons";

const VIDEO_SRC = "/videos/neercred-process-journey.mp4";

const STEPS = [
  "Mobile + OTP verify",
  "Profile & eligibility",
  "Compare 50+ partners",
  "KYC · Bank · eSign",
  "Turant disbursal",
];

export function ProcessJourneyVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const handlePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    void el.play();
    setPlaying(true);
  };

  return (
    <section id="watch-journey" className="relative overflow-hidden bg-[#0B1220] py-20 text-white md:py-28">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-20 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_380px] lg:gap-16 xl:grid-cols-[1fr_420px]">
          <ScrollReveal variant="left">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-400/30 bg-teal-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.22em] text-teal-300">
              <span className="h-1.5 w-1.5 rounded-full bg-teal-400" />
              Watch the Journey
            </span>

            <h2 className="mt-5 text-4xl font-black leading-tight tracking-tight md:text-5xl">
              See the Full Loan Process
              <span className="mt-2 block bg-gradient-to-r from-teal-300 via-cyan-300 to-amber-300 bg-clip-text text-transparent">
                Step by Step
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-400">
              Mobile se OTP, offers compare, KYC aur disbursal — poora NeerCred experience ek premium
              walkthrough mein dekho.
            </p>

            <ul className="mt-8 space-y-3">
              {STEPS.map((step, i) => (
                <li key={step} className="flex items-center gap-3 text-sm text-slate-300 md:text-base">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-amber-400/40 bg-amber-400/10 text-xs font-bold text-amber-300">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handlePlay}
                className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-500 px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-teal-900/40 transition hover:brightness-110 active:scale-[0.98]"
              >
                <IconPlay className="h-5 w-5" />
                Watch Tutorial
              </button>
              <Link
                href="/apply"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/5 px-7 py-3.5 text-base font-semibold text-white transition hover:bg-white/10"
              >
                Start Application
                <IconArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <p className="mt-6 text-xs text-slate-500">Full workflow · Female Hindi voice · RBI LSP compliant platform</p>
          </ScrollReveal>

          <ScrollReveal variant="right" delay={120} className="mx-auto w-full max-w-[380px] lg:mx-0 lg:max-w-none">
            <div className="relative">
              <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-teal-500/30 via-transparent to-amber-400/25 blur-sm" />
              <div className="relative overflow-hidden rounded-[1.75rem] border-2 border-teal-500/50 p-1 shadow-[0_0_80px_rgba(20,184,166,0.15)]">
                <div className="rounded-[1.5rem] border border-amber-400/30 p-1">
                  <div className="relative aspect-[9/16] overflow-hidden rounded-[1.35rem] bg-black">
                    <video
                      ref={videoRef}
                      className="h-full w-full object-cover"
                      src={VIDEO_SRC}
                      controls={playing}
                      playsInline
                      preload="metadata"
                      poster="/neercred-icon.svg"
                      onPlay={() => setPlaying(true)}
                      onPause={() => setPlaying(false)}
                    />

                    {!playing && (
                      <button
                        type="button"
                        onClick={handlePlay}
                        aria-label="Play process journey video"
                        className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/35 backdrop-blur-[2px] transition hover:bg-slate-950/25"
                      >
                        <span className="flex h-20 w-20 items-center justify-center rounded-full border border-white/20 bg-white/10 shadow-2xl backdrop-blur-md transition hover:scale-105">
                          <IconPlay className="ml-1 h-9 w-9 text-white" />
                        </span>
                        <span className="mt-4 text-sm font-semibold tracking-wide text-white/90">
                          Tap to Watch
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-slate-900/90 px-4 py-1.5 text-xs font-semibold text-slate-300 shadow-xl backdrop-blur">
                Mobile · OTP · Offers · Disbursal
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
