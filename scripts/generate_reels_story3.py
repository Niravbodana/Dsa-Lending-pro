#!/usr/bin/env python3
"""NeerCred Instagram Reels — Story 3 v2: cinematic VO + situational BGM."""

from __future__ import annotations

import asyncio
import json
import subprocess
import urllib.request
from pathlib import Path

import edge_tts
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = Path("/opt/cursor/artifacts/neercred-reels-story3")
IMAGES = OUT / "images"
AUDIO = OUT / "audio"
CLIPS = OUT / "clips"
ASSETS = Path("/opt/cursor/artifacts/neercred-promo-video/assets")
SCREENS = Path("/opt/cursor/artifacts/neercred-promo-video/screenshots")
DOWNLOAD = Path("/opt/cursor/artifacts")
AUDIT = OUT / "audit-report.json"

W, H = 1080, 1920
FPS = 30
VOICE = "en-IN-NeerjaNeural"
RATE = "-14%"
PITCH = "-4Hz"
PHRASE_GAP = 0.42

BGM_TENSION = ASSETS / "silent-descent.mp3"
BGM_HOPE = ASSETS / "too_many_days_piano.mp3"
BGM_UPLIFT = ASSETS / "soft_morning_keys_piano.mp3"

C = {
    "navy": "#0B1220",
    "teal": "#0F766E",
    "mint": "#5EEAD4",
    "gold": "#FDE68A",
    "white": "#F8FAFC",
}

SCENES = [
    {
        "id": "hook",
        "image": "story3-01-hospital-corridor.png",
        "overlay": "Raat ke 2 baje 🏥",
        "sub": "Hospital counter pe call aaya...",
        "phrases": [
            "Raat ke do baje.",
            "Hospital counter bola... ek lakh assi hazaar advance.",
        ],
        "mood": "tension",
        "duration_pad": 0.7,
        "ken": "zoom_in",
    },
    {
        "id": "counter",
        "image": "story3-02-hospital-counter.png",
        "overlay": "₹1.8 Lakh Advance",
        "sub": "Papa admit the. Insurance partial cover.",
        "phrases": [
            "Papa admit the.",
            "Insurance ne sirf partial cover kiya.",
            "Baaki amount ka tension tha.",
        ],
        "mood": "tension",
        "duration_pad": 0.6,
        "ken": "pan_right",
    },
    {
        "id": "worry",
        "image": "story3-03-worried-phone.png",
        "overlay": "Panic mode 😰",
        "sub": "ATM limit · Sab so rahe the",
        "phrases": [
            "ATM limit khatam.",
            "Sab so rahe the.",
            "Ab kya karein?",
        ],
        "mood": "tension",
        "duration_pad": 0.6,
        "ken": "zoom_in",
    },
    {
        "id": "help",
        "image": "story3-04-receptionist-help.png",
        "overlay": "Ek suggestion 💡",
        "sub": "\"NeerCred try karo — phone se ho jayega\"",
        "phrases": [
            "Tab receptionist ne softly bola...",
            "NeerCred try karo.",
            "Phone se eligible offers mil sakte hain.",
            "Branch jaane ki zaroorat nahi.",
        ],
        "mood": "transition",
        "duration_pad": 0.7,
        "ken": "pan_left",
    },
    {
        "id": "app",
        "layout": "phone",
        "screens": ["01-homepage.png", "09-offers.png", "12-approved.png"],
        "overlay": "Compare & Choose",
        "sub": "Partner lenders · One screen",
        "phrases": [
            "Maine NeerCred par compare kiya.",
            "Partner lenders ke eligible offers... ek hi screen pe.",
            "Fully digital journey.",
        ],
        "mood": "hope",
        "duration_pad": 0.7,
    },
    {
        "id": "relief",
        "image": "story3-05-relief.png",
        "overlay": "Clarity mili ✨",
        "sub": "Tension kam · Decision clear",
        "phrases": [
            "Jab clarity mili...",
            "tension kam ho gayi.",
        ],
        "mood": "hope",
        "duration_pad": 0.6,
        "ken": "zoom_out",
    },
    {
        "id": "endcard",
        "layout": "endcard",
        "phrases": [
            "Apply now on neercred.com.",
            "Neer Cred.",
            "Dream Big. Borrow Smart.",
        ],
        "mood": "uplift",
        "duration_min": 9.0,
    },
]

