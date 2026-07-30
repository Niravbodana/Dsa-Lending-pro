#!/usr/bin/env python3
"""NeerCred wedding story promo — AI village scenes, Hindi multi-voice, thriller→piano BGM."""

from __future__ import annotations

import asyncio
import json
import math
import subprocess
import urllib.parse
from pathlib import Path

import edge_tts
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = Path("/opt/cursor/artifacts/neercred-wedding-story")
AI_DIR = OUT / "ai-photos"
SCENES_DIR = OUT / "scenes"
AUDIO_DIR = OUT / "audio"
FRAMES_DIR = OUT / "frames"
CLIPS_DIR = OUT / "clips"

W, H = 1080, 1920
FPS = 30

VOICE_PROFILES = {
    "girl": ("hi-IN-SwaraNeural", "+8%", "+2Hz"),
    "dadi": ("hi-IN-SwaraNeural", "-12%", "-6Hz"),
    "brand": ("hi-IN-MadhurNeural", "+0%", "-1Hz"),
}

SCENES = [
    {
        "id": "run",
        "photo": "story-run.png",
        "vo": "Dadi! Dadi!",
        "voice": "girl",
        "ken": (1.0, 1.08),
    },
    {
        "id": "worry",
        "photo": "story-worried.png",
        "vo": "Dadi, papa ne meri shaadi fix kar di hai... par paise nahi hain. Kahin se loan hi nahi mil raha.",
        "voice": "girl",
        "ken": (1.05, 1.12),
    },
    {
        "id": "cry",
        "photo": "story-cry.png",
        "vo": "",
        "voice": None,
        "hold": 2.2,
        "ken": (1.08, 1.14),
    },
    {
        "id": "phone",
        "photo": "story-phone.png",
        "vo": "Beta, tension mat le. NeerCred hai na... abhi loan ho jayega.",
        "voice": "dadi",
        "ken": (1.0, 1.06),
    },
    {
        "id": "happy",
        "photo": "story-happy.png",
        "vo": "",
        "voice": None,
        "hold": 2.5,
        "ken": (1.0, 1.05),
    },
    {
        "id": "logo",
        "brand_close": True,
        "vo": "Neer Cred... Dream Big, Borrow Smart.",
        "voice": "brand",
        "hold": 4.0,
    },
]

IMAGE_PROMPTS = {
    "story-run.png": (
        "Young Indian village girl in colorful salwar running urgently along dusty rural village lane, "
        "golden hour, emotional cinematic Bollywood, photorealistic, vertical 9:16"
    ),
    "story-worried.png": (
        "Young Indian woman and elderly grandmother in village courtyard, girl worried breathless, "
        "grandmother on charpai, mud walls, emotional cinematic photorealistic vertical 9:16"
    ),
    "story-cry.png": (
        "Emotional young Indian bride-to-be with tears talking to grandmother in village home, "
        "warm lamp light, rural India, photorealistic cinematic vertical 9:16"
    ),
    "story-phone.png": (
        "Wise Indian grandmother holding smartphone with loan app, reassuring smile, young woman beside her, "
        "village home interior, warm golden light, photorealistic vertical 9:16"
    ),
    "story-happy.png": (
        "Happy young Indian village woman smiling with relief, grandmother beside her, golden sunset courtyard, "
        "heartwarming cinematic photorealistic vertical 9:16"
    ),
}


def run(cmd: list[str], **kwargs) -> subprocess.CompletedProcess:
    print("$", " ".join(cmd))
    return subprocess.run(cmd, check=True, **kwargs)


def cover_crop(img: Image.Image, tw: int, th: int) -> Image.Image:
    src = img.convert("RGB")
    scale = max(tw / src.width, th / src.height)
    nw, nh = int(src.width * scale), int(src.height * scale)
    src = src.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - tw) // 2
    top = (nh - th) // 2
    return src.crop((left, top, left + tw, top + th))


def ken_burns(photo: Image.Image, t: float, z0: float, z1: float) -> Image.Image:
    """t in [0,1] — slow zoom pan."""
    zoom = z0 + (z1 - z0) * t
    tw, th = int(W * zoom), int(H * zoom)
    cropped = cover_crop(photo, tw, th)
    left = (tw - W) // 2
    top = int((th - H) * 0.42 * t)
    return cropped.crop((left, top, left + W, top + H))


