#!/usr/bin/env python3
"""
NeerCred promo v3 — dev.neercred.com flow, VO subtitles on side, full-fit phone, loud voice.
"""

from __future__ import annotations

import asyncio
import json
import subprocess
from pathlib import Path

import edge_tts
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = Path("/opt/cursor/artifacts/neercred-promo-video")
SCREENS = OUT / "screenshots"
ASSETS = OUT / "assets"
AUDIO = OUT / "audio"
FRAMES = OUT / "frames"

W, H = 1920, 1080
FPS = 30
VOICE = "hi-IN-SwaraNeural"

# Phone inner = exact capture size
PHONE_INNER_W, PHONE_INNER_H = 390, 844
PHONE_FRAME_W = PHONE_INNER_W + 28
PHONE_FRAME_H = PHONE_INNER_H + 100

BRAND = {
    "navy": "#0B1220",
    "teal": "#0F766E",
    "mint": "#14B8A6",
    "gold": "#D4A017",
    "white": "#FFFFFF",
    "slate": "#64748B",
    "light": "#F8FAFC",
    "sky": "#DBEAFE",
    "vo_bg": "#F0FDFA",
}

# Each scene: vo = exact words spoken (shown on left), screen = screenshot
SCENES = [
    {
        "id": "intro",
        "screen": "01-homepage.png",
        "step": "शुरुआत",
        "vo": "NeerCred par aapka swagat hai. Dream Big, Borrow Smart — India's trusted loan platform.",
        "vo_hi": "NeerCred par aapka swagat hai.\nDream Big, Borrow Smart.\nIndia ka trusted loan platform.",
    },
    {
        "id": "homepage",
        "screen": "01-homepage.png",
        "step": "Step 1",
        "vo": "Ek platform, har financial goal. Personal loans up to 20 lakh — fully digital, zero branch visit.",
        "vo_hi": "Ek platform, har financial goal.\nPersonal loan ₹20 lakh tak.\n100% digital — branch jaane ki zaroorat nahi.",
    },
    {
        "id": "how",
        "screen": "01b-how-it-works.png",
        "step": "Step 2",
        "vo": "Apply online, check eligibility, compare offers, complete KYC — sab kuch phone se.",
        "vo_hi": "Apply online karein.\nEligibility check karein.\nOffers compare karein.\nKYC complete karein — sab phone se.",
    },
    {
        "id": "mobile",
        "screen": "02-mobile.png",
        "step": "Step 3",
        "vo": "Apna email address daaliye. OTP aayega email par — safe aur encrypted.",
        "vo_hi": "Apna email address daaliye.\nOTP email par aayega.\nBilkul safe — encrypted aur secure.",
    },
    {
        "id": "otp",
        "screen": "03-otp.png",
        "step": "Step 4",
        "vo": "6 digit OTP enter karke verify kijiye. Secure verification — turant aage badhiye.",
        "vo_hi": "6 digit OTP enter karein.\nVerify kijiye.\nSecure verification — turant aage badhiye.",
    },
    {
        "id": "rates",
        "screen": "04-rates.png",
        "step": "Step 5",
        "vo": "Interest rates transparent hain — 10.99% se shuru. Koi hidden charges nahi.",
        "vo_hi": "Interest rates transparent hain.\n10.99% se shuru.\nKoi hidden charges nahi.",
    },
    {
        "id": "offers",
        "screen": "06b-offer-cards.png",
        "step": "Step 6",
        "vo": "Multiple lenders ke offers ek screen par. Best rate aur EMI compare karke select karein.",
        "vo_hi": "Multiple lenders ke offers\nek hi screen par.\nBest rate aur EMI compare karke\napna offer select karein.",
    },
    {
        "id": "kyc",
        "screen": "07-kyc.png",
        "step": "Step 7",
        "vo": "KYC poori tarah digital — Aadhaar OTP, bank verify, aur eSign ghar baithe.",
        "vo_hi": "KYC 100% digital hai.\nAadhaar OTP, bank verify,\naur eSign — ghar baithe.",
    },
    {
        "id": "trust",
        "screen": "06-compliance.png",
        "step": "Trust",
        "vo": "RBI LSP registered, DPDP compliant, 256-bit encryption — aapka data poori tarah safe.",
        "vo_hi": "RBI LSP registered platform.\nDPDP Act compliant.\n256-bit encryption —\naapka data poori tarah safe.",
    },
    {
        "id": "track",
        "screen": "07-track.png",
        "step": "Step 8",
        "vo": "Apna loan status track kijiye — real time update, dashboard par sab kuch.",
        "vo_hi": "Loan status track karein.\nReal time update.\nDashboard par sab kuch ek jagah.",
    },
    {
        "id": "close",
        "screen": "01-homepage.png",
        "step": "Apply Now",
        "vo": "Abhi apply karein NeerCred par. Dream Big, Borrow Smart — aapka loan, aapke haath mein.",
        "vo_hi": "Abhi apply karein NeerCred par.\nDream Big. Borrow Smart.\nAapka loan, aapke haath mein.",
    },
]