MOOD_BGM = {
    "tension": (BGM_TENSION, 0.22, 120),
    "transition": (BGM_HOPE, 0.18, 90),
    "hope": (BGM_HOPE, 0.32, 75),
    "uplift": (BGM_UPLIFT, 0.38, 60),
}


def run(cmd: list, **kw) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, check=True, **kw)


def probe_duration(path: Path) -> float:
    r = run(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(path)],
            capture_output=True, text=True)
    return float(json.loads(r.stdout)["format"]["duration"])


def rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def ensure_fonts() -> tuple[Path, Path]:
    ASSETS.mkdir(parents=True, exist_ok=True)
    bold = ASSETS / "Poppins-Bold.ttf"
    reg = ASSETS / "Poppins-Regular.ttf"
    if not bold.exists():
        urllib.request.urlretrieve(
            "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Bold.ttf", bold
        )
    if not reg.exists():
        urllib.request.urlretrieve(
            "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Regular.ttf", reg
        )
    return bold, reg


def font(sz: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    bold_p, reg_p = ensure_fonts()
    return ImageFont.truetype(str(bold_p if bold else reg_p), sz)


def brand_voice_text(text: str) -> str:
    text = text.replace("NeerCred", "Neer Cred")
    text = text.replace("www.neercred.com", "www dot Neer Cred dot com")
    text = text.replace("neercred.com", "Neer Cred dot com")
    return text


def polish_vo_clip(raw: Path, out: Path) -> None:
    """Warm cinematic voice — premium chain, no harsh boost."""
    run([
        "ffmpeg", "-y", "-i", str(raw),
        "-af",
        "highpass=f=90,lowpass=f=12500,"
        "equalizer=f=250:width_type=o:width=2:g=1.5,"
        "equalizer=f=2500:width_type=o:width=2:g=2,"
        "afftdn=nr=2:nf=-28,"
        "acompressor=threshold=-20dB:ratio=2.8:attack=8:release=120:makeup=1.8,"
        "aecho=0.82:0.88:18:0.06,"
        "loudnorm=I=-18:TP=-2.0:LRA=8",
        "-ar", "44100", "-ac", "2", "-b:a", "256k", str(out),
    ])


async def synth_phrase(text: str, path: Path) -> None:
    spoken = brand_voice_text(text)
    await edge_tts.Communicate(spoken, VOICE, rate=RATE, pitch=PITCH).save(str(path))


async def make_vo(phrases: list[str], path: Path) -> float:
    parts: list[Path] = []
    for i, phrase in enumerate(phrases):
        raw = path.parent / f"{path.stem}_raw_{i}.mp3"
        polished = path.parent / f"{path.stem}_p_{i}.mp3"
        await synth_phrase(phrase, raw)
        polish_vo_clip(raw, polished)
        parts.append(polished)
        raw.unlink(missing_ok=True)

    gap = AUDIO / "phrase_gap.wav"
    run([
        "ffmpeg", "-y", "-f", "lavfi", "-i", f"anullsrc=r=44100:cl=stereo",
        "-t", f"{PHRASE_GAP:.3f}", str(gap),
    ])
    concat = path.parent / f"{path.stem}_list.txt"
    lines: list[str] = []
    for i, p in enumerate(parts):
        lines.append(f"file '{p}'")
        if i < len(parts) - 1:
            lines.append(f"file '{gap}'")
    concat.write_text("\n".join(lines))
    run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(concat),
        "-ar", "44100", "-ac", "2", "-b:a", "256k", str(path),
    ])
    for p in parts:
        p.unlink(missing_ok=True)
    concat.unlink(missing_ok=True)
    gap.unlink(missing_ok=True)
    return probe_duration(path)


