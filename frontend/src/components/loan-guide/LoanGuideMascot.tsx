"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  greetingLine,
  pickHint,
  type ApplyGuideStep,
  type GuideField,
} from "@/components/loan-guide/loanGuideMessages";

export type LoanGuideMascotProps = {
  step: ApplyGuideStep;
  activeField: GuideField;
  /** When true, mascot slides in (mobile step start) */
  show: boolean;
  /** inline = beside form card (mobile); floating = fixed corner */
  variant?: "inline" | "floating";
};

type MascotMode = "enter" | "guide" | "point" | "fill" | "ouch" | "recover";

const FILL_FIELDS = new Set<GuideField>(["pan", "mobile", "otp", "full_name", "city"]);

export function LoanGuideMascot({ step, activeField, show, variant = "floating" }: LoanGuideMascotProps) {
  const [mode, setMode] = useState<MascotMode>("enter");
  const [hintIndex, setHintIndex] = useState(0);
  const [ouchText, setOuchText] = useState("Ouch! 😣");
  const [showGreeting, setShowGreeting] = useState(true);

  const isFillPose = activeField && FILL_FIELDS.has(activeField) && mode === "guide";

  useEffect(() => {
    if (!show) return;
    setMode("enter");
    setShowGreeting(true);
    const t = setTimeout(() => setMode("guide"), 900);
    return () => clearTimeout(t);
  }, [show, step]);

  useEffect(() => {
    setHintIndex(0);
  }, [step, activeField]);

  useEffect(() => {
    if (mode !== "guide" && mode !== "point" && mode !== "fill") return;
    const id = setInterval(() => setHintIndex((i) => i + 1), 4500);
    return () => clearInterval(id);
  }, [mode, step, activeField]);

  useEffect(() => {
    if (!activeField) return;
    if (FILL_FIELDS.has(activeField)) {
      setMode("fill");
      const t = setTimeout(() => setMode("guide"), 2200);
      return () => clearTimeout(t);
    }
    setMode("point");
    const t = setTimeout(() => setMode("guide"), 1400);
    return () => clearTimeout(t);
  }, [activeField]);

  const bubbleText = useMemo(() => {
    if (mode === "ouch") return ouchText;
    if (mode === "recover") return "Theek ho gaya! Chaliye aage badhte hain 😊";
    if (showGreeting && step === "mobile" && hintIndex === 0) {
      return `${greetingLine()}\n${pickHint(step, activeField, 0)}`;
    }
    return pickHint(step, activeField, hintIndex);
  }, [mode, ouchText, showGreeting, step, activeField, hintIndex]);

  const handleTap = useCallback(() => {
    if (mode === "ouch" || mode === "recover") return;
    const lines = ["Ouch! 😣", "Arre! Dhire dabaiye na!", "Uff! Pet dukh gaya…", "Aah! Thoda soft touch 😅"];
    setOuchText(lines[Math.floor(Math.random() * lines.length)]);
    setMode("ouch");
    setTimeout(() => setMode("recover"), 1200);
    setTimeout(() => {
      setMode("guide");
      setShowGreeting(false);
    }, 2200);
  }, [mode]);

  if (!show) return null;

  const poseClass =
    mode === "ouch" || mode === "recover"
      ? "loan-guide-mascot--ouch"
      : mode === "fill" || isFillPose
        ? "loan-guide-mascot--fill"
        : mode === "point"
          ? "loan-guide-mascot--point"
          : mode === "enter"
            ? "loan-guide-mascot--enter"
            : "loan-guide-mascot--guide";

  const isInline = variant === "inline";
  const rootClass = isInline
    ? "loan-guide-root loan-guide-root--inline pointer-events-none relative shrink-0"
    : "loan-guide-root pointer-events-none fixed inset-x-0 bottom-4 z-40 flex justify-end px-3 sm:bottom-6 sm:px-6";

  return (
    <div className={rootClass}>
      <div className={`loan-guide-wrap pointer-events-auto ${poseClass} ${isInline ? "loan-guide-wrap--inline" : ""}`}>
        {/* Cloud thought bubble */}
        <div className={`loan-guide-bubble ${isInline ? "loan-guide-bubble--inline" : ""}`} role="status" aria-live="polite">
          <div className="loan-guide-bubble-cloud">
            <p className={`whitespace-pre-line font-semibold leading-snug text-slate-800 ${isInline ? "text-[9px] leading-tight" : "text-sm"}`}>
              {bubbleText}
            </p>
          </div>
          <div className="loan-guide-bubble-tail" />
          {!isInline && (
            <>
              <div className="loan-guide-bubble-puff loan-guide-bubble-puff--1" />
              <div className="loan-guide-bubble-puff loan-guide-bubble-puff--2" />
            </>
          )}
        </div>

        <button
          type="button"
          onClick={handleTap}
          className="loan-guide-character"
          aria-label="Neera — your financial guide"
        >
          <svg
            viewBox="0 0 200 240"
            className={isInline ? "h-[46px] w-[38px]" : "h-[140px] w-[116px] sm:h-[168px] sm:w-[140px]"}
            aria-hidden
          >
            <defs>
              <linearGradient id="buddyBody" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#5eead4" />
                <stop offset="55%" stopColor="#0f766e" />
                <stop offset="100%" stopColor="#0d9488" />
              </linearGradient>
              <linearGradient id="buddyFace" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#e0f2fe" />
              </linearGradient>
              <filter id="buddyShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#0f766e" floodOpacity="0.35" />
              </filter>
            </defs>

            {/* Ground shadow */}
            <ellipse cx="100" cy="228" rx="52" ry="10" fill="#0f766e" opacity="0.18" />

            {/* Legs (sitting when ouch) */}
            <g className="loan-guide-legs">
              <ellipse cx="72" cy="210" rx="18" ry="22" fill="#0d9488" />
              <ellipse cx="128" cy="210" rx="18" ry="22" fill="#0d9488" />
            </g>

            {/* Body — 3D pill */}
            <g filter="url(#buddyShadow)">
              <ellipse cx="100" cy="138" rx="58" ry="64" fill="url(#buddyBody)" />
              <ellipse cx="88" cy="118" rx="22" ry="28" fill="white" opacity="0.22" />
              <path
                d="M55 138 Q100 175 145 138"
                fill="none"
                stroke="#065f46"
                strokeWidth="3"
                strokeLinecap="round"
                opacity="0.35"
              />
            </g>

            {/* Arm — points / fills */}
            <g className="loan-guide-arm">
              <ellipse cx="158" cy="128" rx="14" ry="11" fill="#fde68a" stroke="#d97706" strokeWidth="2" />
              <path
                d="M132 118 C148 108 158 100 168 92"
                stroke="#fde68a"
                strokeWidth="14"
                strokeLinecap="round"
                fill="none"
              />
              {/* pencil for fill mode */}
              <g className="loan-guide-pencil">
                <rect x="162" y="78" width="6" height="22" rx="2" fill="#f59e0b" transform="rotate(-25 165 89)" />
                <polygon points="160,76 168,76 164,68" fill="#1e293b" transform="rotate(-25 164 72)" />
              </g>
            </g>

            {/* Belly hands when ouch */}
            <g className="loan-guide-belly-hands">
              <ellipse cx="78" cy="152" rx="12" ry="10" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
              <ellipse cx="122" cy="152" rx="12" ry="10" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
            </g>

            {/* Head */}
            <g filter="url(#buddyShadow)">
              <circle cx="100" cy="72" r="46" fill="url(#buddyFace)" stroke="#0f766e" strokeWidth="3" />
              <ellipse cx="82" cy="58" rx="10" ry="12" fill="white" opacity="0.5" />
            </g>

            {/* Eyes */}
            <g className="loan-guide-eyes">
              <ellipse cx="84" cy="74" rx="9" ry="11" fill="#0f172a" />
              <ellipse cx="116" cy="74" rx="9" ry="11" fill="#0f172a" />
              <circle cx="87" cy="70" r="3" fill="white" />
              <circle cx="119" cy="70" r="3" fill="white" />
            </g>

            {/* Ouch eyes */}
            <g className="loan-guide-eyes-ouch">
              <path d="M76 72 Q84 66 92 72" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M108 72 Q116 66 124 72" stroke="#0f172a" strokeWidth="3" fill="none" strokeLinecap="round" />
            </g>

            {/* Mouth */}
            <path
              className="loan-guide-mouth-smile"
              d="M88 92 Q100 102 112 92"
              stroke="#0f766e"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />
            <path
              className="loan-guide-mouth-ouch"
              d="M92 96 Q100 88 108 96"
              stroke="#0f766e"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
            />

            {/* Neer cap */}
            <path d="M58 52 Q100 28 142 52 L136 62 Q100 48 64 62 Z" fill="#0b1220" />
            <ellipse cx="100" cy="52" rx="42" ry="10" fill="#0f766e" />
            <text x="100" y="56" textAnchor="middle" fill="#fde68a" fontSize="9" fontWeight="bold">
              NEER
            </text>
          </svg>
        </button>
      </div>
    </div>
  );
}
