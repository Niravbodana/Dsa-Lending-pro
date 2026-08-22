#!/usr/bin/env python3
"""Premium NeerCred promo — real screenshots, logo, trust copy, loud female VO, piano BGM."""

from __future__ import annotations

import asyncio
import json
import subprocess
import textwrap
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
VO_RATE = "+8%"
VO_PITCH = "+3Hz"

BRAND = {
    "navy": "#0B1220",
    "teal": "#0F766E",
    "mint": "#14B8A6",
    "gold": "#D4A017",
    "white": "#FFFFFF",
    "slate": "#64748B",
    "light": "#F8FAFC",
    "sky": "#DBEAFE",
}

# Trust-first script — matches real website workflow
SCENES = [
    {
        "id": "intro",
        "screen": "01-homepage.png",
        "badge": "RBI LSP Registered Platform",
        "headline": "NeerCred",
        "sub": "Dream Big. Borrow Smart.",
        "trust": ["50,000+ customers trust NeerCred", "15+ regulated partner lenders", "256-bit bank-grade encryption"],
        "vo": "Neer Cred par aapka swagat hai. India's premium personal loan marketplace — sapna bada ho, loan lena ab smart aur easy.",
    },
    {
        "id": "homepage",
        "screen": "01-homepage.png",
        "badge": "Step 1 — Explore",
        "headline": "One Platform.\nEvery Financial Goal.",
        "sub": "Compare loans from HDFC, ICICI, Bajaj & more",
        "trust": ["Up to ₹20 Lakhs instant loans", "Soft check — no credit impact", "Zero branch visits"],
        "vo": "Homepage par aaiye. Ek platform, har financial goal. Multiple lenders ke offers ek hi jagah compare karein.",
    },
    {
        "id": "mobile",
        "screen": "02-mobile.png",
        "badge": "Step 2 — Mobile OTP",
        "headline": "Mobile Number\n& OTP Verify",
        "sub": "Secure SMS verification — DPDP compliant",
        "trust": ["OTP in 30 seconds", "Your data is encrypted", "No spam, ever"],
        "vo": "Apna mobile number daaliye. OTP aayega SMS par — bilkul safe, DPDP Act ke under protected.",
    },
    {
        "id": "otp",
        "screen": "03-otp.png",
        "badge": "Step 3 — Verify OTP",
        "headline": "One-Time\nPassword",
        "sub": "6-digit OTP on your mobile",
        "trust": ["Instant verification", "Session secured", "Continue your journey"],
        "vo": "OTP enter kijiye aur verify kijiye. Sirf ek minute — aur aap aage badh sakte hain.",
    },
    {
        "id": "profile",
        "screen": "04-profile-pan.png",
        "badge": "Step 4 — Profile",
        "headline": "PAN & Personal\nDetails",
        "sub": "Auto-fill from PAN records",
        "trust": ["PAN verified instantly", "One form, no repeat entry", "Minimal documentation"],
        "vo": "Profile complete kijiye. PAN se details auto-fill hoti hain — ek baar bhariye, baar baar nahi.",
    },
    {
        "id": "details",
        "screen": "05-profile-details.png",
        "badge": "Step 5 — Income & Purpose",
        "headline": "Income, Employment\n& Loan Purpose",
        "sub": "Personalized offers for your profile",
        "trust": ["Salaried & self-employed welcome", "Wedding, medical, travel & more", "Flexible tenure options"],
        "vo": "Income, employment aur loan purpose batayiye. Aapke profile ke hisaab se best offers milenge.",
    },
    {
        "id": "offers",
        "screen": "06b-offer-cards.png",
        "badge": "Step 6 — Compare Offers",
        "headline": "50+ Partner\nOffers Compared",
        "sub": "Lowest rate · Lowest EMI · Best match",
        "trust": ["HDFC, ICICI, Bajaj, Tata & more", "Transparent fees upfront", "Sort by rate or EMI"],
        "vo": "Ab offers compare karein. 50 se zyada partners ke offers ek screen par. Best rate, best EMI — sab transparent.",
    },
    {
        "id": "kyc",
        "screen": "07-kyc.png",
        "badge": "Step 7 — Digital KYC",
        "headline": "Aadhaar · Bank\n· eSign",
        "sub": "100% digital — from your phone",
        "trust": ["Aadhaar OTP via UIDAI", "Penny drop bank verify", "RBI compliant eSign"],
        "vo": "KYC poori tarah digital hai. Aadhaar OTP, bank verify, aur digital eSign — sab phone se, ghar baithe.",
    },
    {
        "id": "dashboard",
        "screen": "08-dashboard.png",
        "badge": "Step 8 — Track & Manage",
        "headline": "Dashboard &\nLoan Tracking",
        "sub": "Real-time status updates",
        "trust": ["Track every application", "Pre-approved offers", "Continue where you left off"],
        "vo": "Dashboard par apna loan track kijiye. Status, offers, sab kuch ek jagah — real time update.",
    },
    {
        "id": "trust",
        "screen": "10-compliance.png",
        "badge": "Built on Trust",
        "headline": "RBI LSP · DPDP\n· Full Transparency",
        "sub": "Regulated, secure, compliant",
        "trust": ["RBI LSP registered platform", "DPDP Act 2023 compliant", "Dedicated grievance redressal"],
        "vo": "Neer Cred par trust kijiye. RBI LSP registered, DPDP compliant, poori transparency — koi hidden charges nahi.",
    },
    {
        "id": "close",
        "screen": "01-homepage.png",
        "badge": "Apply Now",
        "headline": "dev.neercred.com",
        "sub": "Your loan journey starts here",
        "trust": ["Rates from 10.99% p.a.", "5 minute approval", "Made in India 🇮🇳"],
        "vo": "Abhi apply karein — dev dot neer cred dot com. Neer Cred — Dream Big, Borrow Smart.",
    },
]