def pad_vo_tail(vo: Path, pad: float) -> float:
    dur = probe_duration(vo)
    target = dur + pad
    tmp = vo.with_suffix(".pad.mp3")
    run([
        "ffmpeg", "-y", "-i", str(vo),
        "-af", f"apad=pad_dur={pad:.3f}",
        "-t", f"{target:.3f}",
        str(tmp),
    ])
    tmp.replace(vo)
    return target


def extend_vo_to_min(vo: Path, minimum: float) -> float:
    dur = probe_duration(vo)
    if dur >= minimum:
        return dur
    pad = minimum - dur
    tmp = vo.with_suffix(".min.mp3")
    run([
        "ffmpeg", "-y", "-i", str(vo),
        "-af", f"apad=pad_dur={pad:.3f}",
        "-t", f"{minimum:.3f}",
        str(tmp),
    ])
    tmp.replace(vo)
    return minimum


def ken_crop(img: Image.Image, t: float, mode: str) -> Image.Image:
    iw, ih = img.size
    scale = max(W / iw, H / ih)
    base = 1.05 + 0.08 * t
    if mode == "zoom_out":
        base = 1.14 - 0.08 * t
    sw, sh = int(iw * scale * base), int(ih * scale * base)
    img = img.resize((sw, sh), Image.Resampling.LANCZOS)
    ox = int((sw - W) * (0.5 + 0.12 * t if mode == "pan_right" else 0.5 - 0.12 * t if mode == "pan_left" else 0.5))
    oy = int((sh - H) * 0.42)
    ox = max(0, min(ox, sw - W))
    oy = max(0, min(oy, sh - H))
    return img.crop((ox, oy, ox + W, oy + H))


def add_overlay(base: Image.Image, headline: str, sub: str) -> Image.Image:
    rgba = base.convert("RGBA")
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    for i in range(520):
        a = int(220 * (i / 520) ** 1.4)
        d.line([(0, H - 520 + i), (W, H - 520 + i)], fill=(11, 18, 32, a))
    for i in range(180):
        a = int(160 * (1 - i / 180))
        d.line([(0, i), (W, i)], fill=(11, 18, 32, a))
    hf, sf, badge_f = font(62, bold=True), font(30), font(22, bold=True)
    tw = d.textlength(headline, font=hf)
    py = H - 340
    d.rounded_rectangle([40, py - 16, 40 + tw + 36, py + 72], radius=20, fill=(15, 118, 110, 230))
    d.text((58, py), headline, fill=rgb(C["white"]), font=hf)
    d.text((48, py + 88), sub, fill=rgb(C["mint"]), font=sf)
    d.text((48, 52), "NeerCred", fill=rgb(C["gold"]), font=badge_f)
    return Image.alpha_composite(rgba, overlay).convert("RGB")


def draw_phone_frame(screen_path: Path, t: float) -> Image.Image:
    canvas = Image.new("RGB", (W, H), rgb(C["navy"]))
    gd = ImageDraw.Draw(canvas)
    for y in range(H):
        mix = y / H
        gd.line([(0, y), (W, y)], fill=(int(11 + 4 * mix), int(18 + 35 * mix), int(32 + 26 * mix)))
    phone_w, phone_h, px, py = 420, 860, (W - 420) // 2, 280
    glow = Image.new("RGBA", (phone_w + 100, phone_h + 100), (0, 0, 0, 0))
    ImageDraw.Draw(glow).rounded_rectangle([40, 40, phone_w + 60, phone_h + 60], radius=48, fill=(15, 118, 110, 80))
    glow = glow.filter(ImageFilter.GaussianBlur(28))
    canvas.paste(glow, (px - 50, py - 30), glow)
    body = Image.new("RGBA", (phone_w, phone_h), (0, 0, 0, 0))
    bd = ImageDraw.Draw(body)
    bd.rounded_rectangle([0, 0, phone_w - 1, phone_h - 1], radius=44, fill=(20, 28, 45, 255), outline=(94, 234, 212, 120), width=3)
    bd.rounded_rectangle([16, 16, phone_w - 17, phone_h - 17], radius=36, fill=(8, 12, 22, 255))
    screen = Image.open(screen_path).convert("RGB").resize((phone_w - 34, phone_h - 34), Image.Resampling.LANCZOS)
    body.paste(screen, (17, 17))
    canvas.paste(body, (px, py), body)
    rgba = canvas.convert("RGBA")
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    for i in range(300):
        a = int(200 * (i / 300) ** 1.3)
        d.line([(0, H - 300 + i), (W, H - 300 + i)], fill=(11, 18, 32, a))
    d.text((48, 52), "NeerCred", fill=rgb(C["gold"]), font=font(22, bold=True))
    d.text((48, H - 220), "Compare eligible offers", fill=rgb(C["white"]), font=font(48, bold=True))
    d.text((48, H - 155), "Partner lenders · One screen", fill=rgb(C["mint"]), font=font(28))
    return Image.alpha_composite(rgba, overlay).convert("RGB")


