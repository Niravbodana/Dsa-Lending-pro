#!/usr/bin/env python3
"""NeerCred cinematic branding video — 12s 9:16.

Physics lock (rear dashcam, viewer coordinates):
  OpenCV NEGATIVE rotation drops the viewer's RIGHT roof (clockwise on screen).
  Pivot = lower-right tires, so the left wheels lift and the right tires stay planted.
  The black truck never self-corrects. It only returns upright after NeerCred
  arrives on the RIGHT and braces the falling right flank.

Story:
  0–3.5s   YOUR FINANCIAL CONDITIONS truck, alone, falls to the RIGHT
  3.5–6.5s NeerCred truck enters from the right and physically supports it
  6.5–8.2s both drive upright
  8.2–12s  exact NeerCred brand page (pixel-locked, never regenerated)
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
PLATES = ROOT / "artifacts" / "truck-support" / "frames-v3"
BRAND = ROOT / "artifacts" / "truck-support" / "brand" / "neercred-brand-page.png"
OUT = ROOT / "artifacts" / "truck-support"

DURATION = 12.0
FPS = 30
W, H = 1080, 1920
MAX_TILT = 17.5  # magnitude in degrees
# OpenCV getRotationMatrix2D: NEGATIVE angle drops the viewer's RIGHT roof
# (verified by transforming the cargo-box top corners). Do not invert.


def load_bgr(path: Path) -> np.ndarray:
    img = cv2.imread(str(path), cv2.IMREAD_COLOR)
    if img is None:
        raise FileNotFoundError(path)
    if img.shape[1] != W or img.shape[0] != H:
        img = cv2.resize(img, (W, H), interpolation=cv2.INTER_AREA)
    return img


def load_rgba(path: Path) -> np.ndarray:
    img = cv2.imread(str(path), cv2.IMREAD_UNCHANGED)
    if img is None:
        raise FileNotFoundError(path)
    if img.shape[2] == 3:
        a = np.full(img.shape[:2], 255, np.uint8)
        img = np.dstack([img, a])
    if img.shape[1] != W or img.shape[0] != H:
        img = cv2.resize(img, (W, H), interpolation=cv2.INTER_AREA)
    return img


def smooth(t: float) -> float:
    t = float(np.clip(t, 0.0, 1.0))
    return t * t * (3.0 - 2.0 * t)


def ease_in(t: float) -> float:
    t = float(np.clip(t, 0.0, 1.0))
    return t * t * t


def lerp(a: np.ndarray, b: np.ndarray, t: float) -> np.ndarray:
    t = float(np.clip(t, 0.0, 1.0))
    return cv2.addWeighted(a, 1.0 - t, b, t, 0.0)


def kenburns(img: np.ndarray, t: float, z0: float = 1.0, z1: float = 1.07, bias: float = 0.56) -> np.ndarray:
    h, w = img.shape[:2]
    z = z0 + (z1 - z0) * t
    nh, nw = int(h / z), int(w / z)
    x0 = (w - nw) // 2
    y0 = int((h - nh) * bias)
    crop = img[y0 : y0 + nh, x0 : x0 + nw]
    return cv2.resize(crop, (w, h), interpolation=cv2.INTER_LINEAR)


def handheld(img: np.ndarray, i: int, amount: float) -> np.ndarray:
    if amount <= 0:
        return img
    t = i / FPS
    dx = amount * (1.15 * math.sin(t * 13.7) + 0.55 * math.sin(t * 5.8))
    dy = amount * (0.85 * math.sin(t * 11.1 + 0.35) + 0.35 * math.cos(t * 4.7))
    h, w = img.shape[:2]
    m = np.array([[1.0, 0.0, dx], [0.0, 1.0, dy]], np.float32)
    return cv2.warpAffine(img, m, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)


def rotate_rgba(rgba: np.ndarray, angle: float, pivot: tuple[float, float]) -> np.ndarray:
    h, w = rgba.shape[:2]
    m = cv2.getRotationMatrix2D(pivot, float(angle), 1.0)
    bgr = cv2.warpAffine(rgba[:, :, :3], m, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
    a = cv2.warpAffine(rgba[:, :, 3], m, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
    return np.dstack([bgr, a])


def over(bg: np.ndarray, rgba: np.ndarray, shadow: bool, angle: float) -> np.ndarray:
    a = rgba[:, :, 3].astype(np.float32) / 255.0
    out = bg.astype(np.float32)
    if shadow:
        sh = cv2.GaussianBlur(rgba[:, :, 3], (0, 0), 26)
        # Clockwise / right-down: contact shadow slides to the viewer's right.
        dx = 6.0 + 32.0 * (abs(angle) / MAX_TILT)
        dy = 10.0 + 6.0 * (abs(angle) / MAX_TILT)
        m = np.array([[1.0, 0.0, dx], [0.0, 1.0, dy]], np.float32)
        sh = cv2.warpAffine(sh, m, (bg.shape[1], bg.shape[0]), borderMode=cv2.BORDER_CONSTANT)
        s = (sh.astype(np.float32) / 255.0) * (0.28 + 0.22 * (abs(angle) / MAX_TILT))
        out *= 1.0 - s[:, :, None]
    out = rgba[:, :, :3] * a[:, :, None] + out * (1.0 - a[:, :, None])
    return np.clip(out, 0, 255).astype(np.uint8)


def directional_blur(img: np.ndarray, amount: float) -> np.ndarray:
    """Soft horizontal smear — clockwise fall reads as rightward motion."""
    k = int(amount)
    if k < 3:
        return img
    if k % 2 == 0:
        k += 1
    kernel = np.zeros((1, k), np.float32)
    kernel[0, :] = np.hanning(k)
    kernel /= kernel.sum()
    return cv2.filter2D(img, -1, kernel)


def dust_right(img: np.ndarray, amount: float, seed: int, cx: int, cy: int) -> np.ndarray:
    if amount <= 0.02:
        return img
    rng = np.random.default_rng(seed)
    overlay = img.copy()
    n = int(18 + 70 * amount)
    h, w = img.shape[:2]
    for _ in range(n):
        x = int(np.clip(cx + rng.normal(18, 42), 0, w - 1))
        y = int(np.clip(cy + rng.normal(0, 28), 0, h - 1))
        r = int(max(1, rng.integers(1, 5)))
        alpha = float(0.04 + 0.10 * amount * rng.random())
        cv2.circle(overlay, (x, y), r, (170, 175, 180), -1, cv2.LINE_AA)
        img = cv2.addWeighted(overlay, alpha, img, 1.0 - alpha, 0)
        overlay = img.copy()
    return img


def cine_grade(img: np.ndarray, grain_seed: int, grain_amp: float = 1.0) -> np.ndarray:
    x = img.astype(np.float32) / 255.0
    # Contrast + slight S-curve
    x = np.clip((x - 0.5) * 1.07 + 0.5, 0, 1)
    luma = x.mean(axis=2, keepdims=True)
    shadows = np.clip(1.0 - luma * 2.2, 0, 1)
    highlights = np.clip((luma - 0.55) * 2.0, 0, 1)
    # Teal shadows, warm highlights
    x[:, :, 0] = np.clip(x[:, :, 0] + 0.025 * shadows[:, :, 0], 0, 1)  # B
    x[:, :, 1] = np.clip(x[:, :, 1] + 0.008 * shadows[:, :, 0], 0, 1)
    x[:, :, 2] = np.clip(x[:, :, 2] - 0.015 * shadows[:, :, 0], 0, 1)  # R
    x[:, :, 2] = np.clip(x[:, :, 2] + 0.03 * highlights[:, :, 0], 0, 1)
    x[:, :, 1] = np.clip(x[:, :, 1] + 0.01 * highlights[:, :, 0], 0, 1)
    # Vignette
    h, w = img.shape[:2]
    yy, xx = np.ogrid[:h, :w]
    cy, cx = (h - 1) / 2.0, (w - 1) / 2.0
    r = np.sqrt(((yy - cy) / cy) ** 2 + ((xx - cx) / cx) ** 2)
    vig = np.clip(1.0 - 0.18 * np.clip(r - 0.35, 0, None) ** 1.4, 0.72, 1.0)
    x *= vig[:, :, None]
    out = np.clip(x * 255.0, 0, 255)
    rng = np.random.default_rng(grain_seed)
    grain = rng.normal(0.0, 1.15 * grain_amp, (h, w, 1))
    out = np.clip(out + grain, 0, 255).astype(np.uint8)
    return out


def find_pivot(rgba: np.ndarray) -> tuple[float, float]:
    ys, xs = np.where(rgba[:, :, 3] > 30)
    if len(xs) == 0:
        return (W * 0.62, H * 0.62)
    # Lower-right of the cargo box / dual tires — stays planted on clockwise roll.
    return (float(np.percentile(xs, 80)), float(np.percentile(ys, 91)))


def tilt_at(t: float) -> float:
    """Signed OpenCV angle. Negative = viewer's right side down. Never self-corrects until support."""
    sign = -1.0
    if t < 0.50:
        return 0.0
    if t < 3.45:
        u = (t - 0.50) / 2.95
        # Mix linear + quad so the right-lean is visible well before peak.
        mag = MAX_TILT * (0.28 * u + 0.72 * u * u)
        return sign * mag
    if t < 5.55:
        return sign * MAX_TILT
    if t < 7.15:
        return sign * MAX_TILT * (1.0 - smooth((t - 5.55) / 1.60))
    return 0.0


