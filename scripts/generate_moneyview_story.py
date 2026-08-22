#!/usr/bin/env python3
"""NeerCred MoneyView-style promo — fast-paced Hindi story, 4K 9:16."""

from __future__ import annotations

import asyncio
import json
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

import generate_cinematic_story as cine  # noqa: E402
import generate_premium_final as gpf  # noqa: E402
from PIL import Image  # noqa: E402

OUT = gpf.OUT
DOWNLOAD = gpf.DOWNLOAD
AUDIO = gpf.AUDIO
FRAMES = gpf.FRAMES
CLIPS = gpf.CLIPS
W_V, H_V = gpf.W_V, gpf.H_V
FPS = gpf.FPS
run = gpf.run

VOICE = "hi-IN-SwaraNeural"
VO_PREFIX = "mv"
FADE_IN = 0.25
FADE_OUT = 0.3

# Different story from cinematic v2: college fees deadline → NeerCred solution
MONEYVIEW_SCENES: list[dict] = [
    {
        "id": "hook",
        "layout": "mv_scene",
        "animation": "hook",
        "vo": "Sapna bada hai — college admission mil gayi. Par fees ki last date kal hai. Pachasi hazaar arrange karna mushkil lag raha hai.",
        "vo_hi": "College fees ki last date kal hai.\nSapna bada, time kam.",
        "duration": 5.5,
    },
    {
        "id": "problem",
        "layout": "mv_scene",
        "animation": "problem",
        "vo": "Bank band hai. Savings kam hain. Paisa ruka toh sapna bhi ruk jayega. Tension badh rahi hai.",
        "vo_hi": "Bank band. Savings kam.\nPaisa ruka toh sapna rukega.",
        "duration": 5.0,
    },
    {
        "id": "solution",
        "layout": "mv_scene",
        "animation": "solution",
        "vo": "Rukna mat! NeerCred try karo — fully digital loan marketplace. HDFC, ICICI, Bajaj sab ek hi jagah.",
        "vo_hi": "NeerCred try karo!\nSab lenders ek jagah.",
        "duration": 5.0,
    },
    {
        "id": "speed",
        "layout": "mv_scene",
        "animation": "speed",
        "vo": "Poora process sirf minutes mein. Apply karo, verify karo, aur approve ho jao — bilkul online.",
        "vo_hi": "Loan minutes mein.\nPoora process online.",
        "duration": 4.5,
    },
    {
        "id": "step_apply",
        "layout": "mv_step",
        "animation": "step_1",
        "vo": "Email daalo — secure OTP turant inbox mein aayega.",
        "vo_hi": "Email daalo.\nSecure OTP inbox mein.",
        "duration": 4.0,
    },
    {
        "id": "step_otp",
        "layout": "mv_step",
        "animation": "step_2",
        "vo": "OTP verify karo — ek minute se bhi kam time.",
        "vo_hi": "OTP verify.\nEk minute se kam.",
        "duration": 3.5,
    },
    {
        "id": "step_profile",
        "layout": "mv_step",
        "animation": "step_3",
        "vo": "PAN aur profile bharo — ek simple guided form.",
        "vo_hi": "PAN & profile.\nEk simple form.",
        "duration": 4.0,
    },
    {
        "id": "step_offers",
        "layout": "mv_step",
        "animation": "step_4",
        "vo": "Saare lenders ke offers ek screen par — best rate aur EMI compare karo.",
        "vo_hi": "Offers compare karo.\nBest rate chuno.",
        "duration": 4.5,
    },
    {
        "id": "step_approved",
        "layout": "mv_step",
        "animation": "step_5",
        "vo": "Bahut acchi khabar! Aap qualify ho sakte ho — pandrah lakh tak.",
        "vo_hi": "Aap qualify ho sakte ho!\n₹15 Lakh tak.",
        "duration": 4.5,
    },
    {
        "id": "step_kyc",
        "layout": "mv_full",
        "animation": "ekyc",
        "vo": "Aadhaar eKYC lender ke secure platform par complete — verified aur ready.",
        "vo_hi": "Aadhaar eKYC verified.\nLender platform par.",
        "duration": 5.0,
    },
    {
        "id": "step_transfer",
        "layout": "mv_full",
        "animation": "transfer",
        "vo": "Aur yeh dekho — paisa seedha aapke bank account mein! Quick, secure, same day disbursal.",
        "vo_hi": "Paisa bank mein!\nQuick aur secure.",
        "duration": 6.0,
    },
    {
        "id": "close",
        "layout": "endcard_full",
        "animation": "endcard",
        "vo": "Sapna rukna band karo. Ab apply karo NeerCred par — www dot neercred dot com.",
        "vo_hi": "Sapna rukna band.\nApply on NeerCred.com",
        "duration": 7.0,
    },
]


