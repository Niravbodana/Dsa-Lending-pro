#!/usr/bin/env python3
"""10s 9:16 dashcam: LEFT truck leans on a cutout; RIGHT truck slides in and supports it.

Physics lock:
  0–3.5s   LEFT truck only, tilt grows, never self-corrects, horizon stays level
  3.88–4.9s RIGHT truck cutout enters from off-screen right
  5.55–7.2s contact; LEFT returns upright only after the right truck is alongside
  7.2–10s  both upright
"""

from __future__ import annotations

import argparse
import math
import shutil
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
FRAMES = ROOT / "artifacts" / "truck-support" / "frames"
OUT = ROOT / "artifacts" / "truck-support"
DURATION = 10.0
FPS = 30

T_LEAN_END = 3.50
T_ENTER = 3.88
T_ALONGSIDE = 4.90
T_CONTACT = 5.55
T_UPRIGHT = 7.20
MAX_TILT = 22.0


def smoothstep(t: float) -> float:
    t = float(np.clip(t, 0.0, 1.0))
    return t * t * (3.0 - 2.0 * t)


def ease_in(t: float) -> float:
    t = float(np.clip(t, 0.0, 1.0))
    return t * t


def load(name: str) -> np.ndarray:
    img = cv2.imread(str(FRAMES / name), cv2.IMREAD_COLOR)
    if img is None:
        raise FileNotFoundError(FRAMES / name)
    return img


def largest_blob(mask: np.ndarray) -> np.ndarray:
    cnts, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    out = np.zeros_like(mask)
    if cnts:
        cv2.drawContours(out, [max(cnts, key=cv2.contourArea)], -1, 255, -1)
    return out


def wrap_mask(img: np.ndarray, x0_frac: float, x1_frac: float) -> np.ndarray:
    """Teal wrap + white portrait + gold + dark chassis in an x-range."""
    h, w = img.shape[:2]
    hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
    teal = cv2.inRange(hsv, (70, 30, 30), (110, 255, 230))
    white = cv2.inRange(hsv, (0, 0, 180), (180, 45, 255))
    gold = cv2.inRange(hsv, (12, 35, 70), (42, 255, 255))
    dark = cv2.inRange(img, (0, 0, 0), (75, 75, 75))
    body = cv2.bitwise_or(cv2.bitwise_or(teal, white), gold)
    yy, xx = np.ogrid[:h, :w]
    body[~((yy > int(0.03 * h)) & (yy < int(0.88 * h)) & (xx > int(x0_frac * w)) & (xx < int(x1_frac * w)))] = 0
    chassis = (
        (dark > 0)
        & (yy > int(0.54 * h))
        & (yy < int(0.87 * h))
        & (xx > int((x0_frac + 0.04) * w))
        & (xx < int((x1_frac - 0.04) * w))
    )
    mask = cv2.bitwise_or(body, chassis.astype(np.uint8) * 255)
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (17, 17))
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, k, iterations=3)
    mask = cv2.dilate(mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (11, 11)))
    mask = largest_blob(mask)
    return mask


def feather(mask: np.ndarray, px: int = 5) -> np.ndarray:
    a = cv2.GaussianBlur(mask, (0, 0), px).astype(np.float32) / 255.0
    return np.clip(a, 0.0, 1.0)


def bbox(mask: np.ndarray, pad: int = 8) -> tuple[int, int, int, int]:
    ys, xs = np.where(mask > 0)
    h, w = mask.shape
    y0 = max(0, int(ys.min()) - pad)
    y1 = min(h, int(ys.max()) + pad)
    x0 = max(0, int(xs.min()) - pad)
    x1 = min(w, int(xs.max()) + pad)
    return x0, y0, x1, y1


