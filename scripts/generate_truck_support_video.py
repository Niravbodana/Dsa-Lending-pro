#!/usr/bin/env python3
"""Assemble a continuous 10s 9:16 dashcam video from locked truck keyframes.

Story beats (physics locked in the keyframe timestamps):
  0.0–3.5s  only the LEFT truck, lean grows, no right truck
  4.0–7.0s  RIGHT truck enters, contacts, supports; LEFT recovers only from contact
  7.0–10.s  both upright, driving side by side
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
FRAMES_DIR = ROOT / "artifacts" / "truck-support" / "frames"
OUT_DIR = ROOT / "artifacts" / "truck-support"
DURATION = 10.0
FPS = 30

# Timestamp (seconds) → keyframe filename. Times enforce the physics story.
KEYFRAMES: list[tuple[float, str]] = [
    (0.00, "f00_t0.0_start.png"),
    (0.90, "f01_t0.8_lean12.png"),
    (2.20, "f02_t2.2_lean30.png"),
    (3.50, "f03_t3.5_max_tilt.png"),
    (4.25, "f04_t4.3_right_enters.png"),
    (5.15, "f05_t5.2_closing.png"),
    (5.85, "f06_t5.8_contact.png"),
    (6.65, "f07_t6.6_support.png"),
    (7.45, "f08_t7.5_both_upright.png"),
    (10.00, "f09_t9.0_together.png"),
]

# Pairs where the right truck should appear as a right-edge slide, not a cross-dissolve.
ENTRANCE_PAIRS = {("f03_t3.5_max_tilt.png", "f04_t4.3_right_enters.png")}


def smoothstep(t: float) -> float:
    t = float(np.clip(t, 0.0, 1.0))
    return t * t * (3.0 - 2.0 * t)


def load_bgr(path: Path) -> np.ndarray:
    img = cv2.imread(str(path), cv2.IMREAD_COLOR)
    if img is None:
        raise FileNotFoundError(path)
    return img


def farneback(a_gray: np.ndarray, b_gray: np.ndarray) -> np.ndarray:
    return cv2.calcOpticalFlowFarneback(
        a_gray,
        b_gray,
        None,
        pyr_scale=0.5,
        levels=5,
        winsize=28,
        iterations=3,
        poly_n=7,
        poly_sigma=1.5,
        flags=0,
    )


def remap_with_flow(img: np.ndarray, flow: np.ndarray, scale: float) -> np.ndarray:
    h, w = img.shape[:2]
    grid_x, grid_y = np.meshgrid(np.arange(w, dtype=np.float32), np.arange(h, dtype=np.float32))
    map_x = grid_x + flow[:, :, 0] * scale
    map_y = grid_y + flow[:, :, 1] * scale
    return cv2.remap(
        img,
        map_x,
        map_y,
        interpolation=cv2.INTER_LINEAR,
        borderMode=cv2.BORDER_REPLICATE,
    )


def right_edge_slide(base: np.ndarray, incoming: np.ndarray, t: float) -> np.ndarray:
    """Reveal `incoming` from the right so the second truck enters, it does not pop."""
    h, w = base.shape[:2]
    split = w * (1.0 - 0.78 * smoothstep(t))
    feather = max(18.0, 0.10 * w)
    xs = np.linspace(0, w - 1, w, dtype=np.float32)
    mask = np.clip((xs - (split - feather)) / (2.0 * feather), 0.0, 1.0)
    mask = np.tile(mask, (h, 1))[:, :, None]
    return (base.astype(np.float32) * (1.0 - mask) + incoming.astype(np.float32) * mask).astype(
        np.uint8
    )


def morph_pair(
    img_a: np.ndarray,
    img_b: np.ndarray,
    flow_ab: np.ndarray,
    flow_ba: np.ndarray,
    t: float,
    slide_in: bool,
) -> np.ndarray:
    t_e = smoothstep(t)
    warped_a = remap_with_flow(img_a, flow_ab, t_e)
    warped_b = remap_with_flow(img_b, flow_ba, 1.0 - t_e)
    blended = cv2.addWeighted(warped_a, 1.0 - t_e, warped_b, t_e, 0.0)
    if slide_in:
        return right_edge_slide(warped_a, blended, t_e)
    return blended


def handheld_offset(frame_index: int, fps: float) -> tuple[float, float]:
    t = frame_index / fps
    dx = 1.8 * math.sin(t * 15.1) + 1.0 * math.sin(t * 6.4 + 0.7)
    dy = 1.3 * math.sin(t * 12.6 + 0.4) + 0.7 * math.cos(t * 4.8)
    return dx, dy


def apply_handheld(img: np.ndarray, dx: float, dy: float) -> np.ndarray:
    h, w = img.shape[:2]
    matrix = np.array([[1.0, 0.0, dx], [0.0, 1.0, dy]], dtype=np.float32)
    return cv2.warpAffine(img, matrix, (w, h), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)


def motion_blur(current: np.ndarray, previous: np.ndarray | None, amount: float = 0.28) -> np.ndarray:
    if previous is None:
        return current
    return cv2.addWeighted(current, 1.0 - amount, previous, amount, 0.0)


def encode_mp4(sequence_dir: Path, out_path: Path, width: int, height: int) -> None:
    out_path.parent.mkdir(parents=True, exist_ok=True)
    cmd = [
        "ffmpeg",
        "-y",
        "-framerate",
        str(FPS),
        "-i",
        str(sequence_dir / "frame_%04d.png"),
        "-vf",
        (
            f"scale={width}:{height}:flags=lanczos,"
            "unsharp=5:5:0.35:5:5:0.0,"
            "format=yuv420p"
        ),
        "-c:v",
        "libx264",
        "-preset",
        "slow",
        "-crf",
        "16",
        "-profile:v",
        "high",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        "-t",
        f"{DURATION:.2f}",
        str(out_path),
    ]
    subprocess.run(cmd, check=True)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--skip-encode", action="store_true")
    args = parser.parse_args()

    loaded: dict[str, np.ndarray] = {}
    for _, name in KEYFRAMES:
        loaded[name] = load_bgr(FRAMES_DIR / name)

    h, w = next(iter(loaded.values())).shape[:2]
    for name, img in loaded.items():
        if img.shape[:2] != (h, w):
            loaded[name] = cv2.resize(img, (w, h), interpolation=cv2.INTER_AREA)

    pairs: list[dict] = []
    for (t0, n0), (t1, n1) in zip(KEYFRAMES, KEYFRAMES[1:]):
        a = loaded[n0]
        b = loaded[n1]
        ga = cv2.cvtColor(a, cv2.COLOR_BGR2GRAY)
        gb = cv2.cvtColor(b, cv2.COLOR_BGR2GRAY)
        print(f"flow {n0} → {n1}", flush=True)
        pairs.append(
            {
                "t0": t0,
                "t1": t1,
                "a": a,
                "b": b,
                "flow_ab": farneback(ga, gb),
                "flow_ba": farneback(gb, ga),
                "slide": (n0, n1) in ENTRANCE_PAIRS,
            }
        )

    seq_dir = OUT_DIR / "_sequence"
    if seq_dir.exists():
        shutil.rmtree(seq_dir)
    seq_dir.mkdir(parents=True)

    total = int(DURATION * FPS)
    previous = None
    pair_idx = 0
    for i in range(total):
        t = i / FPS
        while pair_idx < len(pairs) - 1 and t > pairs[pair_idx]["t1"]:
            pair_idx += 1
        pair = pairs[pair_idx]
        span = max(1e-6, pair["t1"] - pair["t0"])
        local_t = float(np.clip((t - pair["t0"]) / span, 0.0, 1.0))
        frame = morph_pair(
            pair["a"],
            pair["b"],
            pair["flow_ab"],
            pair["flow_ba"],
            local_t,
            pair["slide"],
        )
        dx, dy = handheld_offset(i, FPS)
        frame = apply_handheld(frame, dx, dy)
        frame = motion_blur(frame, previous)
        previous = frame
        cv2.imwrite(str(seq_dir / f"frame_{i:04d}.png"), frame)
        if i % 30 == 0:
            print(f"render {i}/{total} t={t:.2f}s", flush=True)

    if args.skip_encode:
        return 0

    hd = OUT_DIR / "DrJeevahSetpal-truck-support-9x16-1080.mp4"
    uhd = OUT_DIR / "DrJeevahSetpal-truck-support-9x16-4K.mp4"
    print("encode 1080x1920", flush=True)
    encode_mp4(seq_dir, hd, 1080, 1920)
    print("encode 2160x3840", flush=True)
    encode_mp4(seq_dir, uhd, 2160, 3840)
    print(f"wrote {hd}")
    print(f"wrote {uhd}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