def run(cmd: list[str], **kw) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, check=True, **kw)


def rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def font(size: int, bold: bool = False):
    for p in [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]:
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def wrap_text(text: str, fnt, max_w: int) -> list[str]:
    lines: list[str] = []
    for paragraph in text.split("\n"):
        if not paragraph.strip():
            lines.append("")
            continue
        words = paragraph.split()
        cur = ""
        m = ImageDraw.Draw(Image.new("RGB", (1, 1)))
        for w in words:
            trial = f"{cur} {w}".strip()
            if m.textlength(trial, font=fnt) <= max_w:
                cur = trial
            else:
                if cur:
                    lines.append(cur)
                cur = w
        if cur:
            lines.append(cur)
    return lines or [text]


def load_logo() -> Image.Image:
    p = ASSETS / "neercred-logo.png"
    if not p.exists():
        # render from svg
        header = ROOT / "frontend" / "public" / "neercred-logo-header.svg"
        html = ASSETS / "logo.html"
        html.parent.mkdir(parents=True, exist_ok=True)
        html.write_text(f"""<!DOCTYPE html><html><head>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&display=swap" rel="stylesheet">
<style>body{{margin:0;background:transparent;width:480px;height:100px;display:flex;align-items:center;justify-content:center}}</style>
</head><body>{header.read_text(encoding='utf-8', errors='replace')}</body></html>""")
        run(["npx", "playwright", "screenshot", "--browser", "chromium",
             f"file://{html.resolve()}", str(p), "--viewport-size=480,100"], cwd=ROOT / "frontend")
        img = Image.open(p).convert("RGBA")
        px = img.load()
        for y in range(img.height):
            for x in range(img.width):
                r, g, b, a = px[x, y]
                if r > 240 and g > 240 and b > 240:
                    px[x, y] = (r, g, b, 0)
        bbox = img.getbbox()
        if bbox:
            img = img.crop(bbox)
        img.save(p)
    return Image.open(p).convert("RGBA")