def ensure_moneyview_frames() -> dict[str, list[Path]]:
    base = "http://localhost:3000"
    specs = [
        ("hook", f"{base}/promo-moneyview-hook", 60),
        ("problem", f"{base}/promo-moneyview-problem", 60),
        ("solution", f"{base}/promo-moneyview-solution", 60),
        ("speed", f"{base}/promo-moneyview-speed", 54),
        ("step_1", f"{base}/promo-moneyview-step?step=1", 50),
        ("step_2", f"{base}/promo-moneyview-step?step=2", 50),
        ("step_3", f"{base}/promo-moneyview-step?step=3", 50),
        ("step_4", f"{base}/promo-moneyview-step?step=4", 50),
        ("step_5", f"{base}/promo-moneyview-step?step=5", 50),
    ]
    out: dict[str, list[Path]] = {}
    for key, url, n in specs:
        out[key] = gpf.ensure_animation_frames(
            f"mv_{key}_v1", url, n=n, viewport_w=1080, viewport_h=1920, device_scale=2,
        )
    out["ekyc"] = gpf.ensure_animation_frames(
        "mv_ekyc_v1", f"{base}/promo-ekyc-approved", n=60, viewport_w=1080, viewport_h=1920, device_scale=2,
    )
    out["transfer"] = gpf.ensure_animation_frames(
        "mv_transfer_v1", f"{base}/promo-transfer", n=72, viewport_w=1080, viewport_h=1920, device_scale=2,
    )
    out["endcard"] = gpf.ensure_endcard_frames_vertical()
    return out


def render_mv_frame(
    scene: dict,
    anim_frames: dict[str, list[Path]],
    frame_t: float = 0.0,
) -> Image.Image:
    layout = scene.get("layout", "")
    key = scene.get("animation", "hook")
    if layout in ("mv_scene", "mv_step", "mv_full"):
        img = cine.render_anim_frame(anim_frames, key, frame_t)
        return cine.overlay_caption(img, scene)
    if layout == "endcard_full":
        img = gpf.render_endcard_frame_vertical(anim_frames, frame_t)
        return cine.overlay_caption(img, scene)
    return cine.neercred_bg()


def render_mv_clip(
    scene: dict,
    vo: Path,
    dur: float,
    idx: int,
    anim_frames: dict[str, list[Path]],
) -> Path:
    CLIPS.mkdir(parents=True, exist_ok=True)
    out = CLIPS / f"mv_{idx:02d}.mp4"
    total = dur + 0.35
    n_frames = max(int(total * FPS), 24)
    seq_dir = CLIPS / f"mv_seq_{idx}"
    seq_dir.mkdir(parents=True, exist_ok=True)

    for f in range(n_frames):
        t = f / n_frames
        img = render_mv_frame(scene, anim_frames, t)
        img.save(seq_dir / f"frame_{f:04d}.png", quality=92)

    vf = f"fade=t=in:st=0:d={FADE_IN},fade=t=out:st={total - FADE_OUT:.3f}:d={FADE_OUT}"
    run([
        "ffmpeg", "-y", "-framerate", str(FPS), "-i", str(seq_dir / "frame_%04d.png"), "-i", str(vo),
        "-vf", vf, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "11", "-preset", "medium",
        "-c:a", "aac", "-b:a", "256k", "-ar", "44100", "-ac", "2",
        "-shortest", "-t", f"{total:.3f}", str(out),
    ])
    for fp in seq_dir.glob("*.png"):
        fp.unlink(missing_ok=True)
    seq_dir.rmdir()
    return out


async def make_mv_vo(text: str, path: Path) -> float:
    import edge_tts

    path.parent.mkdir(parents=True, exist_ok=True)
    comm = edge_tts.Communicate(text, VOICE, rate="+8%", pitch="+3Hz")
    await comm.save(str(path))
    boosted = path.with_suffix(".boost.mp3")
    run([
        "ffmpeg", "-y", "-i", str(path),
        "-af", "highpass=f=90,lowpass=f=12000,volume=2.4,alimiter=limit=0.95",
        str(boosted),
    ])
    boosted.replace(path)
    r = run(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(path)], capture_output=True, text=True)
    return float(json.loads(r.stdout)["format"]["duration"])


async def prepare_mv_vo(scenes: list[dict]) -> list[tuple[dict, float, Path]]:
    rows: list[tuple[dict, float, Path]] = []
    for scene in scenes:
        vo = AUDIO / f"{VO_PREFIX}_vo_{scene['id']}.mp3"
        if scene.get("vo_silent") or not scene.get("vo", "").strip():
            dur = float(scene.get("duration", 5.0))
            gpf.make_silent_audio(dur, vo)
        elif vo.exists():
            r = run(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(vo)], capture_output=True, text=True)
            dur = float(json.loads(r.stdout)["format"]["duration"])
        else:
            dur = await make_mv_vo(scene["vo"], vo)
            min_dur = scene.get("duration")
            if min_dur and dur < float(min_dur):
                pad = float(min_dur) - dur
                padded = vo.with_suffix(".pad.mp3")
                run([
                    "ffmpeg", "-y", "-i", str(vo),
                    "-af", f"apad=pad_dur={pad:.3f}",
                    "-t", f"{float(min_dur):.3f}",
                    str(padded),
                ])
                padded.replace(vo)
                dur = float(min_dur)
        rows.append((scene, dur, vo))
        print(f"  {scene['id']}: {dur:.1f}s")
    return rows


