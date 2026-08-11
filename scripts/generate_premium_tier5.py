#!/usr/bin/env python3
"""Tier 5 — Interactive Story A/B promo cuts (UI-only vs Story+UI hybrid)."""

from __future__ import annotations

import asyncio
import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

import generate_premium_final as gpf  # noqa: E402

OUT = gpf.OUT
DOWNLOAD = gpf.DOWNLOAD
AUDIO = gpf.AUDIO
CLIPS = gpf.CLIPS
FRAMES = gpf.FRAMES

# Version A — full UI journey (current premium promo)
SCENES_A = list(gpf.SCENES)

# Version B — Story hook (problem → swipe → solution) + condensed UI hybrid
STORY_HOOK = [
    {
        "id": "story_problem",
        "layout": "story_full",
        "animation": "story_problem",
        "step": "",
        "title": "",
        "subtitle": "",
        "bullets": [],
        "vo": "Loan chahiye, par bank branch jaane ka time nahi hai?",
        "vo_hi": "लोन चाहिए?\nबैंक जाने का टाइम नहीं",
        "duration": 5.5,
    },
    {
        "id": "story_swipe",
        "layout": "story_full",
        "animation": "story_swipe",
        "step": "",
        "title": "",
        "subtitle": "",
        "bullets": [],
        "vo": "Swipe up kijiye — aapki poori digital loan journey yahin se shuru hoti hai.",
        "vo_hi": "Swipe up करें\nडिजिटल लोन जर्नी",
        "duration": 5.0,
    },
    {
        "id": "story_solution",
        "layout": "story_full",
        "animation": "story_solution",
        "step": "",
        "title": "",
        "subtitle": "",
        "bullets": [],
        "vo": "Neer Cred — Dream Big, Borrow Smart. Pandrah lakh tak ke eligible offers, poora online.",
        "vo_hi": "NeerCred™\nसपने बड़े · स्मार्ट लोन\nपंद्रह लाख तक",
        "duration": 6.5,
    },
]

HYBRID_UI_IDS = ("home", "offers", "approved", "transfer", "endcard")
SCENES_B = STORY_HOOK + [s for s in gpf.SCENES if s["id"] in HYBRID_UI_IDS]


def ensure_story_frames() -> dict[str, list[Path]]:
    return {
        "story_problem": gpf.ensure_animation_frames(
            "story_problem",
            "http://localhost:3000/promo-story-problem",
            n=52,
            viewport_w=540,
            viewport_h=960,
            device_scale=2,
        ),
        "story_swipe": gpf.ensure_animation_frames(
            "story_swipe",
            "http://localhost:3000/promo-story-swipe",
            n=48,
            viewport_w=540,
            viewport_h=960,
            device_scale=2,
        ),
        "story_solution": gpf.ensure_animation_frames(
            "story_solution",
            "http://localhost:3000/promo-story-solution",
            n=56,
            viewport_w=540,
            viewport_h=960,
            device_scale=2,
        ),
    }


def merge_anim_frames(base_v: dict[str, list[Path]], story: dict[str, list[Path]]) -> dict[str, list[Path]]:
    merged = dict(base_v)
    merged.update(story)
    return merged


async def prepare_vo(scenes: list[dict], prefix: str) -> list[tuple[dict, float, Path]]:
    """Generate or reuse VO; return scene durations for build."""
    scene_durations: list[tuple[dict, float, Path]] = []
    for scene in scenes:
        vo = AUDIO / f"{prefix}_vo_{scene['id']}.mp3"
        generic = AUDIO / f"vo_{scene['id']}.mp3"
        if not vo.exists() and generic.exists():
            shutil.copy2(generic, vo)
        if scene.get("vo_silent") or not scene.get("vo", "").strip():
            dur = float(scene.get("duration", 9.0))
            gpf.make_silent_audio(dur, vo)
        elif vo.exists():
            r = gpf.run(
                ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(vo)],
                capture_output=True,
                text=True,
            )
            dur = float(json.loads(r.stdout)["format"]["duration"])
        else:
            dur = await gpf.make_vo(scene["vo"], vo)
            min_dur = scene.get("duration")
            if min_dur and dur < float(min_dur):
                pad = float(min_dur) - dur
                padded = vo.with_suffix(".pad.mp3")
                gpf.run([
                    "ffmpeg", "-y", "-i", str(vo),
                    "-af", f"apad=pad_dur={pad:.3f}",
                    "-t", f"{float(min_dur):.3f}",
                    str(padded),
                ])
                padded.replace(vo)
                dur = float(min_dur)
        scene_durations.append((scene, dur, vo))
        print(f"  [{prefix}] {scene['id']}: {dur:.1f}s")
    return scene_durations