def ease_out_cubic(t: float) -> float:
    return 1 - (1 - t) ** 3


def fetch_ai_image(name: str, prompt: str) -> Path:
    dest = AI_DIR / name
    if dest.exists():
        return dest
    url = (
        "https://image.pollinations.ai/prompt/"
        + urllib.parse.quote(prompt)
        + f"?width={W}&height={H}&nologo=true&seed={hash(name) % 99999}"
    )
    run(["curl", "-fsSL", "-o", str(dest), url], timeout=180)
    return dest


def ensure_ai_photos() -> None:
    AI_DIR.mkdir(parents=True, exist_ok=True)
    assets = Path("/opt/cursor/artifacts/assets")
    for name, prompt in IMAGE_PROMPTS.items():
        dest = AI_DIR / name
        src = assets / name
        if src.exists() and not dest.exists():
            dest.write_bytes(src.read_bytes())
        elif not dest.exists():
            print(f"Generating {name}...")
            fetch_ai_image(name, prompt)


def _rasterize_logo(path: Path, svg: str, vp: str) -> None:
    w, h = map(int, vp.split(","))
    html = OUT / f"render-{path.stem}.html"
    tmp = path.with_suffix(".tmp.png")
    html.write_text(
        f"""<!DOCTYPE html><html><head><meta charset="utf-8"><style>
*{{margin:0;padding:0}}body{{width:{w}px;height:{h}px;background:#FFFFFF;
display:flex;align-items:center;justify-content:center}}svg{{width:95%;height:auto}}</style></head>
<body>{svg}</body></html>"""
    )
    run([
        "npx", "playwright", "screenshot", "--browser", "chromium",
        f"file://{html.resolve()}", str(tmp), f"--viewport-size={w},{h}",
    ], cwd=ROOT / "frontend")
    img = Image.open(tmp).convert("RGBA")
    px = img.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            if r > 248 and g > 248 and b > 248:
                px[x, y] = (r, g, b, 0)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    img.save(path)
    tmp.unlink(missing_ok=True)


def ensure_logo() -> Path:
    logo = SCENES_DIR / "neercred-logo-close-dark.png"
    svg = """<svg width="700" height="160" viewBox="0 0 700 160" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="x-blue" x1="8" y1="8" x2="36" y2="52" gradientUnits="userSpaceOnUse">
      <stop stop-color="#22D3EE"/><stop offset="0.55" stop-color="#3B82F6"/><stop offset="1" stop-color="#1E3A8A"/>
    </linearGradient>
    <linearGradient id="x-gold" x1="42" y1="12" x2="52" y2="50" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FDE68A"/><stop offset="0.45" stop-color="#E8C547"/><stop offset="1" stop-color="#B8860B"/>
    </linearGradient>
    <linearGradient id="x-ring-blue" x1="6" y1="32" x2="32" y2="32" gradientUnits="userSpaceOnUse">
      <stop stop-color="#38BDF8"/><stop offset="1" stop-color="#1D4ED8"/>
    </linearGradient>
    <linearGradient id="x-ring-gold" x1="32" y1="32" x2="58" y2="32" gradientUnits="userSpaceOnUse">
      <stop stop-color="#F5D76E"/><stop offset="1" stop-color="#C9A227"/>
    </linearGradient>
    <linearGradient id="x-cred" x1="100" y1="0" x2="500" y2="0" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0F766E"/><stop offset="1" stop-color="#14B8A6"/>
    </linearGradient>
  </defs>
  <g transform="translate(12, -17) scale(1.2)">
    <path d="M48 14 A34 34 0 0 0 48 82" stroke="url(#x-ring-blue)" stroke-width="2.8" fill="none" stroke-linecap="round"/>
    <path d="M48 14 A34 34 0 0 1 48 82" stroke="url(#x-ring-gold)" stroke-width="2.8" fill="none" stroke-linecap="round"/>
    <path d="M34 30 L34 66" stroke="url(#x-blue)" stroke-width="7.5" stroke-linecap="round"/>
    <path d="M34 30 L62 66" stroke="url(#x-blue)" stroke-width="7.5" stroke-linecap="round"/>
    <path d="M62 30 L62 66" stroke="url(#x-gold)" stroke-width="7.5" stroke-linecap="round"/>
    <path d="M48 9.5 L49.8 13.8 L54.4 13.8 L50.8 16.6 L52.2 21 L48 18.4 L43.8 21 L45.2 16.6 L41.6 13.8 L46.2 13.8 Z" fill="url(#x-gold)"/>
  </g>
  <text x="128" y="72" font-family="Poppins, system-ui, sans-serif" font-size="62" font-weight="700" letter-spacing="-0.5">
    <tspan fill="#F8FAFC">Neer</tspan><tspan fill="url(#x-cred)">Cred</tspan>
  </text>
  <text x="128" y="118" font-family="Poppins, system-ui, sans-serif" font-size="18" font-weight="600" fill="#94A3B8" letter-spacing="3.5">DREAM BIG. BORROW SMART.</text>
</svg>"""
    if not logo.exists():
        _rasterize_logo(logo, svg, "1400,340")
    return logo