PHONE_W, PHONE_H = 400, 820
SCREEN_INSET = (22, 78, 22, 28)  # left, top, right, bottom inside frame


def run(cmd: list[str], **kw) -> subprocess.CompletedProcess:
    print("$", " ".join(str(c) for c in cmd[:10]), "..." if len(cmd) > 10 else "")
    return subprocess.run(cmd, check=True, **kw)


def rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def font(size: int, bold: bool = False):
    paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for p in paths:
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def render_logo_png() -> Path:
    """Render actual NeerCred logo from website header screenshot."""
    logo = ASSETS / "neercred-logo.png"
    header = ROOT / "frontend" / "public" / "neercred-logo-header.svg"
    html = ASSETS / "logo.html"
    svg_text = header.read_text(encoding="utf-8", errors="replace")
    html.write_text(f"""<!DOCTYPE html><html><head>
<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&display=swap" rel="stylesheet">
<style>body{{margin:0;background:transparent;display:flex;align-items:center;justify-content:center;width:500px;height:120px}}</style>
</head><body>{svg_text}</body></html>""")
    run([
        "npx", "playwright", "screenshot", "--browser", "chromium",
        f"file://{html.resolve()}", str(logo), "--viewport-size=500,120",
    ], cwd=ROOT / "frontend")
    img = Image.open(logo).convert("RGBA")
    px = img.load()
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            if r > 240 and g > 240 and b > 240:
                px[x, y] = (r, g, b, 0)
    bbox = img.getbbox()
    if bbox:
        img = img.crop(bbox)
    img.save(logo)
    return logo


def fit_screen(img_path: Path, tw: int, th: int) -> Image.Image:
    src = Image.open(img_path).convert("RGB")
    scale = max(tw / src.width, th / src.height)
    nw, nh = int(src.width * scale), int(src.height * scale)
    src = src.resize((nw, nh), Image.Resampling.LANCZOS)
    left, top = (nw - tw) // 2, (nh - th) // 2
    return src.crop((left, top, left + tw, top + th))


