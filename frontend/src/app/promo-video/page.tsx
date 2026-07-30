"use client";

import { useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { BRAND } from "@/lib/brand";

const VIDEO_SRC = "/videos/neercred-promo-30s.mp4";
const FILE_NAME = "NeerCred-Promo-30s.mp4";

export default function PromoVideoPage() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleDownload = useCallback(async () => {
    try {
      const res = await fetch(VIDEO_SRC);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = FILE_NAME;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      window.open(VIDEO_SRC, "_blank");
    }
  }, []);

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#DBEAFE] via-[#F0F9FF] to-[#F8FAFC] text-[#0B1220]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-teal-400/15 blur-3xl" />
        <div className="absolute bottom-32 right-0 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-dvh max-w-md flex-col px-5 pb-8 pt-6">
        <div className="mb-5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/neercred-logo-header.svg" alt={BRAND.appName} width={148} height={42} priority />
          </Link>
          <span className="rounded-full border border-teal-600/20 bg-white/70 px-3 py-1 text-xs font-semibold text-teal-700 shadow-sm">
            30 sec · 50+ Partners
          </span>
        </div>

        <div className="mb-4 text-center">
          <h1 className="text-2xl font-bold tracking-tight">NeerCred Promo Video</h1>
          <p className="mt-2 text-sm text-slate-600">Full HD · 9:16 · Hindi voice · Light premium theme</p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-teal-600/25 bg-white shadow-[0_8px_32px_-12px_rgba(14,116,144,0.18)]">
          <video
            ref={videoRef}
            className="aspect-[9/16] w-full bg-black object-cover"
            src={VIDEO_SRC}
            controls
            playsInline
            preload="metadata"
            poster="/neercred-icon.svg"
          />
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-500 px-6 py-4 text-lg font-bold text-white shadow-lg shadow-teal-900/40 transition hover:brightness-110 active:scale-[0.98]"
        >
          <DownloadIcon />
          Download Full Video
        </button>

        <a
          href={VIDEO_SRC}
          download={FILE_NAME}
          className="mt-3 flex w-full items-center justify-center rounded-2xl border border-amber-400/40 bg-amber-400/10 px-6 py-3.5 text-base font-semibold text-amber-200 transition hover:bg-amber-400/15"
        >
          Direct Save (Android)
        </a>

        <div className="mt-5 rounded-2xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600 shadow-sm">
          <p className="font-semibold text-[#0B1220]">iPhone par save kaise karein?</p>
          <p className="mt-2 leading-relaxed">
            Video play karo, phir share icon dabao ya video par long-press karke &quot;Save Video&quot; choose karo.
          </p>
        </div>

        <p className="mt-auto pt-6 text-center text-xs text-slate-500">
          {BRAND.rbiNote} · {BRAND.tagline}
        </p>
      </div>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3v12m0 0l4-4m-4 4l-4-4M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