def segment_at(t: float) -> tuple[str, float]:
    beats = [
        (0.00, 0.55, "establish"),
        (0.55, 3.50, "fall_right"),
        (3.50, 7.20, "support_in"),
        (7.20, 8.15, "together"),
        (8.15, 8.95, "xfade_brand"),
        (8.95, 12.00, "brand"),
    ]
    for a, b, name in beats:
        if t < b or name == "brand":
            return name, (t - a) / max(1e-6, b - a)
    return "brand", 1.0


def encode(seq: Path, dest: Path) -> None:
    """H.264 Main + silent AAC so iPhone / QuickTime / WhatsApp will open the file."""
    dest.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-framerate",
            str(FPS),
            "-i",
            str(seq / "frame_%04d.png"),
            "-f",
            "lavfi",
            "-i",
            "anullsrc=channel_layout=stereo:sample_rate=44100",
            "-vf",
            "unsharp=5:5:0.35:5:5:0.0,format=yuv420p",
            "-c:v",
            "libx264",
            "-preset",
            "slow",
            "-crf",
            "20",
            "-profile:v",
            "main",
            "-level",
            "4.1",
            "-pix_fmt",
            "yuv420p",
            "-c:a",
            "aac",
            "-b:a",
            "96k",
            "-shortest",
            "-movflags",
            "+faststart",
            "-t",
            f"{DURATION:.2f}",
            str(dest),
        ],
        check=True,
    )


