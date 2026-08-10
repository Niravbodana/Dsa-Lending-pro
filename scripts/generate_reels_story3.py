#!/usr/bin/env python3
"""NeerCred Instagram Reels — Story 3: Medical emergency at 2 AM."""

from __future__ import annotations

import asyncio
import json
import math
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
FRAMES = OUT / "frames"
ASSETS = Path("/opt/cursor/artifacts/neercred-promo-video/assets")
SCREENS = Path("/opt/cursor/artifacts/neercred-promo-video/screenshots")
DOWNLOAD = Path("/opt/cursor/artifacts")

W, H = 1080, 1920
FPS = 30
VOICE = "hi-IN-SwaraNeural"
BGM = ASSETS / "piano-reflections.mp3"

C = {
    "navy": "#0B1220",
    "teal": "#0F766E",
    "mint": "#5EEAD4",
    "gold": "#FDE68A",
    "white": "#F8FAFC",
    "red": "#EF4444",
}

SCENES = [
    {
        "id": "hook",
        "image": "story3-01-hospital-corridor.png",
        "overlay": "Raat ke 2 baje 🏥",
        "sub": "Hospital counter pe call aaya...",
        "vo": "Raat ke do baje. Hospital counter bola — ek lakh assi hazaar advance chahiye.",
        "duration_min": 4.5,
        "ken": "zoom_in",
    },
    {
        "id": "counter",
        "image": "story3-02-hospital-counter.png",
        "overlay": "₹1.8 Lakh Advance",
        "sub": "Papa admit the. Insurance partial cover.",
        "vo": "Papa admit the. Insurance ne partial cover kiya. Baaki amount ka tension tha.",
        "duration_min": 5.0,
        "ken": "pan_right",
    },
    {
        "id": "worry",
        "image": "story3-03-worried-phone.png",
        "overlay": "Panic mode 😰",
        "sub": "ATM limit · Sab so rahe the",
        "vo": "ATM limit khatam. Friends so rahe the. Kya karein ab?",
        "duration_min": 4.0,
        "ken": "zoom_in",
    },
    {
        "id": "help",
        "image": "story3-04-receptionist-help.png",
        "overlay": "Ek suggestion 💡",
        "sub": "\"NeerCred try karo — phone se ho jayega\"",
        "vo": "Receptionist ne softly bola — NeerCred try karo. Phone se eligible offers mil sakte hain. Branch jaane ki zaroorat nahi.",
        "duration_min": 6.0,
        "ken": "pan_left",
    },
    {
        "id": "app",
        "layout": "phone",
        "screens": ["01-homepage.png", "09-offers.png", "12-approved.png"],
        "overlay": "Compare & Choose",
        "sub": "Partner lenders · One screen",
        "vo": "Maine NeerCred par compare kiya — partner lenders ke eligible offers ek hi screen pe. Fully digital journey.",
        "duration_min": 6.5,
    },
    {
        "id": "relief",
        "image": "story3-05-relief.png",
        "overlay": "Clarity mili ✨",
        "sub": "Tension kam · Decision clear",
        "vo": "Jab clarity mili, tension kam ho gayi.",
        "duration_min": 3.5,
        "ken": "zoom_out",
    },
    {
        "id": "endcard",
        "layout": "endcard",
        "vo": "Apply now on neercred.com. Neer Cred — Dream Big. Borrow Smart.",
        "duration_min": 9.0,
    },
]


def run(cmd: list, **kw) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, check=True, **kw)


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


async def make_vo(text: str, path: Path) -> float:
    spoken = brand_voice_text(text)
    await edge_tts.Communicate(spoken, VOICE, rate="-3%", pitch="+0Hz").save(str(path))
    tmp = path.with_suffix(".boost.mp3")
    run([
        "ffmpeg", "-y", "-i", str(path),
        "-af",
        "highpass=f=80,lowpass=f=12000,compand=0.25|0.75:5:-70/-58|-20/-10|0/-3,"
        "volume=2.8,alimiter=limit=0.94",
        "-ar", "44100", "-ac", "2", "-b:a", "192k", str(tmp),
    ])
    tmp.replace(path)
    r = run(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(path)],
            capture_output=True, text=True)
    return float(json.loads(r.stdout)["format"]["duration"])