def fit_screen_contain(img_path: Path) -> Image.Image:
    """Full-fit: entire screenshot visible inside phone, no crop."""
    src = Image.open(img_path).convert("RGB")
    # Scale to fit inside phone inner area
    scale = min(PHONE_INNER_W / src.width, PHONE_INNER_H / src.height)
    nw, nh = int(src.width * scale), int(src.height * scale)
    resized = src.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (PHONE_INNER_W, PHONE_INNER_H), BRAND["light"])
    canvas.paste(resized, ((PHONE_INNER_W - nw) // 2, (PHONE_INNER_H - nh) // 2))
    return canvas


def draw_phone(screen: Image.Image, cx: int, cy: int, base: Image.Image) -> None:
    """Premium phone frame with full-fit screen."""
    pw, ph = PHONE_FRAME_W, PHONE_FRAME_H
    px, py = cx - pw // 2, cy - ph // 2
    ix, iy = 14, 70
    sw, sh = PHONE_INNER_W, PHONE_INNER_H

    base_rgba = base.convert("RGBA")

    # Shadow
    shad = Image.new("RGBA", (pw + 50, ph + 50), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shad)
    sd.rounded_rectangle([20, 20, pw + 20, ph + 20], radius=50, fill=(0, 0, 0, 80))
    shad = shad.filter(ImageFilter.GaussianBlur(16))
    base_rgba.paste(shad, (px - 15, py + 12), shad)

    # Frame
    frame = Image.new("RGBA", (pw, ph), (0, 0, 0, 0))
    fd = ImageDraw.Draw(frame)
    fd.rounded_rectangle([0, 0, pw - 1, ph - 1], radius=46, fill=(20, 20, 30, 255), outline=(50, 50, 65, 255), width=2)
    # Notch
    fd.rounded_rectangle([pw // 2 - 60, 14, pw // 2 + 60, 34], radius=12, fill=(10, 10, 15, 255))
    # Home bar
    fd.rounded_rectangle([pw // 2 - 50, ph - 18, pw // 2 + 50, ph - 10], radius=4, fill=(255, 255, 255, 60))

    # Screen with rounded corners
    mask = Image.new("L", (sw, sh), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, sw - 1, sh - 1], radius=32, fill=255)
    screen_rgba = screen.convert("RGBA")
    screen_rgba.putalpha(mask)

    composed = frame.copy()
    composed.paste(screen_rgba, (ix, iy), screen_rgba)
    base_rgba.paste(composed, (px, py), composed)
    base.paste(base_rgba.convert("RGB"))


def render_left_panel(scene: dict, logo: Image.Image) -> Image.Image:
    """Left side: logo + step + VO subtitle (what lady speaks)."""
    lw = W // 2 - 20
    panel = Image.new("RGB", (lw, H), BRAND["light"])
    draw = ImageDraw.Draw(panel)

    # Gradient bg
    for y in range(H):
        t = y / H
        c = tuple(int(rgb("#F0F9FF")[i] + (255 - rgb("#F0F9FF")[i]) * t * 0.3) for i in range(3))
        draw.line([(0, y), (lw, y)], fill=c)

    panel_rgba = panel.convert("RGBA")
    lg = logo.copy()
    lg.thumbnail((220, 70), Image.Resampling.LANCZOS)
    panel_rgba.paste(lg, (50, 40), lg)
    draw = ImageDraw.Draw(panel_rgba)

    navy, teal, gold = rgb(BRAND["navy"]), rgb(BRAND["teal"]), rgb(BRAND["gold"])

    # Step pill
    step_font = font(16, bold=True)
    step = scene["step"]
    sw = draw.textlength(step, font=step_font)
    draw.rounded_rectangle([50, 125, 50 + sw + 24, 157], radius=14, fill=teal)
    draw.text((62, 131), step, fill=(255, 255, 255), font=step_font)

    # VO subtitle box — what the lady says (main focus)
    vo_text = scene.get("vo_hi", scene["vo"])
    box_x1, box_y1, box_x2, box_y2 = 40, 175, lw - 30, 720
    draw.rounded_rectangle([box_x1, box_y1, box_x2, box_y2], radius=20, fill=rgb(BRAND["vo_bg"]), outline=teal, width=2)

    # Speech icon + label
    draw.text((60, box_y1 + 18), "🎙️  Voice Guide", fill=teal, font=font(14, bold=True))

    # VO text — large, readable
    vo_font = font(28, bold=True)
    max_w = box_x2 - box_x1 - 40
    lines = wrap_text(vo_text, vo_font, max_w)
    y = box_y1 + 55
    for line in lines:
        if not line:
            y += 16
            continue
        draw.text((60, y), line, fill=navy, font=vo_font)
        y += 42

    # Trust strip
    draw.rounded_rectangle([40, H - 90, lw - 20, H - 45], radius=12, fill=rgb(BRAND["sky"]))
    draw.text((55, H - 82), "🔒 RBI LSP  ·  256-bit Encryption  ·  DPDP Compliant", fill=navy, font=font(13, bold=True))
    draw.rounded_rectangle([40, H - 35, 160, H - 29], radius=3, fill=gold)

    return panel_rgba.convert("RGB")


def render_scene(scene: dict, logo: Image.Image) -> Image.Image:
    canvas = Image.new("RGB", (W, H), BRAND["light"])

    # Right bg
    draw = ImageDraw.Draw(canvas)
    for y in range(H):
        t = y / H
        c = tuple(int(rgb("#E0F2FE")[i] + (rgb("#F8FAFC")[i] - rgb("#E0F2FE")[i]) * t) for i in range(3))
        draw.line([(W // 2, y), (W, y)], fill=c)

    left = render_left_panel(scene, logo)
    canvas.paste(left, (0, 0))

    draw = ImageDraw.Draw(canvas)
    draw.line([(W // 2, 30), (W // 2, H - 30)], fill=rgb(BRAND["mint"]), width=3)

    # Phone with full-fit screen
    screen_file = SCREENS / scene["screen"]
    if not screen_file.exists():
        for f in sorted(SCREENS.glob("*.png")):
            screen_file = f
            break
    screen = fit_screen_contain(screen_file)
    draw_phone(screen, int(W * 0.74), H // 2, canvas)

    return canvas


async def synth_vo(text: str, out: Path) -> float:
    comm = edge_tts.Communicate(text, VOICE, rate="+10%", pitch="+4Hz")
    await comm.save(str(out))
    # Boost voice — simple chain, no loudnorm that might silence
    boosted = out.with_suffix(".boosted.mp3")
    run([
        "ffmpeg", "-y", "-i", str(out),
        "-af", "highpass=f=80,volume=3.5,alimiter=limit=0.95",
        "-ar", "48000", "-ac", "2", "-b:a", "192k", str(boosted),
    ])
    boosted.replace(out)
    probe = run(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(out)],
                capture_output=True, text=True)
    return float(json.loads(probe.stdout)["format"]["duration"])


def make_bgm(duration: float, out: Path) -> None:
    notes = [261.63, 329.63, 392.0, 523.25, 440.0, 392.0, 329.63]
    segs = []
    i = 0
    t = 0.0
    while t < duration + 3:
        f = notes[i % len(notes)]
        seg = AUDIO / f"b{i:03d}.wav"
        run(["ffmpeg", "-y", "-f", "lavfi", "-i", f"sine=frequency={f}:duration=2.2",
             "-af", "volume=0.15,afade=t=in:d=0.3,afade=t=out:st=1.7:d=0.5",
             "-ar", "48000", "-ac", "2", str(seg)])
        segs.append(seg)
        i += 1
        t += 1.8
    inputs = []
    for s in segs:
        inputs += ["-i", str(s)]
    n = len(segs)
    filt = "".join(f"[{j}:a]" for j in range(n)) + f"concat=n={n}:v=0:a=1[a]"
    raw = AUDIO / "bgm_raw.wav"
    run(["ffmpeg", "-y", *inputs, "-filter_complex", filt, "-map", "[a]", str(raw)])
    run(["ffmpeg", "-y", "-i", str(raw), "-t", str(duration + 2),
         "-af", "volume=0.5,afade=t=in:d=2,afade=t=out:st={:.1f}:d=2".format(duration),
         "-ar", "48000", "-ac", "2", str(out)])
    for s in segs:
        s.unlink(missing_ok=True)
    raw.unlink(missing_ok=True)


def build_clip(frame: Path, vo: Path, dur: float, idx: int) -> Path:
    clip = OUT / f"v3_clip_{idx:02d}.mp4"
    total = dur + 0.5
    run([
        "ffmpeg", "-y", "-loop", "1", "-i", str(frame), "-i", str(vo),
        "-filter_complex", f"[0:v]scale={W}:{H},setsar=1,fps={FPS}[v]",
        "-map", "[v]", "-map", "1:a",
        "-c:v", "libx264", "-preset", "medium", "-pix_fmt", "yuv420p", "-crf", "16",
        "-c:a", "aac", "-b:a", "256k", "-ar", "48000", "-ac", "2",
        "-t", f"{total:.3f}", str(clip),
    ])
    return clip


def assemble(clips: list[Path], bgm: Path, output: Path) -> None:
    lst = OUT / "v3_concat.txt"
    lst.write_text("\n".join(f"file '{c}'" for c in clips))
    merged = OUT / "v3_merged.mp4"
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", str(merged)])

    probe = run(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(merged)],
                capture_output=True, text=True)
    dur = float(json.loads(probe.stdout)["format"]["duration"])

    # Simple reliable mix — voice LOUD, music quiet
    run([
        "ffmpeg", "-y",
        "-i", str(merged),
        "-i", str(bgm),
        "-filter_complex",
        f"[1:a]aloop=loop=-1:size=2e+09,atrim=0:{dur:.3f},volume=0.25[bg];"
        f"[0:a]volume=1.5[vo];"
        f"[vo][bg]amix=inputs=2:duration=first:dropout_transition=0[aout]",
        "-map", "0:v", "-map", "[aout]",
        "-c:v", "copy",
        "-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-ac", "2",
        "-movflags", "+faststart",
        str(output),
    ])


def make_vertical(src: Path, dst: Path) -> None:
    run([
        "ffmpeg", "-y", "-i", str(src),
        "-vf", "scale=1080:-2,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0xF0F9FF",
        "-c:v", "libx264", "-crf", "16", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "320k", "-ar", "48000", "-ac", "2",
        "-movflags", "+faststart", str(dst),
    ])


async def main() -> None:
    for d in (ASSETS, AUDIO, FRAMES, SCREENS):
        d.mkdir(parents=True, exist_ok=True)

    logo = load_logo()
    print("=== Voice + frames ===")
    durations = []
    for i, scene in enumerate(SCENES):
        vo = AUDIO / f"v3_vo_{i:02d}.mp3"
        d = await synth_vo(scene["vo"], vo)
        durations.append(d)
        print(f"  [{scene['id']}] {d:.1f}s — {scene['vo'][:50]}...")
        frame = FRAMES / f"v3_{i:02d}.png"
        render_scene(scene, logo).save(frame, quality=98)

    total = sum(durations) + len(SCENES) * 0.5
    print(f"\n=== BGM ({total:.0f}s) ===")
    bgm = AUDIO / "v3_bgm.wav"
    make_bgm(total, bgm)

    clips = [build_clip(FRAMES / f"v3_{i:02d}.png", AUDIO / f"v3_vo_{i:02d}.mp3", durations[i], i)
             for i in range(len(SCENES))]

    h_out = OUT / "neercred-promo-final-16x9.mp4"
    print("\n=== Assemble ===")
    assemble(clips, bgm, h_out)

    v_out = OUT / "neercred-promo-final-9x16.mp4"
    make_vertical(h_out, v_out)

    # Audit
    r = run(["ffmpeg", "-y", "-i", str(h_out), "-af", "volumedetect", "-f", "null", "-"],
            capture_output=True, text=True)
    for line in r.stderr.split("\n"):
        if "volume" in line.lower():
            print(" ", line.strip())

    for name, src in [
        ("neercred-promo-final-16x9.mp4", h_out),
        ("neercred-promo-final-9x16.mp4", v_out),
        ("neercred-promo-premium-16x9.mp4", h_out),
        ("neercred-promo-premium-9x16.mp4", v_out),
        ("neercred-promo-30s.mp4", v_out),
        ("neercred-promo-kreditbee-16x9.mp4", h_out),
        ("neercred-process-journey.mp4", v_out),
    ]:
        for dest in [Path("/opt/cursor/artifacts") / name, Path("/workspace/artifacts") / name,
                     ROOT / "frontend" / "public" / "videos" / name]:
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(src.read_bytes())

    print(f"\n✅ Final: {h_out}")


if __name__ == "__main__":
    asyncio.run(main())