async def build_vertical_variant(
    variant: str,
    scenes: list[dict],
    anim_frames: dict[str, list[Path]],
    output_name: str,
) -> Path:
    """Build one 9:16 A/B variant."""
    logo = gpf.load_logo()
    logo_hires = gpf.load_logo_hires()
    n = len(scenes)

    print(f"\n=== Building variant {variant.upper()} ({n} scenes) ===")
    scene_durations = await prepare_vo(scenes, variant)

    v_clips: list[Path] = []
    for i, (scene, dur, vo) in enumerate(scene_durations):
        fr = FRAMES / f"{variant}_v_{i:02d}.png"
        gpf.render_frame_vertical(
            scene, logo, anim_frames=anim_frames, scene_idx=i,
            logo_hires=logo_hires, total_scenes=n,
        ).save(fr, quality=95)

        clip_src: Path
        if scene.get("layout") in ("celebration", "endcard_full", "greeting_full", "story_full"):
            clip_src = gpf.render_celebration_clip_vertical(scene, logo, vo, dur, i, anim_frames, logo_hires)
        else:
            clip_src = gpf.render_clip_vertical(fr, vo, dur, i)
        dest = CLIPS / f"{variant}_v_{i:02d}.mp4"
        if clip_src.resolve() != dest.resolve():
            shutil.copy2(clip_src, dest)
        v_clips.append(dest)
        print(f"  [9:16 {variant}] {scene['id']}: {dur:.1f}s")

    merged_v = OUT / f"merged_{variant}_916.mp4"
    gpf.concat_clips(v_clips, merged_v)

    r = gpf.run(
        ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(merged_v)],
        capture_output=True,
        text=True,
    )
    vid_dur = float(json.loads(r.stdout)["format"]["duration"])
    bgm = AUDIO / f"bgm_{variant}_916.mp3"
    gpf.make_bgm(vid_dur, bgm)

    v_raw = DOWNLOAD / f"NeerCred-Promo-{variant}-RAW-9x16.mp4"
    v_out = DOWNLOAD / output_name
    gpf.run([
        "ffmpeg", "-y", "-i", str(merged_v), "-i", str(bgm),
        "-filter_complex",
        "[0:a]highpass=f=100,lowpass=f=13000,volume=2.5[sp1];"
        "[sp1]asplit=2[sc][mx];"
        "[1:a]volume=0.72,aloop=loop=-1:size=2e+09[pi1];"
        "[pi1][sc]sidechaincompress=threshold=0.03:ratio=5:attack=40:release=450:makeup=2.5[du1];"
        "[mx][du1]amix=inputs=2:duration=first:weights=1 0.9:normalize=0,"
        "loudnorm=I=-16:TP=-1.0:LRA=11,alimiter=limit=0.96[aout]",
        "-map", "0:v:0", "-map", "[aout]",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-ar", "44100", "-ac", "2",
        str(v_raw),
    ])
    print(f"  Finalizing {variant}...")
    gpf.finalize_mobile_mp4(v_raw, v_out)
    v_raw.unlink(missing_ok=True)
    return v_out