def pad_vo(vo: Path, target: float) -> float:
    r = run(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(vo)],
            capture_output=True, text=True)
    dur = float(json.loads(r.stdout)["format"]["duration"])
    if dur >= target:
        return dur
    pad = target - dur
    tmp = vo.with_suffix(".pad.mp3")
    run(["ffmpeg", "-y", "-i", str(vo), "-af", f"apad=pad_dur={pad:.3f}", "-t", f"{target:.3f}", str(tmp)])
    tmp.replace(vo)
    return target


def ken_crop(img: Image.Image, t: float, mode: str) -> Image.Image:
    """Ken Burns crop for vertical frame."""
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


def draw_gradient_bar(d: ImageDraw.ImageDraw, y: int, h_bar: int) -> None:
    for i in range(h_bar):
        a = int(200 * (1 - i / h_bar))
        d.line([(0, y + i), (W, y + i)], fill=(11, 18, 32, a))


def add_overlay(base: Image.Image, headline: str, sub: str) -> Image.Image:
    rgba = base.convert("RGBA")
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)

    # bottom gradient
    for i in range(520):
        a = int(220 * (i / 520) ** 1.4)
        d.line([(0, H - 520 + i), (W, H - 520 + i)], fill=(11, 18, 32, a))

    # top hook bar
    for i in range(180):
        a = int(160 * (1 - i / 180))
        d.line([(0, i), (W, i)], fill=(11, 18, 32, a))

    hf = font(62, bold=True)
    sf = font(30)
    badge_f = font(22, bold=True)

    # headline pill
    tw = d.textlength(headline, font=hf)
    px, py = 48, H - 340
    d.rounded_rectangle([40, py - 16, 40 + tw + 36, py + 72], radius=20, fill=(15, 118, 110, 230))
    d.text((58, py), headline, fill=rgb(C["white"]), font=hf)
    d.text((48, py + 88), sub, fill=rgb(C["mint"]), font=sf)

    # brand watermark
    d.text((48, 52), "NeerCred", fill=rgb(C["gold"]), font=badge_f)

    return Image.alpha_composite(rgba, overlay).convert("RGB")


