#!/usr/bin/env python3
"""Audit all promo video frames for logo clipping."""

from __future__ import annotations

import sys
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

from generate_premium_final import SCENES, load_logo, render_frame  # noqa: E402

FRAMES = Path("/opt/cursor/artifacts/neercred-promo-video/frames")
AUDIT = Path("/opt/cursor/artifacts/neercred-promo-video/audit")


def check_logo_region(img: Image.Image, name: str) -> list[str]:
    """Detect if logo pixels touch image edges (sign of clipping)."""
    issues: list[str] = []
    px = img.load()
    w, h = img.size

    # Top-left overlay logo zone (video frame)
    for y_start, y_end, x_start, x_end, label in [
        (80, 160, 50, 320, "overlay-logo"),
        (0, 120, 0, 400, "phone-header"),
    ]:
        # Find bright/non-dark pixels
        rows_with_content: list[int] = []
        for y in range(y_start, min(y_end, h)):
            for x in range(x_start, min(x_end, w)):
                r, g, b = px[x, y][:3]
                if r + g + b > 180:
                    rows_with_content.append(y)
                    break

        if not rows_with_content:
            continue

        top_row = min(rows_with_content)
        bot_row = max(rows_with_content)

        # Check if content touches zone boundary (clipping indicator)
        if label == "overlay-logo" and top_row <= y_start + 2:
            issues.append(f"{name}/{label}: content touches TOP (y={top_row})")
        if bot_row >= y_end - 3:
            issues.append(f"{name}/{label}: content touches BOTTOM (y={bot_row})")

    return issues


def main() -> int:
    AUDIT.mkdir(parents=True, exist_ok=True)
    logo = load_logo()
    all_issues: list[str] = []

    print("=== Logo Audit — all scenes ===\n")
    for i, scene in enumerate(SCENES):
        frame = render_frame(scene, logo)
        out = AUDIT / f"audit_{i:02d}_{scene['id']}.png"
        frame.save(out)

        # Also check overlay logo crop
        overlay = frame.crop((0, 0, 360, 180))
        overlay.save(AUDIT / f"logo_zoom_{scene['id']}.png")

        issues = check_logo_region(frame, scene["id"])
        status = "✓ OK" if not issues else "✗ ISSUES"
        print(f"  [{status}] {scene['id']:12s} → {out.name}")
        for iss in issues:
            print(f"           {iss}")
            all_issues.append(f"{scene['id']}: {iss}")

    print()
    if all_issues:
        print(f"FAILED — {len(all_issues)} issue(s) found")
        return 1
    print("PASSED — all scenes have intact logos")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