def ensure_endcard_frames() -> list[Path]:
    cache = OUT / "endcard_frames"
    cache.mkdir(parents=True, exist_ok=True)
    existing = sorted(cache.glob("frame_*.png"))
    if len(existing) >= 96:
        return existing
    from playwright.sync_api import sync_playwright

    print("  Capturing 9:16 endcard frames...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 540, "height": 960}, device_scale_factor=2)
        ctx.add_init_script(
            "localStorage.setItem('neer_cookie_consent_v1', JSON.stringify({essential:true,analytics:false}));"
        )
        page = ctx.new_page()
        page.goto("http://localhost:3000/promo-endcard", wait_until="domcontentloaded", timeout=30000)
        page.wait_for_function("document.fonts.ready", timeout=15000)
        page.evaluate("""() => document.querySelectorAll(
          '[class*="cookie"], nextjs-portal, [data-next-mark], #__nextjs-build-indicator'
        ).forEach(e => e.remove())""")
        page.wait_for_timeout(800)
        paths = []
        for i in range(96):
            fp = cache / f"frame_{i:03d}.png"
            page.screenshot(path=str(fp), type="png", animations="allow")
            page.wait_for_timeout(55)
            paths.append(fp)
        browser.close()
    return paths


def render_scene_frame(scene: dict, t: float, endcard_frames: list[Path]) -> Image.Image:
    if scene.get("layout") == "endcard":
        idx = min(int(t * len(endcard_frames) * 0.92), len(endcard_frames) - 1)
        return Image.open(endcard_frames[idx]).convert("RGB").resize((W, H), Image.Resampling.LANCZOS)
    if scene.get("layout") == "phone":
        screens = scene["screens"]
        idx = min(int(t * len(screens) * 1.1), len(screens) - 1)
        return draw_phone_frame(SCREENS / screens[idx], t)
    img = Image.open(IMAGES / scene["image"]).convert("RGB")
    return add_overlay(ken_crop(img, t, scene.get("ken", "zoom_in")), scene.get("overlay", ""), scene.get("sub", ""))


def render_scene_clip(scene: dict, vo: Path, dur: float, idx: int, endcard_frames: list[Path]) -> Path:
    CLIPS.mkdir(parents=True, exist_ok=True)
    out = CLIPS / f"scene_{idx:02d}.mp4"
    total = dur + 0.35
    n_frames = max(int(total * FPS), 24)
    seq = CLIPS / f"seq_{idx}"
    seq.mkdir(parents=True, exist_ok=True)
    for f in range(n_frames):
        t = f / max(n_frames - 1, 1)
        render_scene_frame(scene, t, endcard_frames).save(seq / f"frame_{f:04d}.png", quality=92)
    fade_out = max(0.1, total - 0.3)
    run([
        "ffmpeg", "-y", "-framerate", str(FPS), "-i", str(seq / "frame_%04d.png"),
        "-i", str(vo),
        "-vf", f"fade=t=in:st=0:d=0.28,fade=t=out:st={fade_out:.3f}:d=0.3",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium",
        "-c:a", "aac", "-b:a", "256k", "-ar", "44100", "-ac", "2",
        "-shortest", "-t", f"{total:.3f}", str(out),
    ])
    for fp in seq.glob("*.png"):
        fp.unlink()
    seq.rmdir()
    return out


def concat_clips(clips: list[Path], out: Path) -> None:
    inputs: list[str] = []
    for c in clips:
        inputs += ["-i", str(c)]
    durs = [probe_duration(c) for c in clips]
    fade = 0.28
    parts, aparts = [], []
    offset = durs[0] - fade
    parts.append(f"[0:v][1:v]xfade=transition=fade:duration={fade}:offset={offset:.3f}[v1]")
    vprev, acc = "v1", offset
    for i in range(2, len(clips)):
        acc += durs[i - 1] - fade
        vnext = f"v{i}"
        parts.append(f"[{vprev}][{i}:v]xfade=transition=fade:duration={fade}:offset={acc:.3f}[{vnext}]")
        vprev = vnext
    aparts.append("[0:a][1:a]acrossfade=d=0.28:c1=tri:c2=tri[a1]")
    aprev = "a1"
    for i in range(2, len(clips)):
        anext = f"a{i}"
        aparts.append(f"[{aprev}][{i}:a]acrossfade=d=0.28:c1=tri:c2=tri[{anext}]")
        aprev = anext
    run([
        "ffmpeg", "-y", *inputs, "-filter_complex", ";".join(parts + aparts),
        "-map", f"[{vprev}]", "-map", f"[{aprev}]",
        "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "256k", str(out),
    ])


def make_scene_bgm_segment(mood: str, dur: float, idx: int) -> Path:
    src, vol, lowpass = MOOD_BGM[mood]
    seg = AUDIO / f"bgm_seg_{idx:02d}.wav"
    run([
        "ffmpeg", "-y", "-stream_loop", "-1", "-i", str(src),
        "-t", f"{dur + 0.5:.3f}",
        "-af",
        f"highpass=f=60,lowpass=f={lowpass},volume={vol},"
        f"afade=t=in:d=0.8,afade=t=out:st={max(0.1, dur - 0.6):.2f}:d=0.6",
        "-ar", "44100", "-ac", "2", str(seg),
    ])
    return seg


def make_staged_bgm(scene_specs: list[tuple[str, float]], out: Path) -> None:
    segs = [make_scene_bgm_segment(mood, dur, i) for i, (mood, dur) in enumerate(scene_specs)]
    if len(segs) == 1:
        run(["ffmpeg", "-y", "-i", str(segs[0]), "-t", f"{scene_specs[0][1]:.3f}", str(out)])
        return
    inputs: list[str] = []
    for s in segs:
        inputs += ["-i", str(s)]
    durs = [d for _, d in scene_specs]
    fade = 1.2
    parts = []
    offset = durs[0] - fade
    parts.append(f"[0:a][1:a]acrossfade=d={fade}:c1=tri:c2=tri[a1]")
    aprev, acc = "a1", offset
    for i in range(2, len(segs)):
        acc += durs[i - 1] - fade
        anext = f"a{i}"
        parts.append(f"[{aprev}][{i}:a]acrossfade=d={fade}:c1=tri:c2=tri[{anext}]")
        aprev = anext
    run([
        "ffmpeg", "-y", *inputs, "-filter_complex", ";".join(parts),
        "-map", f"[{aprev}]", str(out),
    ])


def mix_vo_bgm(voice: Path, bgm: Path, out: Path) -> None:
    run([
        "ffmpeg", "-y", "-i", str(voice), "-i", str(bgm),
        "-filter_complex",
        "[0:a]highpass=f=100,lowpass=f=13000,volume=1.15[vox];"
        "[vox]asplit=2[sc][mx];"
        "[1:a]volume=1.0[bg];"
        "[bg][sc]sidechaincompress=threshold=0.025:ratio=3:attack=35:release=500:makeup=1.2[duck];"
        "[mx][duck]amix=inputs=2:duration=first:weights=1 0.75:normalize=0,"
        "loudnorm=I=-15:TP=-1.0:LRA=10,alimiter=limit=0.97[aout]",
        "-map", "[aout]", "-c:a", "aac", "-b:a", "320k", str(out),
    ])


def mux_video_audio(video: Path, audio: Path, out: Path) -> None:
    run([
        "ffmpeg", "-y", "-i", str(video), "-i", str(audio),
        "-map", "0:v:0", "-map", "1:a:0",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-shortest", str(out),
    ])


def finalize_mobile_mp4(src: Path, dst: Path) -> None:
    run([
        "ffmpeg", "-y", "-i", str(src),
        "-c:v", "libx264", "-profile:v", "main", "-level", "4.0",
        "-pix_fmt", "yuv420p", "-crf", "20", "-preset", "medium",
        "-movflags", "+faststart", "-tag:v", "avc1",
        "-c:a", "aac", "-b:a", "128k", "-ar", "44100", "-ac", "2",
        "-brand", "mp42", "-map_metadata", "-1", str(dst),
    ])


def add_disclaimer(src: Path, dst: Path) -> None:
    run([
        "ffmpeg", "-y", "-i", str(src),
        "-vf",
        "drawtext=fontfile=/opt/cursor/artifacts/neercred-promo-video/assets/Poppins-Regular.ttf:"
        "text='Eligible offers from partner lenders. Approval subject to lender terms.':"
        "fontsize=18:fontcolor=white@0.75:x=(w-text_w)/2:y=h-52:"
        "box=1:boxcolor=0x0B1220@0.55:boxborderw=8",
        "-c:a", "copy", "-c:v", "libx264", "-crf", "20", "-pix_fmt", "yuv420p", str(dst),
    ])


def audio_stats(path: Path) -> dict:
    det = run(["ffmpeg", "-y", "-i", str(path), "-af", "volumedetect", "-f", "null", "-"],
              capture_output=True, text=True)
    stats: dict[str, str] = {}
    for ln in det.stderr.split("\n"):
        if "mean_volume" in ln or "max_volume" in ln:
            k, v = ln.strip().split(":", 1)
            stats[k.strip()] = v.strip()
    return stats


def audit_output(final: Path, scene_log: list[dict]) -> dict:
    r = run(["ffprobe", "-v", "quiet", "-print_format", "json",
             "-show_format", "-show_streams", str(final)], capture_output=True, text=True)
    meta = json.loads(r.stdout)
    vstream = next(s for s in meta["streams"] if s["codec_type"] == "video")
    report = {
        "file": str(final),
        "duration_sec": round(float(meta["format"]["duration"]), 2),
        "size_mb": round(int(meta["format"]["size"]) / 1_048_576, 2),
        "video": {
            "codec": vstream.get("codec_name"),
            "profile": vstream.get("profile"),
            "resolution": f"{vstream.get('width')}x{vstream.get('height')}",
            "pix_fmt": vstream.get("pix_fmt"),
        },
        "audio": audio_stats(final),
        "voice": {
            "engine": VOICE,
            "rate": RATE,
            "pitch": PITCH,
            "phrase_gap_sec": PHRASE_GAP,
            "chain": "EQ + light denoise + soft compressor + subtle echo + loudnorm -18 LUFS",
        },
        "bgm": {
            "tension": BGM_TENSION.name,
            "hope": BGM_HOPE.name,
            "uplift": BGM_UPLIFT.name,
            "staging": "per-scene mood with 1.2s crossfades",
        },
        "scenes": scene_log,
        "checks": [],
    }
    checks = report["checks"]
    dur = report["duration_sec"]
    checks.append({"item": "duration_30_90s", "pass": 30 <= dur <= 90, "value": dur})
    checks.append({"item": "h264_main_mobile", "pass": vstream.get("profile") == "Main", "value": vstream.get("profile")})
    checks.append({"item": "vertical_9x16", "pass": vstream.get("width") == 1080 and vstream.get("height") == 1920,
                   "value": report["video"]["resolution"]})
    mean = report["audio"].get("mean_volume", "")
    if "dB" in mean:
        mv = float(mean.replace(" dB", ""))
        checks.append({"item": "loudness_not_too_quiet", "pass": mv > -22, "value": mean})
        checks.append({"item": "loudness_not_clipping", "pass": mv < -10, "value": mean})
    checks.append({"item": "endcard_scene_present", "pass": any(s["id"] == "endcard" for s in scene_log), "value": True})
    report["all_pass"] = all(c["pass"] for c in checks)
    AUDIT.write_text(json.dumps(report, indent=2))
    return report


async def main(endcard_frames: list[Path]) -> None:
    for d in (AUDIO, CLIPS, DOWNLOAD):
        d.mkdir(parents=True, exist_ok=True)

    print("=== Story 3 v2 — Cinematic VO + Situational BGM ===")
    clips: list[Path] = []
    scene_log: list[dict] = []
    bgm_specs: list[tuple[str, float]] = []

    for i, scene in enumerate(SCENES):
        vo = AUDIO / f"vo_{scene['id']}.mp3"
        print(f"  VO: {scene['id']} ({len(scene['phrases'])} phrases)...")
        dur = await make_vo(scene["phrases"], vo)
        if scene.get("duration_min"):
            dur = extend_vo_to_min(vo, float(scene["duration_min"]))
        else:
            dur = pad_vo_tail(vo, float(scene.get("duration_pad", 0.5)))
        print(f"    {dur:.1f}s")
        clip_dur = dur + 0.35
        bgm_specs.append((scene.get("mood", "hope"), clip_dur))
        scene_log.append({"id": scene["id"], "mood": scene.get("mood"), "vo_sec": round(dur, 2),
                          "clip_sec": round(clip_dur, 2), "phrases": scene["phrases"]})
        clips.append(render_scene_clip(scene, vo, dur, i, endcard_frames))

    merged = OUT / "story3_merged.mp4"
    print("  Merging clips...")
    concat_clips(clips, merged)
    vid_dur = probe_duration(merged)

    bgm = AUDIO / "bgm_staged.wav"
    print("  Building situational BGM...")
    make_staged_bgm(bgm_specs, bgm)

    vo_only = AUDIO / "vo_full.wav"
    run(["ffmpeg", "-y", "-i", str(merged), "-vn", "-acodec", "pcm_s16le", str(vo_only)])

    mixed_audio = AUDIO / "mixed_audio.m4a"
    mix_vo_bgm(vo_only, bgm, mixed_audio)

    mixed = OUT / "story3_mixed.mp4"
    mux_video_audio(merged, mixed_audio, mixed)

    with_disclaimer = OUT / "story3_disclaimer.mp4"
    add_disclaimer(mixed, with_disclaimer)

    final = DOWNLOAD / "NeerCred-Reels-Story3-Medical.mp4"
    finalize_mobile_mp4(with_disclaimer, final)

    ws = Path("/workspace/artifacts")
    ws.mkdir(parents=True, exist_ok=True)
    report = audit_output(final, scene_log)
    (ws / "NeerCred-Reels-Story3-Medical.mp4").write_bytes(final.read_bytes())
    (ws / "neercred-reels-story3-audit.json").write_bytes(AUDIT.read_bytes())

    print("\n=== AUDIT REPORT ===")
    print(f"  Duration : {report['duration_sec']}s")
    print(f"  Size     : {report['size_mb']} MB")
    print(f"  Video    : {report['video']['profile']} {report['video']['resolution']}")
    print(f"  Audio    : {report['audio']}")
    print(f"  Voice    : {report['voice']['engine']} ({report['voice']['rate']})")
    for c in report["checks"]:
        mark = "✅" if c["pass"] else "❌"
        print(f"  {mark} {c['item']}: {c['value']}")
    print(f"\n✅ Final: {final}")
    print(f"   Audit: {AUDIT}")


if __name__ == "__main__":
    endcard_frames = ensure_endcard_frames()
    asyncio.run(main(endcard_frames))