def draw_phone_frame(screen_path: Path, t: float) -> Image.Image:
    """Phone mockup with NeerCred screen for vertical Reels."""
    canvas = Image.new("RGB", (W, H), rgb(C["navy"]))
    grad = Image.new("RGB", (W, H), rgb(C["navy"]))
    gd = ImageDraw.Draw(grad)
    for y in range(H):
        mix = y / H
        r = int(11 + (15 - 11) * mix)
        g = int(18 + (118 - 18) * mix * 0.35)
        b = int(32 + (110 - 32) * mix * 0.35)
        gd.line([(0, y), (W, y)], fill=(r, g, b))
    canvas = grad

    phone_w, phone_h = 420, 860
    px = (W - phone_w) // 2
    py = 280

    # glow
    glow = Image.new("RGBA", (phone_w + 100, phone_h + 100), (0, 0, 0, 0))
    ImageDraw.Draw(glow).rounded_rectangle([40, 40, phone_w + 60, phone_h + 60], radius=48, fill=(15, 118, 110, 80))
    glow = glow.filter(ImageFilter.GaussianBlur(28))
    canvas.paste(glow, (px - 50, py - 30), glow)

    # phone body
    body = Image.new("RGBA", (phone_w, phone_h), (0, 0, 0, 0))
    bd = ImageDraw.Draw(body)
    bd.rounded_rectangle([0, 0, phone_w - 1, phone_h - 1], radius=44, fill=(20, 28, 45, 255), outline=(94, 234, 212, 120), width=3)
    bd.rounded_rectangle([16, 16, phone_w - 17, phone_h - 17], radius=36, fill=(8, 12, 22, 255))

    screen = Image.open(screen_path).convert("RGB")
    sw, sh = phone_w - 34, phone_h - 34
    screen = screen.resize((sw, sh), Image.Resampling.LANCZOS)
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
    n = 96
    if len(existing) >= n:
        return existing

    from playwright.sync_api import sync_playwright

    print("  Capturing 9:16 endcard frames...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 540, "height": 960}, device_scale_factor=2)
        ctx.add_init_script("""
            localStorage.setItem('neer_cookie_consent_v1', JSON.stringify({
              essential: true, analytics: false, savedAt: new Date().toISOString()
            }));
        """)
        page = ctx.new_page()
        page.goto("http://localhost:3000/promo-endcard", wait_until="domcontentloaded", timeout=30000)
        page.wait_for_function("document.fonts.ready", timeout=15000)
        page.evaluate("""() => {
          document.querySelectorAll(
            '.loan-guide-root, [class*="cookie"], nextjs-portal, [data-next-mark], ' +
            '#__nextjs-build-indicator, button.fixed.bottom-6.left-6'
          ).forEach(e => e.remove());
        }""")
        page.wait_for_timeout(800)
        paths = []
        for i in range(n):
            fp = cache / f"frame_{i:03d}.png"
            page.screenshot(path=str(fp), type="png", animations="allow")
            page.wait_for_timeout(55)
            paths.append(fp)
        browser.close()
    return paths


def render_scene_frame(scene: dict, t: float, endcard_frames: list[Path]) -> Image.Image:
    if scene.get("layout") == "endcard":
        idx = min(int(t * len(endcard_frames) * 0.92), len(endcard_frames) - 1)
        img = Image.open(endcard_frames[idx]).convert("RGB")
        return img.resize((W, H), Image.Resampling.LANCZOS)

    if scene.get("layout") == "phone":
        screens = scene["screens"]
        idx = min(int(t * len(screens) * 1.1), len(screens) - 1)
        return draw_phone_frame(SCREENS / screens[idx], t)

    img = Image.open(IMAGES / scene["image"]).convert("RGB")
    frame = ken_crop(img, t, scene.get("ken", "zoom_in"))
    return add_overlay(frame, scene.get("overlay", ""), scene.get("sub", ""))


def render_scene_clip(scene: dict, vo: Path, dur: float, idx: int, endcard_frames: list[Path]) -> Path:
    CLIPS.mkdir(parents=True, exist_ok=True)
    out = CLIPS / f"scene_{idx:02d}.mp4"
    total = dur + 0.4
    n_frames = max(int(total * FPS), 24)
    seq = CLIPS / f"seq_{idx}"
    seq.mkdir(parents=True, exist_ok=True)
    for f in range(n_frames):
        t = f / max(n_frames - 1, 1)
        render_scene_frame(scene, t, endcard_frames).save(seq / f"frame_{f:04d}.png", quality=92)
    fade_out = max(0.1, total - 0.35)
    run([
        "ffmpeg", "-y", "-framerate", str(FPS), "-i", str(seq / "frame_%04d.png"),
        "-i", str(vo),
        "-vf", f"fade=t=in:st=0:d=0.3,fade=t=out:st={fade_out:.3f}:d=0.35",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "medium",
        "-c:a", "aac", "-b:a", "192k", "-ar", "44100", "-ac", "2",
        "-shortest", "-t", f"{total:.3f}", str(out),
    ])
    for fp in seq.glob("*.png"):
        fp.unlink()
    seq.rmdir()
    return out


def concat_clips(clips: list[Path], out: Path) -> None:
    if len(clips) == 1:
        run(["ffmpeg", "-y", "-i", str(clips[0]), "-c", "copy", str(out)])
        return
    inputs: list[str] = []
    for c in clips:
        inputs += ["-i", str(c)]
    durs = []
    for c in clips:
        r = run(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(c)],
                capture_output=True, text=True)
        durs.append(float(json.loads(r.stdout)["format"]["duration"]))
    fade = 0.3
    parts, aparts = [], []
    offset = durs[0] - fade
    parts.append(f"[0:v][1:v]xfade=transition=fade:duration={fade}:offset={offset:.3f}[v1]")
    vprev, acc = "v1", offset
    for i in range(2, len(clips)):
        acc += durs[i - 1] - fade
        vnext = f"v{i}"
        parts.append(f"[{vprev}][{i}:v]xfade=transition=fade:duration={fade}:offset={acc:.3f}[{vnext}]")
        vprev = vnext
    aparts.append("[0:a][1:a]acrossfade=d=0.3:c1=tri:c2=tri[a1]")
    aprev = "a1"
    for i in range(2, len(clips)):
        anext = f"a{i}"
        aparts.append(f"[{aprev}][{i}:a]acrossfade=d=0.3:c1=tri:c2=tri[{anext}]")
        aprev = anext
    filt = ";".join(parts + aparts)
    run([
        "ffmpeg", "-y", *inputs, "-filter_complex", filt,
        "-map", f"[{vprev}]", "-map", f"[{aprev}]",
        "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "256k", str(out),
    ])