def make_upbeat_bgm(dur: float, path: Path) -> None:
    """Louder, brighter BGM mix for MoneyView energy."""
    src = gpf.ensure_bgm_source()
    processed = AUDIO / "bgm_mv_processed.wav"
    run([
        "ffmpeg", "-y", "-i", str(src),
        "-af", "highpass=f=100,lowpass=f=10000,volume=1.35,aecho=0.6:0.5:40:0.25",
        str(processed),
    ])
    looped = AUDIO / "bgm_mv_looped.wav"
    run([
        "ffmpeg", "-y", "-stream_loop", "-1", "-i", str(processed),
        "-t", f"{dur + 2:.2f}",
        "-af", f"loudnorm=I=-15:TP=-1.0:LRA=8,afade=t=in:d=1.5,afade=t=out:st={max(0, dur - 2):.2f}:d=2",
        str(looped),
    ])
    run(["ffmpeg", "-y", "-i", str(looped), "-t", f"{dur + 1:.2f}", "-ar", "44100", "-ac", "2", str(path)])
    processed.unlink(missing_ok=True)
    looped.unlink(missing_ok=True)


def capture_moneyview_frames() -> dict[str, list[Path]]:
    return ensure_moneyview_frames()


async def build_moneyview_video(anim_frames: dict[str, list[Path]]) -> Path:
    print("=== NeerCred MoneyView-Style Story — 4K 9:16 ===\n")
    for d in (AUDIO, FRAMES, CLIPS):
        d.mkdir(parents=True, exist_ok=True)

    scene_durations = await prepare_mv_vo(MONEYVIEW_SCENES)

    clips: list[Path] = []
    for i, (scene, dur, vo) in enumerate(scene_durations):
        clip = render_mv_clip(scene, vo, dur, i, anim_frames)
        clips.append(clip)
        print(f"  clip {scene['id']}: {dur:.1f}s")

    merged = OUT / "moneyview_merged.mp4"
    gpf.concat_clips(clips, merged)

    r = run(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(merged)], capture_output=True, text=True)
    vid_dur = float(json.loads(r.stdout)["format"]["duration"])
    bgm = AUDIO / "bgm_moneyview.mp3"
    make_upbeat_bgm(vid_dur, bgm)

    v_raw = DOWNLOAD / "NeerCred-MoneyView-RAW.mp4"
    v_out = DOWNLOAD / "NeerCred-MoneyView-Story.mp4"
    run([
        "ffmpeg", "-y", "-i", str(merged), "-i", str(bgm),
        "-filter_complex",
        "[0:a]highpass=f=100,lowpass=f=13000,volume=2.6[sp1];"
        "[sp1]asplit=2[sc][mx];"
        "[1:a]volume=0.82,aloop=loop=-1:size=2e+09[pi1];"
        "[pi1][sc]sidechaincompress=threshold=0.025:ratio=6:attack=30:release=350:makeup=2.8[du1];"
        "[mx][du1]amix=inputs=2:duration=first:weights=1 0.95:normalize=0,"
        "loudnorm=I=-15:TP=-1.0:LRA=10,alimiter=limit=0.96[aout]",
        "-map", "0:v:0", "-map", "[aout]",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-ar", "44100", "-ac", "2",
        str(v_raw),
    ])
    print("  Finalizing MoneyView export...")
    gpf.finalize_mobile_mp4(v_raw, v_out)
    v_raw.unlink(missing_ok=True)

    ig = DOWNLOAD / "NeerCred-MoneyView-Instagram.mp4"
    ig.write_bytes(v_out.read_bytes())

    audit = gpf.audit_instagram_video(v_out)
    audit_path = OUT / "moneyview_916_audit.json"
    audit_path.write_text(json.dumps(audit, indent=2))
    print("\n=== MoneyView QC ===")
    for k, v in audit["checks"].items():
        print(f"  {'✅' if v else '❌'} {k}: {v}")

    ws = Path("/workspace/artifacts")
    ws.mkdir(parents=True, exist_ok=True)
    for src, name in [
        (v_out, "NeerCred-MoneyView-Story.mp4"),
        (ig, "NeerCred-MoneyView-Instagram.mp4"),
        (audit_path, "moneyview_916_audit.json"),
    ]:
        if Path(src).exists():
            (ws / name).write_bytes(Path(src).read_bytes())

    print(f"\n✅ MONEYVIEW VIDEO:\n   {v_out}\n   {ig}")
    return v_out


if __name__ == "__main__":
    frames = capture_moneyview_frames()
    asyncio.run(build_moneyview_video(frames))
