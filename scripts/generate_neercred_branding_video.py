#!/usr/bin/env python3
"""NeerCred branding video — 12s 9:16.

Story:
  0–3.5s  "YOUR FINANCIAL CONDITIONS" truck leans to its RIGHT. Alone.
  4–6.5s  NeerCred truck enters from the right and supports it.
  6.5–8s  both upright, driving on.
  8–12s   exact NeerCred brand page (no generated text).
"""

from __future__ import annotations

import math
import shutil
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
PLATES = ROOT / "artifacts" / "truck-support" / "frames-v2"
BRAND = ROOT / "artifacts" / "truck-support" / "brand" / "neercred-brand-page.png"
OUT = ROOT / "artifacts" / "truck-support"
DURATION = 12.0
FPS = 30
W, H = 1080, 1920


def load_fit(path: Path) -> np.ndarray:
    img = cv2.imread(str(path), cv2.IMREAD_COLOR)
    if img is None:
        raise FileNotFoundError(path)
    if img.shape[1] != W or img.shape[0] != H:
        img = cv2.resize(img, (W, H), interpolation=cv2.INTER_AREA)
    return img


def lerp(a: np.ndarray, b: np.ndarray, t: float) -> np.ndarray:
    t = float(np.clip(t, 0.0, 1.0))
    return cv2.addWeighted(a, 1.0 - t, b, t, 0.0)


def smooth(t: float) -> float:
    t = float(np.clip(t, 0.0, 1.0))
    return t * t * (3.0 - 2.0 * t)


def kenburns(img: np.ndarray, t: float, z0: float = 1.0, z1: float = 1.06, bias: float = 0.55) -> np.ndarray:
    h, w = img.shape[:2]
    z = z0 + (z1 - z0) * t
    nh, nw = int(h / z), int(w / z)
    x0 = (w - nw) // 2
    y0 = int((h - nh) * bias)
    crop = img[y0 : y0 + nh, x0 : x0 + nw]
    return cv2.resize(crop, (w, h), interpolation=cv2.INTER_LINEAR)


def handheld(img: np.ndarray, i: int, amount: float = 1.0) -> np.ndarray:
    if amount <= 0:
        return img
    t = i / FPS
    dx = amount * (1.3 * math.sin(t * 14.6) + 0.6 * math.sin(t * 6.2))
    dy = amount * (0.9 * math.sin(t * 11.8 + 0.4) + 0.4 * math.cos(t * 5.1))
    h, w = img.shape[:2]
    m = np.array([[1.0, 0.0, dx], [0.0, 1.0, dy]], np.float32)
    return cv2.warpAffine(img, m, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)


def segment_at(t: float) -> tuple[str, float]:
    """Return (segment_id, local 0–1)."""
    beats = [
        (0.00, 1.35, "establish"),
        (1.35, 1.75, "xfade_peak"),
        (1.75, 3.70, "hold_peak"),
        (3.70, 4.35, "xfade_enter"),
        (4.35, 6.45, "support"),
        (6.45, 7.35, "xfade_upright"),
        (7.35, 8.20, "together"),
        (8.20, 8.95, "xfade_brand"),
        (8.95, 12.00, "brand"),
    ]
    for a, b, name in beats:
        if t < b or name == "brand":
            return name, (t - a) / max(1e-6, b - a)
    return "brand", 1.0


def encode(seq: Path, dest: Path) -> None:
    dest.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            "ffmpeg", "-y",
            "-framerate", str(FPS),
            "-i", str(seq / "frame_%04d.png"),
            "-vf", "unsharp=5:5:0.3:5:5:0.0,format=yuv420p",
            "-c:v", "libx264", "-preset", "slow", "-crf", "16",
            "-profile:v", "high", "-pix_fmt", "yuv420p",
            "-movflags", "+faststart",
            "-t", f"{DURATION:.2f}",
            str(dest),
        ],
        check=True,
    )


def main() -> int:
    falling0 = load_fit(PLATES / "f00_falling_start.png")
    peak = load_fit(PLATES / "f03_peak_right.png")
    enters = load_fit(PLATES / "f04_neercred_enters.png")
    upright = load_fit(PLATES / "f08_both_upright.png")
    brand = load_fit(BRAND)

    seq = OUT / "_sequence"
    if seq.exists():
        shutil.rmtree(seq)
    seq.mkdir(parents=True)

    total = int(DURATION * FPS)
    for i in range(total):
        t = i / FPS
        seg, u = segment_at(min(t, DURATION - 1e-4))
        shake = 1.0

        if seg == "establish":
            frame = kenburns(falling0, u, 1.0, 1.04, 0.58)
        elif seg == "xfade_peak":
            a = kenburns(falling0, 1.0, 1.04, 1.04, 0.58)
            b = kenburns(peak, 0.0, 1.02, 1.03, 0.58)
            frame = lerp(a, b, smooth(u))
        elif seg == "hold_peak":
            frame = kenburns(peak, u, 1.02, 1.05, 0.58)
        elif seg == "xfade_enter":
            a = kenburns(peak, 0.55, 1.05, 1.05, 0.58)
            b = kenburns(enters, 0.0, 1.0, 1.02, 0.55)
            frame = lerp(a, b, smooth(u))
        elif seg == "support":
            frame = kenburns(enters, u, 1.0, 1.045, 0.54)
        elif seg == "xfade_upright":
            a = kenburns(enters, 1.0, 1.045, 1.045, 0.54)
            b = kenburns(upright, 0.0, 1.0, 1.02, 0.52)
            frame = lerp(a, b, smooth(u))
        elif seg == "together":
            frame = kenburns(upright, u, 1.0, 1.03, 0.52)
        elif seg == "xfade_brand":
            a = kenburns(upright, 1.0, 1.03, 1.03, 0.52)
            b = kenburns(brand, 0.0, 1.0, 1.02, 0.50)
            frame = lerp(a, b, smooth(u))
            shake = 1.0 - smooth(u)
        else:
            frame = kenburns(brand, u, 1.0, 1.05, 0.48)
            shake = 0.0

        frame = handheld(frame, i, shake)
        cv2.imwrite(str(seq / f"frame_{i:04d}.png"), frame)
        if i % 30 == 0:
            print(f"render {i}/{total} t={t:.2f} {seg}", flush=True)

    hd = OUT / "NeerCred-truck-support-9x16.mp4"
    uhd = OUT / "NeerCred-truck-support-9x16-4K.mp4"
    print("encode 1080", flush=True)
    encode(seq, hd)
    print("encode 4K", flush=True)
    subprocess.run(
        [
            "ffmpeg", "-y", "-i", str(hd),
            "-vf", "scale=2160:3840:flags=lanczos,unsharp=5:5:0.25:5:5:0.0,format=yuv420p",
            "-c:v", "libx264", "-preset", "slow", "-crf", "17",
            "-movflags", "+faststart",
            str(uhd),
        ],
        check=True,
    )
    print("wrote", hd)
    print("wrote", uhd)
    return 0


if __name__ == "__main__":
    sys.exit(main())