def make_bgm(dur: float, path: Path) -> None:
    run([
        "ffmpeg", "-y", "-i", str(BGM),
        "-af", "highpass=f=80,lowpass=f=8000,volume=0.55",
        "-t", f"{dur + 2:.2f}", str(AUDIO / "bgm_trim.wav"),
    ])
    run([
        "ffmpeg", "-y", "-stream_loop", "-1", "-i", str(AUDIO / "bgm_trim.wav"),
        "-t", f"{dur + 1:.2f}",
        "-af", f"afade=t=in:d=2,afade=t=out:st={max(0, dur - 3):.2f}:d=3",
        "-ar", "44100", "-ac", "2", str(path),
    ])


def finalize_mobile_mp4(src: Path, dst: Path) -> None:
    run([
        "ffmpeg", "-y", "-i", str(src),
        "-c:v", "libx264", "-profile:v", "main", "-level", "4.0",
        "-pix_fmt", "yuv420p", "-crf", "20", "-preset", "medium",
        "-movflags", "+faststart", "-tag:v", "avc1",
        "-c:a", "aac", "-b:a", "128k", "-ar", "44100", "-ac", "2",
        "-brand", "mp42", "-map_metadata", "-1",
        str(dst),
    ])


def add_disclaimer(src: Path, dst: Path) -> None:
    """Small compliance text at bottom."""
    run([
        "ffmpeg", "-y", "-i", str(src),
        "-vf",
        "drawtext=fontfile=/opt/cursor/artifacts/neercred-promo-video/assets/Poppins-Regular.ttf:"
        "text='Eligible offers from partner lenders. Approval subject to lender terms.':"
        "fontsize=18:fontcolor=white@0.75:x=(w-text_w)/2:y=h-52:"
        "box=1:boxcolor=0x0B1220@0.55:boxborderw=8",
        "-c:a", "copy", "-c:v", "libx264", "-crf", "20", "-pix_fmt", "yuv420p",
        str(dst),
    ])


async def main(endcard_frames: list[Path]) -> None:
    for d in (AUDIO, CLIPS, FRAMES, DOWNLOAD):
        d.mkdir(parents=True, exist_ok=True)

    print("=== Story 3: Medical Emergency Reel ===")
    clips: list[Path] = []

    for i, scene in enumerate(SCENES):
        vo = AUDIO / f"vo_{scene['id']}.mp3"
        print(f"  VO: {scene['id']}...")
        dur = await make_vo(scene["vo"], vo)
        dur = pad_vo(vo, float(scene.get("duration_min", dur)))
        print(f"    {dur:.1f}s — {scene['vo'][:60]}...")
        clips.append(render_scene_clip(scene, vo, dur, i, endcard_frames))

    merged = OUT / "story3_merged.mp4"
    print("  Merging clips...")
    concat_clips(clips, merged)

    r = run(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(merged)],
            capture_output=True, text=True)
    vid_dur = float(json.loads(r.stdout)["format"]["duration"])
    bgm = AUDIO / "bgm_mix.mp3"
    make_bgm(vid_dur, bgm)

    mixed = OUT / "story3_mixed.mp4"
    run([
        "ffmpeg", "-y", "-i", str(merged), "-i", str(bgm),
        "-filter_complex",
        "[0:a]highpass=f=100,lowpass=f=13000,volume=2.2[sp1];"
        "[sp1]asplit=2[sc][mx];"
        "[1:a]volume=0.65,aloop=loop=-1:size=2e+09[pi1];"
        "[pi1][sc]sidechaincompress=threshold=0.04:ratio=4:attack=50:release=400:makeup=2[du1];"
        "[mx][du1]amix=inputs=2:duration=first:weights=1 0.85:normalize=0,"
        "loudnorm=I=-16:TP=-1.0:LRA=11,alimiter=limit=0.96[aout]",
        "-map", "0:v:0", "-map", "[aout]",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", str(mixed),
    ])

    with_disclaimer = OUT / "story3_disclaimer.mp4"
    add_disclaimer(mixed, with_disclaimer)

    final = DOWNLOAD / "NeerCred-Reels-Story3-Medical.mp4"
    finalize_mobile_mp4(with_disclaimer, final)

    ws = Path("/workspace/artifacts")
    ws.mkdir(parents=True, exist_ok=True)
    (ws / "NeerCred-Reels-Story3-Medical.mp4").write_bytes(final.read_bytes())

    print(f"\n✅ Reels video ready:\n   {final}\n   Duration: {vid_dur:.1f}s")


if __name__ == "__main__":
    endcard_frames = ensure_endcard_frames()
    asyncio.run(main(endcard_frames))
