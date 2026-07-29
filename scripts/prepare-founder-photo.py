#!/usr/bin/env python3
"""Crop & zoom founder photo for About Us page.

Usage:
  1. Save your original portrait as:
     frontend/public/images/founder/sunny-bodana-original.jpg
  2. Run: python3 scripts/prepare-founder-photo.py
  3. Output: frontend/public/images/founder/sunny-bodana.jpg
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "frontend/public/images/founder/sunny-bodana-original.jpg"
OUT = ROOT / "frontend/public/images/founder/sunny-bodana.jpg"


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Missing source image: {SRC}")

    img = Image.open(SRC).convert("RGB")
    w, h = img.size

    # Focus upper-right subject (founder at temple railing)
    left = int(w * 0.38)
    top = int(h * 0.05)
    right = int(w * 0.98)
    bottom = int(h * 0.72)
    cropped = img.crop((left, top, right, bottom))

    cw, ch = cropped.size
    side = min(cw, ch)
    cx, cy = cw // 2, ch // 3
    x0 = max(0, cx - side // 2)
    y0 = max(0, cy - side // 2)
    zoomed = cropped.crop((x0, y0, x0 + side, y0 + side))
    out = zoomed.resize((1200, 1200), Image.Resampling.LANCZOS)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    out.save(OUT, quality=92, optimize=True)
    print(f"Wrote {OUT} ({out.size[0]}x{out.size[1]})")


if __name__ == "__main__":
    main()