def draw_premium_phone(base: Image.Image, screen_img: Image.Image, cx: int, cy: int) -> None:
    """Realistic iPhone-style frame with real screenshot inside."""
    pw, ph = PHONE_W, PHONE_H
    px, py = cx - pw // 2, cy - ph // 2
    il, it, ir, ib = SCREEN_INSET
    sw, sh = pw - il - ir, ph - it - ib

    # Drop shadow
    shadow = Image.new("RGBA", (pw + 60, ph + 60), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle([30, 30, pw + 30, ph + 30], radius=52, fill=(0, 0, 0, 70))
    shadow = shadow.filter(ImageFilter.GaussianBlur(18))
    base_rgba = base.convert("RGBA")
    base_rgba.paste(shadow, (px - 20, py + 10), shadow)

    # Frame gradient body
    frame = Image.new("RGBA", (pw, ph), (0, 0, 0, 0))
    fd = ImageDraw.Draw(frame)
    for y in range(ph):
        t = y / ph
        c = int(30 + t * 15)
        fd.line([(0, y), (pw, y)], fill=(c, c, c + 10, 255))
    mask = Image.new("L", (pw, ph), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, pw - 1, ph - 1], radius=48, fill=255)
    frame.putalpha(mask)

    # Screen content
    screen = screen_img.resize((sw, sh), Image.Resampling.LANCZOS)
    screen_mask = Image.new("L", (sw, sh), 0)
    ImageDraw.Draw(screen_mask).rounded_rectangle([0, 0, sw - 1, sh - 1], radius=36, fill=255)

    composed = frame.copy()
    composed.paste(screen, (il, it), screen_mask)

    # Notch + home bar overlay
    overlay = Image.new("RGBA", (pw, ph), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    od.rounded_rectangle([pw // 2 - 65, 16, pw // 2 + 65, 38], radius=14, fill=(0, 0, 0, 220))
    od.rounded_rectangle([pw // 2 - 55, ph - 20, pw // 2 + 55, ph - 12], radius=4, fill=(255, 255, 255, 80))
    # Side buttons
    od.rounded_rectangle([-2, 140, 4, 190], radius=2, fill=(60, 60, 70, 255))
    od.rounded_rectangle([-2, 220, 4, 270], radius=2, fill=(60, 60, 70, 255))
    od.rounded_rectangle([pw - 2, 180, pw + 4, 240], radius=2, fill=(60, 60, 70, 255))

    composed = Image.alpha_composite(composed, overlay)
    base_rgba.paste(composed, (px, py), composed)
    base.paste(base_rgba.convert("RGB"))


def draw_left_panel(scene: dict, logo: Image.Image) -> Image.Image:
    panel = Image.new("RGB", (W // 2 + 40, H), BRAND["light"])
    draw = ImageDraw.Draw(panel)

    # Subtle gradient
    for y in range(H):
        t = y / H
        c = tuple(int(rgb("#F0F9FF")[i] + (rgb("#FFFFFF")[i] - rgb("#F0F9FF")[i]) * t * 0.4) for i in range(3))
        draw.line([(0, y), (W // 2 + 40, y)], fill=c)

    panel_rgba = panel.convert("RGBA")

    # Logo
    lg = logo.copy()
    lg.thumbnail((240, 80), Image.Resampling.LANCZOS)
    panel_rgba.paste(lg, (60, 45), lg)

    draw = ImageDraw.Draw(panel_rgba)
    navy, teal, gold, slate = rgb(BRAND["navy"]), rgb(BRAND["teal"]), rgb(BRAND["gold"]), rgb(BRAND["slate"])

    # Badge
    badge_font = font(15, bold=True)
    badge = scene["badge"]
    bw = draw.textlength(badge, font=badge_font)
    draw.rounded_rectangle([60, 140, 60 + bw + 28, 172], radius=16, fill=teal)
    draw.text((74, 146), badge, fill=(255, 255, 255), font=badge_font)

    # Headline
    y = 195
    hf = font(48, bold=True)
    for line in scene["headline"].split("\n"):
        draw.text((60, y), line, fill=navy, font=hf)
        y += 58

    # Sub
    draw.text((60, y + 8), scene["sub"], fill=teal, font=font(22))

    # Trust bullets with checkmarks
    y += 55
    bf = font(17)
    for item in scene["trust"]:
        draw.ellipse([60, y + 4, 76, y + 20], fill=gold)
        draw.text((68, y + 2), "✓", fill=(255, 255, 255), font=font(11, bold=True))
        draw.text((88, y), item, fill=slate, font=bf)
        y += 36

    # RBI trust strip
    draw.rounded_rectangle([60, H - 100, W // 2, H - 50], radius=12, fill=rgb(BRAND["sky"]))
    draw.text((80, H - 88), "🔒 RBI LSP Registered  ·  256-bit Encryption  ·  DPDP Compliant", fill=navy, font=font(13, bold=True))

    # Gold accent
    draw.rounded_rectangle([60, H - 30, 180, H - 24], radius=3, fill=gold)

    return panel_rgba.convert("RGB")


def render_scene(scene: dict, logo_path: Path) -> Image.Image:
    canvas = Image.new("RGB", (W, H), BRAND["light"])

    # Right panel bg
    draw = ImageDraw.Draw(canvas)
    for y in range(H):
        t = y / H
        c = tuple(int(rgb("#E0F2FE")[i] + (rgb("#F8FAFC")[i] - rgb("#E0F2FE")[i]) * t) for i in range(3))
        draw.line([(W // 2, y), (W, y)], fill=c)

    # Left panel
    logo_img = Image.open(logo_path).convert("RGBA")
    left = draw_left_panel(scene, logo_img)
    canvas.paste(left, (0, 0))

    # Divider
    draw = ImageDraw.Draw(canvas)
    draw.line([(W // 2, 40), (W // 2, H - 40)], fill=rgb(BRAND["mint"]), width=3)

    # Phone with real screenshot
    screen_file = SCREENS / scene["screen"]
    if not screen_file.exists():
        # fallback
        for f in sorted(SCREENS.glob("*.png")):
            screen_file = f
            break
    sw = PHONE_W - SCREEN_INSET[0] - SCREEN_INSET[2]
    sh = PHONE_H - SCREEN_INSET[1] - SCREEN_INSET[3]
    screen = fit_screen(screen_file, sw, sh)
    draw_premium_phone(canvas, screen, int(W * 0.75), H // 2)

    # Teal glow behind phone
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gcx, gcy = int(W * 0.75), H // 2
    for r in range(350, 0, -6):
        a = int(14 * (1 - r / 350))
        gdraw.ellipse([gcx - r, gcy - r, gcx + r, gcy + r], fill=(*rgb(BRAND["teal"]), a))
    canvas = Image.alpha_composite(canvas.convert("RGBA"), glow).convert("RGB")

    return canvas


async def synth_vo(text: str, out: Path) -> float:
    await edge_tts.Communicate(text, VOICE, rate=VO_RATE, pitch=VO_PITCH).save(str(out))
    # Loud, clear voice processing
    polished = out.with_suffix(".p.mp3")
    run([
        "ffmpeg", "-y", "-i", str(out),
        "-af",
        "highpass=f=100,"
        "equalizer=f=3000:width_type=h:width=2000:g=4,"
        "compand=0.2|0.5:6:-80/-60/-20/-5/0:2:0:0,"
        "volume=3.2,"
        "loudnorm=I=-12:TP=-0.5:LRA=9",
        "-ar", "44100", "-ac", "2",
        str(polished),
    ])
    polished.replace(out)
    probe = run(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(out)],
                capture_output=True, text=True)
    return float(json.loads(probe.stdout)["format"]["duration"])


def generate_bgm(duration: float, out: Path) -> None:
    """Pleasant piano melody — clearly audible but under voice."""
    # C major arpeggio pattern
    notes = [261.63, 329.63, 392.00, 523.25, 659.25, 523.25, 392.00, 329.63]
    parts = []
    t = 0.0
    i = 0
    while t < duration + 2:
        freq = notes[i % len(notes)]
        dur = 2.0
        seg = AUDIO / f"n{i:04d}.wav"
        run([
            "ffmpeg", "-y", "-f", "lavfi",
            "-i", f"sine=frequency={freq}:duration={dur}",
            "-af", f"volume=0.12,afade=t=in:st=0:d=0.4,afade=t=out:st={dur-0.6}:d=0.6,lowpass=f=3000",
            "-ar", "44100", "-ac", "2", str(seg),
        ])
        parts.append(seg)
        # Flute harmonic
        flute = AUDIO / f"f{i:04d}.wav"
        run([
            "ffmpeg", "-y", "-f", "lavfi",
            "-i", f"sine=frequency={freq*2}:duration={dur*1.5}",
            "-af", f"volume=0.06,afade=t=in:st=0:d=0.6,afade=t=out:st={dur}:d=0.8,lowpass=f=2500",
            "-ar", "44100", "-ac", "2", str(flute),
        ])
        parts.append(flute)
        t += dur * 0.7
        i += 1

    inputs = []
    for p in parts:
        inputs += ["-i", str(p)]
    n = len(parts)
    filt = "".join(f"[{j}:a]" for j in range(n)) + f"amix=inputs={n}:duration=longest[a]"
    mixed = AUDIO / "bgm_raw.wav"
    run(["ffmpeg", "-y", *inputs, "-filter_complex", filt, "-map", "[a]", str(mixed)])
    run([
        "ffmpeg", "-y", "-i", str(mixed),
        "-af", f"apad=pad_dur={duration+3},afade=t=in:st=0:d=2,afade=t=out:st={duration}:d=3,volume=1.2",
        "-t", str(duration + 3), "-ar", "44100", "-ac", "2", str(out),
    ])
    for p in parts:
        p.unlink(missing_ok=True)
    mixed.unlink(missing_ok=True)


def build_clip(frame: Path, vo: Path, dur: float, idx: int) -> Path:
    clip = OUT / f"clip_{idx:02d}.mp4"
    total = dur + 0.4
    run([
        "ffmpeg", "-y", "-loop", "1", "-i", str(frame), "-i", str(vo),
        "-filter_complex", f"[0:v]scale={W}:{H},setsar=1,fps={FPS}[v]",
        "-map", "[v]", "-map", "1:a",
        "-c:v", "libx264", "-preset", "slow", "-pix_fmt", "yuv420p", "-crf", "15",
        "-c:a", "aac", "-b:a", "256k", "-ar", "44100", "-ac", "2",
        "-t", f"{total:.3f}", str(clip),
    ])
    return clip


def assemble(clips: list[Path], bgm: Path, output: Path) -> None:
    lst = OUT / "concat.txt"
    lst.write_text("\n".join(f"file '{c}'" for c in clips))
    merged = OUT / "merged_vo.mp4"
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", str(merged)])

    probe = run(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(merged)],
                capture_output=True, text=True)
    dur = float(json.loads(probe.stdout)["format"]["duration"])

    # Mix: voice dominant, music audible
    run([
        "ffmpeg", "-y", "-i", str(merged), "-i", str(bgm),
        "-filter_complex",
        f"[1:a]volume=0.45,afade=t=in:st=0:d=2,afade=t=out:st={dur-2:.1f}:d=2[bg];"
        "[0:a]volume=1.2[vo];"
        "[vo][bg]amix=inputs=2:duration=first:weights=1.2 0.5:normalize=0[aout]",
        "-map", "0:v", "-map", "[aout]",
        "-c:v", "libx264", "-preset", "slow", "-crf", "15", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "320k", "-ar", "44100", "-ac", "2",
        "-movflags", "+faststart",
        str(output),
    ])


def audit_audio(path: Path) -> dict:
    r = run([
        "ffmpeg", "-y", "-i", str(path), "-af", "volumedetect", "-f", "null", "-",
    ], capture_output=True, text=True)
    out = r.stderr
    mean = max_vol = None
    for line in out.split("\n"):
        if "mean_volume" in line:
            mean = line.split(":")[-1].strip()
        if "max_volume" in line:
            max_vol = line.split(":")[-1].strip()
    streams = run(["ffprobe", "-v", "quiet", "-show_streams", "-select_streams", "a", str(path)],
                  capture_output=True, text=True).stdout
    has_audio = "codec_type=audio" in streams
    return {"has_audio": has_audio, "mean_volume": mean, "max_volume": max_vol}


def make_vertical(src: Path, dst: Path) -> None:
    run([
        "ffmpeg", "-y", "-i", str(src),
        "-vf", "scale=1080:-2,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0xF0F9FF",
        "-c:v", "libx264", "-preset", "slow", "-crf", "15", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "256k", str(dst),
    ])


async def main() -> None:
    for d in (ASSETS, AUDIO, FRAMES, SCREENS):
        d.mkdir(parents=True, exist_ok=True)

    print("=== Rendering NeerCred logo ===")
    logo = render_logo_png()

    print("\n=== Generating voiceovers ===")
    durations = []
    for i, scene in enumerate(SCENES):
        vo = AUDIO / f"vo_{i:02d}.mp3"
        d = await synth_vo(scene["vo"], vo)
        durations.append(d)
        print(f"  [{scene['id']}] {d:.1f}s — {scene['vo'][:60]}...")

    total = sum(durations) + len(SCENES) * 0.4
    print(f"\n=== Generating BGM ({total:.0f}s) ===")
    bgm = AUDIO / "bgm.mp3"
    generate_bgm(total, bgm)

    print("\n=== Rendering frames ===")
    for i, scene in enumerate(SCENES):
        frame = FRAMES / f"frame_{i:02d}.png"
        render_scene(scene, logo).save(frame, quality=98)
        print(f"  frame {i}: {scene['screen']}")

    print("\n=== Building clips ===")
    clips = [build_clip(FRAMES / f"frame_{i:02d}.png", AUDIO / f"vo_{i:02d}.mp3", durations[i], i)
             for i in range(len(SCENES))]

    h_out = OUT / "neercred-promo-premium-16x9.mp4"
    print("\n=== Assembling final video ===")
    assemble(clips, bgm, h_out)

    v_out = OUT / "neercred-promo-premium-9x16.mp4"
    make_vertical(h_out, v_out)

    # Audit
    audit = audit_audio(h_out)
    print(f"\n=== Audio Audit ===")
    print(f"  Has audio: {audit['has_audio']}")
    print(f"  Mean volume: {audit['mean_volume']}")
    print(f"  Max volume: {audit['max_volume']}")

    # Deploy
    for name, src in [
        ("neercred-promo-kreditbee-16x9.mp4", h_out),
        ("neercred-promo-30s.mp4", v_out),
        ("neercred-process-journey.mp4", v_out),
        ("neercred-promo-premium-16x9.mp4", h_out),
        ("neercred-promo-premium-9x16.mp4", v_out),
    ]:
        for dest in [Path("/workspace/artifacts") / name, Path("/opt/cursor/artifacts") / name,
                     ROOT / "frontend" / "public" / "videos" / name]:
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(src.read_bytes())

    print(f"\n✅ Premium video ready: {h_out}")
    print(f"   Duration: {total:.0f}s | {len(SCENES)} scenes | Real UI screenshots")


if __name__ == "__main__":
    asyncio.run(main())