def rotate_sprite(
    bgr: np.ndarray, alpha: np.ndarray, angle: float, pivot: tuple[float, float]
) -> tuple[np.ndarray, np.ndarray]:
    h, w = bgr.shape[:2]
    m = cv2.getRotationMatrix2D(pivot, angle, 1.0)
    rb = cv2.warpAffine(bgr, m, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
    ra = cv2.warpAffine(alpha, m, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT)
    return rb, ra


def blit(base: np.ndarray, overlay: np.ndarray, alpha: np.ndarray, x: int = 0, y: int = 0) -> np.ndarray:
    h, w = base.shape[:2]
    oh, ow = overlay.shape[:2]
    sx0, sy0 = max(0, -x), max(0, -y)
    dx0, dy0 = max(0, x), max(0, y)
    dx1, dy1 = min(w, x + ow), min(h, y + oh)
    if dx1 <= dx0 or dy1 <= dy0:
        return base
    vw, vh = dx1 - dx0, dy1 - dy0
    sl = overlay[sy0 : sy0 + vh, sx0 : sx0 + vw].astype(np.float32)
    al = alpha[sy0 : sy0 + vh, sx0 : sx0 + vw]
    if al.ndim == 2:
        al = al[:, :, None]
    dest = base[dy0:dy1, dx0:dx1].astype(np.float32)
    out = base.copy()
    out[dy0:dy1, dx0:dx1] = (sl * al + dest * (1.0 - al)).astype(np.uint8)
    return out


def tilt_deg(t: float) -> float:
    if t <= T_LEAN_END:
        return -MAX_TILT * ease_in(t / T_LEAN_END)
    if t < T_CONTACT:
        return -MAX_TILT
    if t < T_UPRIGHT:
        return -MAX_TILT * (1.0 - smoothstep((t - T_CONTACT) / (T_UPRIGHT - T_CONTACT)))
    return 0.0


def right_dx(t: float, travel: int) -> int:
    if t <= T_ENTER:
        return travel
    if t < T_ALONGSIDE:
        u = (t - T_ENTER) / (T_ALONGSIDE - T_ENTER)
        u = 1.0 - (1.0 - u) ** 2
        return int(travel * (1.0 - u))
    return 0


def handheld(img: np.ndarray, i: int) -> np.ndarray:
    t = i / FPS
    dx = 1.4 * math.sin(t * 15.2) + 0.7 * math.sin(t * 6.4 + 0.3)
    dy = 0.9 * math.sin(t * 12.1 + 0.6) + 0.5 * math.cos(t * 5.0)
    h, w = img.shape[:2]
    m = np.array([[1.0, 0.0, dx], [0.0, 1.0, dy]], np.float32)
    return cv2.warpAffine(img, m, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)


def zoom(img: np.ndarray, t: float) -> np.ndarray:
    h, w = img.shape[:2]
    z = 1.0 + 0.04 * (t / DURATION)
    nh, nw = int(h / z), int(w / z)
    x0 = (w - nw) // 2
    y0 = int((h - nh) * 0.55)
    return cv2.resize(img[y0 : y0 + nh, x0 : x0 + nw], (w, h), interpolation=cv2.INTER_LINEAR)


def encode(seq: Path, dest: Path, width: int, height: int) -> None:
    subprocess.run(
        [
            "ffmpeg", "-y",
            "-framerate", str(FPS),
            "-i", str(seq / "frame_%04d.png"),
            "-vf", f"scale={width}:{height}:flags=lanczos,unsharp=5:5:0.35:5:5:0.0,format=yuv420p",
            "-c:v", "libx264", "-preset", "slow", "-crf", "16",
            "-profile:v", "high", "-pix_fmt", "yuv420p",
            "-movflags", "+faststart", "-t", f"{DURATION:.2f}",
            str(dest),
        ],
        check=True,
    )


def prepare() -> dict:
    left = load("f00_t0.0_start.png")
    two = load("f08_t7.5_both_upright.png")
    h, w = left.shape[:2]
    if two.shape[:2] != (h, w):
        two = cv2.resize(two, (w, h), interpolation=cv2.INTER_AREA)

    print("mask left truck", flush=True)
    left_m = wrap_mask(left, 0.08, 0.92)
    print("mask right truck", flush=True)
    right_m = wrap_mask(two, 0.48, 0.99)
    right_m[:, : int(0.47 * w)] = 0
    right_m = largest_blob(right_m)

    print("inpaint highway", flush=True)
    dil = cv2.dilate(left_m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (41, 41)))
    bg = cv2.inpaint(left, dil, 8, cv2.INPAINT_TELEA)
    dash = int(0.90 * h)
    bg[dash:] = left[dash:]

    left_a = feather(left_m, 4)
    right_a = feather(right_m, 5)
    rx0, ry0, rx1, ry1 = bbox(right_m, pad=6)
    sprite = two[ry0:ry1, rx0:rx1]
    salpha = right_a[ry0:ry1, rx0:rx1]
    # Left dual tires as pivot.
    pivot = (0.32 * w, 0.78 * h)
    travel = w - rx0 + 8
    return {
        "bg": bg,
        "left": left,
        "left_a": left_a,
        "sprite": sprite,
        "salpha": salpha,
        "park_x": rx0,
        "park_y": ry0,
        "travel": travel,
        "pivot": pivot,
        "dash": dash,
        "h": h,
        "w": w,
    }


def render_frame(t: float, a: dict) -> np.ndarray:
    frame = a["bg"].copy()
    angle = tilt_deg(t)
    rot_b, rot_a = rotate_sprite(a["left"], a["left_a"], angle, a["pivot"])
    frame = blit(frame, rot_b, rot_a, 0, 0)
    if t >= T_ENTER:
        dx = right_dx(t, a["travel"])
        frame = blit(frame, a["sprite"], a["salpha"], a["park_x"] + dx, a["park_y"])
    frame[a["dash"] :] = a["left"][a["dash"] :]
    return zoom(frame, t)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--preview", action="store_true")
    args = parser.parse_args()
    assets = prepare()

    preview_dir = OUT / "verify"
    preview_dir.mkdir(parents=True, exist_ok=True)
    if args.preview:
        for t in (0.0, 1.2, 2.4, 3.5, 4.2, 5.0, 5.6, 6.5, 7.3, 9.0, 9.9):
            img = handheld(render_frame(t, assets), int(t * FPS))
            cv2.imwrite(str(preview_dir / f"p_{int(round(t * 10)):03d}.png"), img)
            print(f"preview t={t:.1f} tilt={tilt_deg(t):.1f}", flush=True)
        return 0

    seq = OUT / "_sequence"
    if seq.exists():
        shutil.rmtree(seq)
    seq.mkdir(parents=True)
    total = int(DURATION * FPS)
    prev = None
    for i in range(total):
        t = i / FPS
        frame = handheld(render_frame(t, assets), i)
        if prev is not None:
            frame = cv2.addWeighted(frame, 0.84, prev, 0.16, 0.0)
        prev = frame
        cv2.imwrite(str(seq / f"frame_{i:04d}.png"), frame)
        if i % 30 == 0:
            print(f"render {i}/{total} t={t:.2f} tilt={tilt_deg(t):.1f}", flush=True)

    hd = OUT / "DrJeevahSetpal-truck-support-9x16-1080.mp4"
    uhd = OUT / "DrJeevahSetpal-truck-support-9x16-4K.mp4"
    print("encode 1080", flush=True)
    encode(seq, hd, 1080, 1920)
    print("encode 4K", flush=True)
    encode(seq, uhd, 2160, 3840)
    print("wrote", hd)
    print("wrote", uhd)
    return 0


if __name__ == "__main__":
    sys.exit(main())