def write_ab_manifest(path_a: Path, path_b: Path, audit_a: dict, audit_b: dict) -> Path:
    manifest = {
        "tier": 5,
        "format": "Instagram Story / Reels 9:16 A/B test",
        "variants": {
            "A": {
                "id": "ui_only",
                "label": "UI-only (full product walkthrough)",
                "file": path_a.name,
                "scenes": [s["id"] for s in SCENES_A],
                "duration_sec": audit_a.get("duration"),
                "qc_passed": audit_a.get("checks", {}).get("passed"),
                "hypothesis": "Users who want to see the full app flow before applying.",
            },
            "B": {
                "id": "story_hybrid",
                "label": "Story hook + condensed UI (interactive ad)",
                "file": path_b.name,
                "scenes": [s["id"] for s in SCENES_B],
                "duration_sec": audit_b.get("duration"),
                "qc_passed": audit_b.get("checks", {}).get("passed"),
                "hypothesis": "Emotional story hook + swipe CTA drives higher engagement on cold traffic.",
                "story_beats": ["problem", "swipe_up", "solution"],
            },
        },
        "testing_notes": [
            "Run both on Instagram Reels with same caption and budget split 50/50.",
            "Track: 3-sec view rate, completion rate, link clicks to neercred.com.",
            "Winner = higher completion + CTR after 1000+ impressions each.",
        ],
    }
    out = OUT / "ab_test_manifest.json"
    out.write_text(json.dumps(manifest, indent=2))
    return out


async def _build_all(anim_a: dict, anim_b: dict) -> None:
    # Version A — UI-only full promo
    path_a = await build_vertical_variant(
        "a",
        SCENES_A,
        anim_a,
        "NeerCred-Promo-A-UI-Only-9x16.mp4",
    )

    # Version B — Story + UI hybrid
    path_b = await build_vertical_variant(
        "b",
        SCENES_B,
        anim_b,
        "NeerCred-Promo-B-Story-Hybrid-9x16.mp4",
    )

    audit_a = gpf.audit_instagram_video(path_a)
    audit_b = gpf.audit_instagram_video(path_b)
    (OUT / "audit_a_ui_only.json").write_text(json.dumps(audit_a, indent=2))
    (OUT / "audit_b_story_hybrid.json").write_text(json.dumps(audit_b, indent=2))
    manifest = write_ab_manifest(path_a, path_b, audit_a, audit_b)

    # Friendly aliases for release
    alias_a = DOWNLOAD / "NeerCred-Instagram-Reels-A-UI.mp4"
    alias_b = DOWNLOAD / "NeerCred-Instagram-Reels-B-Story.mp4"
    shutil.copy2(path_a, alias_a)
    shutil.copy2(path_b, alias_b)

    ws = Path("/workspace/artifacts")
    ws.mkdir(parents=True, exist_ok=True)
    for src, name in [
        (path_a, path_a.name),
        (path_b, path_b.name),
        (alias_a, alias_a.name),
        (alias_b, alias_b.name),
        (manifest, "ab_test_manifest.json"),
    ]:
        (ws / name).write_bytes(Path(src).read_bytes())

    print("\n=== Tier 5 A/B QC ===")
    for label, audit in [("A UI-only", audit_a), ("B Story hybrid", audit_b)]:
        print(f"\n  {label}:")
        for k, v in audit["checks"].items():
            print(f"    {'✅' if v else '❌'} {k}: {v}")

    print(f"\n✅ Tier 5 A/B promos ready:")
    print(f"   A (UI-only):      {path_a}")
    print(f"   B (Story hybrid): {path_b}")
    print(f"   Manifest:         {manifest}")


if __name__ == "__main__":
    for d in (OUT, AUDIO, CLIPS, FRAMES, DOWNLOAD):
        d.mkdir(parents=True, exist_ok=True)

    print("=== Tier 5: Capturing frames (sync) ===")
    story_frames = ensure_story_frames()
    base_anim_v = {
        "ekyc": gpf.ensure_celebration_frames(),
        "transfer": gpf.ensure_transfer_frames(),
        "endcard": gpf.ensure_endcard_frames_vertical(),
        "greeting": gpf.ensure_greeting_frames_vertical(),
    }
    anim_a = merge_anim_frames(base_anim_v, {})
    anim_b = merge_anim_frames(base_anim_v, story_frames)

    asyncio.run(_build_all(anim_a, anim_b))