def render_photo_frame(photo_path: Path, t: float, z0: float, z1: float) -> Image.Image:
    photo = Image.open(photo_path)
    frame = ken_burns(photo, t, z0, z1)
    # Cinematic letterbox vignette
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    for i in range(120):
        a = int(80 * (i / 120))
        draw.rectangle([0, i, W, i + 1], fill=(0, 0, 0, a))
        draw.rectangle([0, H - i - 1, W, H - i], fill=(0, 0, 0, a))
    return Image.alpha_composite(frame.convert("RGBA"), overlay).convert("RGB")


def render_logo_frames(prev_photo: Path, logo_path: Path, n_frames: int) -> list[Image.Image]:
    base_photo = cover_crop(Image.open(prev_photo), W, H)
    logo = Image.open(logo_path).convert("RGBA")
    bbox = logo.getbbox()
    if bbox:
        logo = logo.crop(bbox)
    target_w = 920
    scale = target_w / logo.width
    logo = logo.resize((int(logo.width * scale), int(logo.height * scale)), Image.Resampling.LANCZOS)

    frames: list[Image.Image] = []
    for i in range(n_frames):
        t = i / max(n_frames - 1, 1)
        et = ease_out_cubic(t)

        blurred = base_photo.filter(ImageFilter.GaussianBlur(radius=2 + et * 28))
        canvas = blurred.convert("RGBA")

        # Darken + navy wash
        wash = Image.new("RGBA", (W, H), (11, 18, 32, int(80 + et * 140)))
        canvas = Image.alpha_composite(canvas, wash)

        # Logo flows in from slightly larger / softer
        logo_scale = 1.18 - 0.18 * et
        lw, lh = int(logo.width * logo_scale), int(logo.height * logo_scale)
        logo_frame = logo.resize((lw, lh), Image.Resampling.LANCZOS)
        alpha = logo_frame.split()[3].point(lambda p: int(p * et))
        logo_frame.putalpha(alpha)

        px = (W - lw) // 2
        py = int(H * 0.38 - lh // 2 + (1 - et) * 60)
        canvas.paste(logo_frame, (px, py), logo_frame)

        # Soft gold glow behind logo
        glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        gdraw = ImageDraw.Draw(glow)
        cx, cy = W // 2, py + lh // 2
        for r in range(200, 0, -8):
            a = int(18 * et * (1 - r / 200))
            gdraw.ellipse([cx - r, cy - r // 2, cx + r, cy + r // 2], fill=(212, 160, 23, a))
        canvas = Image.alpha_composite(canvas, glow)

        frames.append(canvas.convert("RGB"))
    return frames


async def synth_vo(text: str, voice_key: str, out_path: Path) -> float:
    if not text.strip():
        out_path.write_bytes(b"")
        return 0.0

    voice, rate, pitch = VOICE_PROFILES[voice_key]
    parts = [p.strip() for p in text.split("...") if p.strip()]
    segs: list[Path] = []

    for i, part in enumerate(parts):
        seg = out_path.with_suffix(f".s{i}.mp3")
        await edge_tts.Communicate(part, voice, rate=rate, pitch=pitch).save(str(seg))
        segs.append(seg)

    if len(segs) == 1:
        segs[0].replace(out_path)
    else:
        inputs: list[str] = []
        filters: list[str] = []
        for i, seg in enumerate(segs):
            inputs += ["-i", str(seg)]
            filters.append(f"[{i}:a]apad=pad_dur=0.28[a{i}]")
        concat = "".join(f"[a{i}]" for i in range(len(segs)))
        run([
            "ffmpeg", "-y", *inputs,
            "-filter_complex", ";".join(filters) + f";{concat}concat=n={len(segs)}:v=0:a=1[out]",
            "-map", "[out]", str(out_path),
        ])
        for s in segs:
            s.unlink(missing_ok=True)

    polished = out_path.with_suffix(".pol.mp3")
    run([
        "ffmpeg", "-y", "-i", str(out_path),
        "-af", "highpass=f=80,equalizer=f=2500:width_type=h:width=1500:g=1.5,compand=0.3|0.7:6:-70/-60/-20/-8/-2/0:2:0:0,volume=1.1",
        str(polished),
    ])
    polished.replace(out_path)

    probe = run(
        ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(out_path)],
        capture_output=True, text=True,
    )
    return float(json.loads(probe.stdout)["format"]["duration"])


def ensure_thriller_bgm(path: Path, duration: float = 70) -> Path:
    if path.exists():
        return path
    run([
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", f"sine=frequency=55:duration={duration}",
        "-f", "lavfi", "-i", f"sine=frequency=82.5:duration={duration}",
        "-f", "lavfi", "-i", f"sine=frequency=110:duration={duration}",
        "-f", "lavfi", "-i", f"anoisesrc=color=brown:duration={duration}:amplitude=0.04",
        "-filter_complex",
        "[0][1][2]amix=inputs=3:duration=longest[v];"
        "[3]highpass=f=180,lowpass=f=1200[a];"
        "[v][a]amix=inputs=2:duration=longest,"
        "volume=0.12,"
        "tremolo=f=5:d=0.35,"
        "aecho=0.85:0.75:40:0.18,"
        "lowpass=f=3000",
        str(path),
    ])
    return path


def build_animated_clip(frames: list[Image.Image], vo_path: Path, vo_dur: float, out: Path) -> None:
    dur = max(vo_dur + 0.2, len(frames) / FPS)
    # Pad frames if VO longer
    while len(frames) / FPS < dur:
        frames.append(frames[-1])

    seq_dir = out.with_suffix(".frames")
    seq_dir.mkdir(exist_ok=True)
    for i, fr in enumerate(frames[: int(dur * FPS)]):
        fr.save(seq_dir / f"frame_{i:05d}.png")

    silent = out.with_suffix(".silent.mp4")
    run([
        "ffmpeg", "-y", "-framerate", str(FPS),
        "-i", str(seq_dir / "frame_%05d.png"),
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18",
        "-t", f"{dur:.3f}", str(silent),
    ])

    if vo_path.exists() and vo_path.stat().st_size > 0:
        run([
            "ffmpeg", "-y", "-i", str(silent), "-i", str(vo_path),
            "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
            "-shortest", str(out),
        ])
    else:
        run([
            "ffmpeg", "-y", "-i", str(silent),
            "-c:v", "copy", "-an", str(out),
        ])

    for f in seq_dir.glob("*.png"):
        f.unlink()
    seq_dir.rmdir()


def build_still_clip(frame: Image.Image, vo_path: Path, vo_dur: float, hold: float, out: Path) -> None:
    dur = max(hold, vo_dur + 0.25)
    tmp = out.with_suffix(".png")
    frame.save(tmp)
    if vo_path.exists() and vo_path.stat().st_size > 0:
        run([
            "ffmpeg", "-y", "-loop", "1", "-i", str(tmp), "-i", str(vo_path),
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18",
            "-c:a", "aac", "-b:a", "192k", "-t", f"{dur:.3f}", str(out),
        ])
    else:
        run([
            "ffmpeg", "-y", "-loop", "1", "-i", str(tmp),
            "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18",
            "-t", f"{dur:.3f}", "-an", str(out),
        ])
    tmp.unlink(missing_ok=True)


def mix_final(clips: list[Path], thriller: Path, piano: Path, logo_start: float, output: Path) -> None:
    lst = OUT / "clips.txt"
    lst.write_text("\n".join(f"file '{c}'" for c in clips))
    merged = OUT / "merged_story.mp4"
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", str(merged)])

    probe = run(
        ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(merged)],
        capture_output=True, text=True,
    )
    total = float(json.loads(probe.stdout)["format"]["duration"])
    fade = max(0.5, logo_start - 0.5)
    piano_in = logo_start

    run([
        "ffmpeg", "-y",
        "-i", str(merged),
        "-stream_loop", "-1", "-i", str(thriller),
        "-stream_loop", "-1", "-i", str(piano),
        "-filter_complex",
        f"[0:a]volume=1.0[vo];"
        f"[1:a]volume=0.22,afade=t=out:st={fade:.2f}:d=2.0[thr];"
        f"[2:a]volume=0.16,afade=t=in:st={piano_in:.2f}:d=1.5[pno];"
        f"[thr][pno]amix=inputs=2:duration=longest:dropout_transition=2[bg];"
        f"[vo][bg]amix=inputs=2:duration=first:weights=1 0.5[mix]",
        "-map", "0:v", "-map", "[mix]",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "192k",
        "-t", f"{total:.3f}", str(output),
    ])


async def main() -> None:
    for d in (AI_DIR, SCENES_DIR, AUDIO_DIR, FRAMES_DIR, CLIPS_DIR):
        d.mkdir(parents=True, exist_ok=True)

    ensure_ai_photos()
    logo = await asyncio.to_thread(ensure_logo)

    clips: list[Path] = []
    logo_start_time = 0.0
    elapsed = 0.0
    prev_photo = AI_DIR / "story-happy.png"

    for i, scene in enumerate(SCENES):
        vo_path = AUDIO_DIR / f"vo_{i:02d}_{scene['id']}.mp3"
        voice = scene.get("voice")
        if voice:
            vo_dur = await synth_vo(scene.get("vo", ""), voice, vo_path)
        else:
            vo_dur = 0.0
            vo_path.unlink(missing_ok=True)
        clip_path = CLIPS_DIR / f"clip_{i:02d}.mp4"

        if scene.get("brand_close"):
            logo_start_time = elapsed
            hold = scene.get("hold", 4.0)
            dur = max(hold, vo_dur + 0.3)
            n_frames = int(dur * FPS)
            frames = render_logo_frames(prev_photo, logo, n_frames)
            build_animated_clip(frames, vo_path, vo_dur, clip_path)
        else:
            photo = AI_DIR / scene["photo"]
            prev_photo = photo
            z0, z1 = scene.get("ken", (1.0, 1.06))
            hold = scene.get("hold")
            dur = max(hold or 0, vo_dur + 0.35)
            n_frames = max(int(dur * FPS), 15)
            frames = [render_photo_frame(photo, t / max(n_frames - 1, 1), z0, z1) for t in range(n_frames)]
            if hold and vo_dur == 0:
                build_animated_clip(frames, vo_path, 0, clip_path)
            else:
                build_animated_clip(frames, vo_path, vo_dur, clip_path)

        probe = run(
            ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(clip_path)],
            capture_output=True, text=True,
        )
        clip_dur = float(json.loads(probe.stdout)["format"]["duration"])
        elapsed += clip_dur
        clips.append(clip_path)
        print(f"Scene {scene['id']}: {clip_dur:.2f}s")

    thriller = ensure_thriller_bgm(AUDIO_DIR / "thriller.mp3")
    piano_src = Path("/opt/cursor/artifacts/neercred-promo-video/audio/piano.mp3")
    piano = AUDIO_DIR / "piano.mp3"
    if piano_src.exists() and not piano.exists():
        piano.write_bytes(piano_src.read_bytes())

    output = OUT / "neercred-wedding-story.mp4"
    mix_final(clips, thriller, piano, logo_start_time, output)

    workspace = ROOT / "artifacts" / "neercred-wedding-story.mp4"
    workspace.parent.mkdir(exist_ok=True)
    workspace.write_bytes(output.read_bytes())

    print(f"\n✅ Wedding story video: {output}")
    print(f"   Duration: {elapsed:.1f}s | {W}x{H}")


if __name__ == "__main__":
    asyncio.run(main())