def neer_slide(t: float) -> float:
    """0 = fully off-screen right, 1 = braced alongside the falling truck."""
    if t < 3.50:
        return 0.0
    if t < 4.85:
        return smooth((t - 3.50) / 1.35)
    return 1.0


def shift_rgba(rgba: np.ndarray, dx: float, dy: float = 0.0) -> np.ndarray:
    h, w = rgba.shape[:2]
    m = np.array([[1.0, 0.0, dx], [0.0, 1.0, dy]], np.float32)
    bgr = cv2.warpAffine(rgba[:, :, :3], m, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
    a = cv2.warpAffine(rgba[:, :, 3], m, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
    return np.dstack([bgr, a])


def falling_composite(
    bg: np.ndarray,
    truck: np.ndarray,
    neer: np.ndarray,
    pivot: tuple[float, float],
    t: float,
    i: int,
) -> np.ndarray:
    angle = tilt_at(t)
    k = abs(angle) / MAX_TILT
    settle = np.array([[1.0, 0.0, 5.0 * k], [0.0, 1.0, 8.0 * k]], np.float32)
    bg_shift = cv2.warpAffine(bg, settle, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)

    # NeerCred slides in from the RIGHT on the same locked camera, wheels on the road.
    slide = neer_slide(t)
    frame = bg_shift
    if slide > 0.01:
        # At slide=0 the truck is ~420px off the right edge; at 1 it sits in its native lane.
        dx = (1.0 - slide) * 430.0
        nrgba = shift_rgba(neer, dx, 18.0)
        frame = over(frame, nrgba, shadow=True, angle=0.0)

    rgba = rotate_rgba(truck, angle, pivot)
    frame = over(frame, rgba, shadow=True, angle=angle)
    cx = int(pivot[0] + 24 + 48 * k)
    cy = int(pivot[1] + 10)
    frame = dust_right(frame, amount=k * (1.0 - 0.6 * slide), seed=i * 17 + 3, cx=cx, cy=cy)
    dtilt = abs(tilt_at(min(t + 1.0 / FPS, DURATION)) - angle)
    frame = directional_blur(frame, 3 + 10 * (dtilt / 0.8))
    # Continuous dashcam push-in across the whole action, not a still hold.
    u = min(1.0, t / 7.20)
    frame = kenburns(frame, u, 1.0, 1.07, 0.56)
    return frame


def main() -> int:
    bg = load_bgr(PLATES / "bg_empty_highway.png")
    truck = load_rgba(PLATES / "mattes" / "falling_truck_rgba.png")
    neer = load_rgba(PLATES / "mattes" / "neercred_truck_rgba.png")
    truck[int(0.84 * H) :, :, 3] = 0
    neer[int(0.84 * H) :, :, 3] = 0
    upright = load_bgr(PLATES / "f08_both_upright.png")
    brand = load_bgr(BRAND)
    photoreal_start = load_bgr(PLATES / "f00_upright.png")
    pivot = find_pivot(truck)
    print(f"pivot={pivot} (lower-right tires; negative OpenCV angle = right-side-down)", flush=True)

    seq = OUT / "_sequence"
    if seq.exists():
        shutil.rmtree(seq)
    seq.mkdir(parents=True)

    total = int(DURATION * FPS)
    for i in range(total):
        t = i / FPS
        seg, u = segment_at(min(t, DURATION - 1e-4))
        shake = 1.15

        if seg == "establish":
            a = kenburns(photoreal_start, u, 1.0, 1.02, 0.56)
            b = falling_composite(bg, truck, neer, pivot, t, i)
            frame = lerp(a, b, smooth(u))
        elif seg in ("fall_right", "support_in"):
            frame = falling_composite(bg, truck, neer, pivot, t, i)
            shake = 1.15 + 0.5 * (abs(tilt_at(t)) / MAX_TILT)
        elif seg == "together":
            a = falling_composite(bg, truck, neer, pivot, t, i)
            b = kenburns(upright, u, 1.0, 1.04, 0.52)
            frame = lerp(a, b, smooth(u))
            shake = 1.0 - 0.4 * smooth(u)
        elif seg == "xfade_brand":
            a = kenburns(upright, 1.0, 1.04, 1.04, 0.52)
            b = kenburns(brand, 0.0, 1.0, 1.02, 0.50)
            frame = lerp(a, b, smooth(u))
            shake = 1.0 - smooth(u)
        else:
            frame = kenburns(brand, u, 1.0, 1.055, 0.48)
            shake = 0.0

        if frame.shape[1] != W or frame.shape[0] != H:
            frame = cv2.resize(frame, (W, H), interpolation=cv2.INTER_LINEAR)
        frame = handheld(frame, i, shake)
        grain = 0.55 if seg == "brand" else 1.0
        frame = cine_grade(frame, grain_seed=1000 + i, grain_amp=grain)
        cv2.imwrite(str(seq / f"frame_{i:04d}.png"), frame)
        if i % 30 == 0:
            print(f"render {i}/{total} t={t:.2f} {seg} tilt={tilt_at(t):.1f}", flush=True)

    hd = OUT / "NeerCred-truck-support-9x16.mp4"
    uhd = OUT / "NeerCred-truck-support-9x16-4K.mp4"
    print("encode 1080", flush=True)
    encode(seq, hd)
    print("encode 4K", flush=True)
    subprocess.run(
        [
            "ffmpeg",
            "-y",
            "-i",
            str(hd),
            "-vf",
            "scale=2160:3840:flags=lanczos,unsharp=5:5:0.25:5:5:0.0,format=yuv420p",
            "-c:v",
            "libx264",
            "-preset",
            "slow",
            "-crf",
            "21",
            "-profile:v",
            "main",
            "-c:a",
            "aac",
            "-b:a",
            "96k",
            "-movflags",
            "+faststart",
            str(uhd),
        ],
        check=True,
    )
    print("wrote", hd)
    print("wrote", uhd)
    return 0


if __name__ == "__main__":
    sys.exit(main())
