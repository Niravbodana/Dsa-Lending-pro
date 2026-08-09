#!/usr/bin/env python3
"""NeerCred Premium Promo v4 — cinematic fintech style, motion, pro audio."""

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
OUT = Path("/opt/cursor/artifacts/neercred-promo-video")
SCREENS = OUT / "screenshots"
ASSETS = OUT / "assets"
AUDIO = OUT / "audio"
FRAMES = OUT / "frames"
CLIPS = OUT / "clips"
DOWNLOAD = Path("/opt/cursor/artifacts")

W, H = 1920, 1080
FPS = 30
VOICE = "hi-IN-SwaraNeural"
PHONE_W, PHONE_H = 400, 866

C = {
    "navy": "#070D18",
    "navy2": "#0B1528",
    "teal": "#0D9488",
    "mint": "#2DD4BF",
    "gold": "#C9A227",
    "white": "#F8FAFC",
    "muted": "#94A3B8",
    "glass": (12, 20, 36, 210),
}

SCENES = [
    {
        "id": "intro", "screen": "01-homepage.png", "step": "WELCOME",
        "title": "NeerCred", "subtitle": "Dream Big. Borrow Smart.",
        "bullets": ["RBI LSP Registered Platform", "15+ Regulated Lenders", "Bank-grade Security"],
        "vo": "NeerCred par aapka swagat hai. India's premium personal loan marketplace.",
        "vo_hi": "NeerCred par aapka swagat hai.\nPremium personal loan marketplace.",
    },
    {
        "id": "home", "screen": "01-homepage.png", "step": "EXPLORE",
        "title": "One Platform.\nEvery Goal.",
        "subtitle": "Personal loans up to ₹20 Lakhs",
        "bullets": ["Compare HDFC, ICICI, Bajaj & more", "100% digital journey", "Rates from 10.99%"],
        "vo": "Ek platform, har financial goal. Personal loan bees lakh tak, fully digital.",
        "vo_hi": "Ek platform, har financial goal.\n₹20 lakh tak — fully digital.",
    },
    {
        "id": "apply", "screen": "02-apply.png", "step": "APPLY",
        "title": "Mobile\nVerification",
        "subtitle": "Secure OTP in 30 seconds",
        "bullets": ["DPDP Act compliant", "Encrypted session", "No spam ever"],
        "vo": "Apply par mobile number daaliye. SMS consent dekar continue kijiye — bilkul safe.",
        "vo_hi": "Mobile number daaliye.\nSMS consent dekar continue.\nBilkul safe.",
    },
    {
        "id": "otp", "screen": "03-otp.png", "step": "VERIFY",
        "title": "OTP\nConfirmed",
        "subtitle": "Instant identity verification",
        "bullets": ["6-digit secure OTP", "Session protected", "Continue in one tap"],
        "vo": "OTP enter karke verify kijiye. Secure aur fast — ek minute mein aage badhiye.",
        "vo_hi": "OTP enter karein, verify karein.\nSecure aur fast.",
    },
    {
        "id": "profile", "screen": "04-profile.png", "step": "PROFILE",
        "title": "Smart\nProfile",
        "subtitle": "PAN auto-fill from records",
        "bullets": ["One form, no repeat entry", "Minimal documentation", "Guided step by step"],
        "vo": "Profile complete kijiye. PAN se details auto fill — ek baar bhariye, baar baar nahi.",
        "vo_hi": "Profile complete karein.\nPAN se auto-fill.\nEk baar bhariye.",
    },
    {
        "id": "offers", "screen": "09-offers.png", "step": "COMPARE",
        "title": "Best Offers.\nOne Screen.",
        "subtitle": "Lowest rate · Lowest EMI",
        "bullets": ["50+ partner offers", "Transparent fees", "Select in one tap"],
        "vo": "Multiple lenders ke offers ek screen par. Best rate aur EMI compare karke select karein.",
        "vo_hi": "Multiple lenders ke offers.\nBest rate compare karein.\nEk tap mein select.",
    },
    {
        "id": "kyc", "screen": "10-kyc.png", "step": "KYC",
        "title": "Digital\nKYC",
        "subtitle": "Aadhaar · Bank · eSign",
        "bullets": ["UIDAI Aadhaar OTP", "Penny drop verify", "RBI compliant eSign"],
        "vo": "KYC poori tarah digital. Aadhaar OTP, bank verify, aur eSign ghar baithe.",
        "vo_hi": "KYC 100% digital.\nAadhaar, bank, eSign.\nGhar baithe complete.",
    },
    {
        "id": "trust", "screen": "06-compliance.png", "step": "TRUST",
        "title": "Built on\nTrust",
        "subtitle": "RBI LSP · DPDP · Transparent",
        "bullets": ["RBI LSP registered", "DPDP Act 2023", "Dedicated grievance redressal"],
        "vo": "RBI LSP registered, DPDP compliant, 256 bit encryption. Aapka data poori tarah safe.",
        "vo_hi": "RBI LSP registered.\nDPDP compliant.\nData poori tarah safe.",
    },
    {
        "id": "close", "screen": "11-dashboard.png", "step": "START NOW",
        "title": "Track &\nDisburse",
        "subtitle": "Real-time loan dashboard",
        "bullets": ["Live application status", "Pre-approved offers", "Apply in 5 minutes"],
        "vo": "Abhi apply karein NeerCred par. Dream Big, Borrow Smart. Aapka loan aapke haath mein.",
        "vo_hi": "Abhi apply karein NeerCred par.\nDream Big. Borrow Smart.",
    },
]


def run(cmd: list, **kw) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, check=True, **kw)


def rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def ensure_fonts() -> tuple[Path, Path]:
    ASSETS.mkdir(parents=True, exist_ok=True)
    urls = {
        "Poppins-Bold.ttf": "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Bold.ttf",
        "Poppins-Regular.ttf": "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Regular.ttf",
        "Poppins-SemiBold.ttf": "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-SemiBold.ttf",
    }
    for name, url in urls.items():
        p = ASSETS / name
        if not p.exists() or p.stat().st_size < 1000:
            urllib.request.urlretrieve(url, p)
    return ASSETS / "Poppins-Bold.ttf", ASSETS / "Poppins-Regular.ttf"


def font(sz: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    bold_p, reg_p = ensure_fonts()
    p = bold_p if bold else reg_p
    return ImageFont.truetype(str(p), sz)


def load_logo() -> Image.Image:
    p = ASSETS / "logo_white.png"
    if not p.exists():
        src = ASSETS / "logo.png"
        if not src.exists():
            svg = ROOT / "frontend/public/neercred-logo-header.svg"
            html = ASSETS / "logo_render.html"
            html.write_text(
                f'<!DOCTYPE html><html><head><style>body{{margin:0;background:#070D18;width:520px;height:110px;display:flex;align-items:center;justify-content:center}}</style></head><body>{svg.read_text(encoding="utf-8", errors="replace")}</body></html>'
            )
            run(
                ["npx", "playwright", "screenshot", "--browser", "chromium",
                 f"file://{html.resolve()}", str(src), "--viewport-size=520,110"],
                cwd=ROOT / "frontend",
            )
        img = Image.open(src).convert("RGBA")
        px = img.load()
        for y in range(img.height):
            for x in range(img.width):
                r, g, b, a = px[x, y]
                if r > 240 and g > 240 and b > 240:
                    px[x, y] = (0, 0, 0, 0)
        if img.getbbox():
            img = img.crop(img.getbbox())
        img.save(p)
    return Image.open(p).convert("RGBA")


def bg_canvas() -> Image.Image:
    c = Image.new("RGB", (W, H), rgb(C["navy"]))
    d = ImageDraw.Draw(c)
    for y in range(H):
        t = y / H
        col = tuple(
            int(rgb(C["navy"])[i] + (rgb(C["navy2"])[i] - rgb(C["navy"])[i]) * t)
            for i in range(3)
        )
        d.line([(0, y), (W, y)], fill=col)
    orbs = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(orbs)
    od.ellipse([W - 520, -120, W + 80, 480], fill=(13, 148, 136, 38))
    od.ellipse([-180, H - 420, 380, H + 80], fill=(45, 212, 191, 22))
    od.ellipse([W // 2 - 200, H // 2 - 100, W // 2 + 300, H // 2 + 200], fill=(201, 162, 39, 12))
    orbs = orbs.filter(ImageFilter.GaussianBlur(60))
    c.paste(orbs, (0, 0), orbs)
    return c


def fit_screen(path: Path) -> Image.Image:
    src = Image.open(path).convert("RGB")
    scale = min(PHONE_W / src.width, PHONE_H / src.height)
    nw, nh = int(src.width * scale), int(src.height * scale)
    r = src.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (PHONE_W, PHONE_H), "#0A0F1A")
    canvas.paste(r, ((PHONE_W - nw) // 2, (PHONE_H - nh) // 2))
    return canvas


def draw_phone(screen: Image.Image) -> Image.Image:
    bezel = 14
    pw, ph = PHONE_W + bezel * 2, PHONE_H + bezel * 2 + 36
    frame = Image.new("RGBA", (pw, ph), (0, 0, 0, 0))
    fd = ImageDraw.Draw(frame)
    for i in range(bezel):
        shade = 28 + i * 6
        fd.rounded_rectangle([i, i + 18, pw - 1 - i, ph - 1 - i], radius=52 - i, fill=(shade, shade, shade + 8, 255))
    fd.rounded_rectangle([bezel, bezel + 18, pw - bezel, ph - bezel], radius=44, fill=(6, 8, 14, 255))
    fd.rounded_rectangle([pw // 2 - 54, bezel + 6, pw // 2 + 54, bezel + 22], radius=10, fill=(2, 2, 4, 255))
    mask = Image.new("L", (PHONE_W, PHONE_H), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, PHONE_W - 1, PHONE_H - 1], radius=38, fill=255)
    scr = screen.convert("RGBA")
    scr.putalpha(mask)
    frame.paste(scr, (bezel, bezel + 18), scr)
    # subtle screen glare
    glare = Image.new("RGBA", (PHONE_W, PHONE_H), (0, 0, 0, 0))
    gd = ImageDraw.Draw(glare)
    gd.polygon([(0, 0), (PHONE_W // 2, 0), (0, PHONE_H // 2)], fill=(255, 255, 255, 18))
    frame.paste(glare, (bezel, bezel + 18), glare)
    return frame


def wrap_lines(text: str, fnt: ImageFont.FreeTypeFont, max_w: int) -> list[str]:
    lines: list[str] = []
    for block in text.split("\n"):
        words, cur = block.split(), ""
        for w in words:
            t = f"{cur} {w}".strip()
            m = ImageDraw.Draw(Image.new("RGB", (1, 1)))
            if m.textlength(t, font=fnt) <= max_w:
                cur = t
            else:
                if cur:
                    lines.append(cur)
                cur = w
        if cur:
            lines.append(cur)
    return lines or [text]


def render_frame(scene: dict, logo: Image.Image) -> Image.Image:
    c = bg_canvas()
    rgba = c.convert("RGBA")

    # Left copy
    lx, ly = 72, 130
    d = ImageDraw.Draw(rgba)
    step_f = font(13, bold=True)
    d.text((lx, ly), scene["step"], fill=rgb(C["teal"]), font=step_f)
    d.line([(lx, ly + 28), (lx + 56, ly + 28)], fill=rgb(C["mint"]), width=2)

    title_f = font(58, bold=True)
    y = ly + 52
    for line in scene["title"].split("\n"):
        d.text((lx, y), line, fill=rgb(C["white"]), font=title_f)
        y += 68

    sub_f = font(24)
    d.text((lx, y + 8), scene["subtitle"], fill=rgb(C["muted"]), font=sub_f)
    y += 56

    bullet_f = font(19)
    for b in scene["bullets"]:
        d.ellipse([lx, y + 8, lx + 8, y + 16], fill=rgb(C["mint"]))
        d.text((lx + 22, y), b, fill=rgb(C["white"]), font=bullet_f)
        y += 38

    # Logo top-right area
    lg = logo.copy()
    lg.thumbnail((200, 58), Image.Resampling.LANCZOS)
    rgba.paste(lg, (W - lg.width - 64, 48), lg)

    # Phone right
    sf = SCREENS / scene["screen"]
    if not sf.exists():
        sf = SCREENS / "01-homepage.png"
    phone = draw_phone(fit_screen(sf))
    px = int(W * 0.58) - phone.width // 2
    py = (H - phone.height) // 2 + 20
    sh = Image.new("RGBA", (phone.width + 80, phone.height + 80), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([30, 30, phone.width + 50, phone.height + 50], radius=60, fill=(0, 0, 0, 90))
    sh = sh.filter(ImageFilter.GaussianBlur(28))
    rgba.paste(sh, (px - 24, py + 16), sh)
    rgba.paste(phone, (px, py), phone)

    # Hindi VO caption bar
    bar_h = 118
    bar = Image.new("RGBA", (W, bar_h), C["glass"])
    bd = ImageDraw.Draw(bar)
    bd.line([(0, 0), (W, 0)], fill=rgb(C["teal"]) + (120,), width=2)
    cap_f = font(28, bold=True)
    cy = 24
    for line in wrap_lines(scene["vo_hi"], cap_f, W - 160):
        bd.text((80, cy), line, fill=rgb(C["white"]), font=cap_f)
        cy += 40
    rgba.paste(bar, (0, H - bar_h), bar)

    # Progress accent
    idx = SCENES.index(scene) + 1
    prog_w = int((W - 160) * idx / len(SCENES))
    bd2 = ImageDraw.Draw(rgba)
    bd2.rounded_rectangle([80, H - bar_h - 18, 80 + prog_w, H - bar_h - 12], radius=3, fill=rgb(C["gold"]))

    return rgba.convert("RGB")


async def make_vo(text: str, path: Path) -> float:
    await edge_tts.Communicate(text, VOICE, rate="+6%", pitch="+2Hz").save(str(path))
    tmp = path.with_suffix(".boost.mp3")
    run([
        "ffmpeg", "-y", "-i", str(path),
        "-af", "highpass=f=80,compand=0.3|0.8:6:-70/-60|-20/-15|0/-10,volume=3.5,alimiter=limit=0.97",
        "-ar", "44100", "-ac", "2", "-b:a", "192k", str(tmp),
    ])
    tmp.replace(path)
    r = run(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(path)], capture_output=True, text=True)
    return float(json.loads(r.stdout)["format"]["duration"])


def make_bgm(dur: float, path: Path) -> None:
    """Layered ambient piano pad — soft, not cartoon beeps."""
    chords = [
        (261.63, 329.63, 392.00),
        (293.66, 369.99, 440.00),
        (329.63, 415.30, 493.88),
        (261.63, 329.63, 392.00),
    ]
    seg_dur = 5.5
    segs: list[Path] = []
    n = int(dur / seg_dur) + 2
    for i in range(n):
        f1, f2, f3 = chords[i % len(chords)]
        s = AUDIO / f"ch{i}.wav"
        run([
            "ffmpeg", "-y",
            "-f", "lavfi", "-i", f"sine=f={f1}:duration={seg_dur}",
            "-f", "lavfi", "-i", f"sine=f={f2}:duration={seg_dur}",
            "-f", "lavfi", "-i", f"sine=f={f3}:duration={seg_dur}",
            "-filter_complex",
            f"[0][1][2]amix=inputs=3:duration=first,volume=0.07,"
            f"lowpass=f=900,afade=t=in:d=0.8,afade=t=out:st={seg_dur - 1.2}:d=1.2,"
            f"aecho=0.7:0.85:800:0.25[out]",
            "-map", "[out]", "-ar", "44100", "-ac", "2", str(s),
        ])
        segs.append(s)
    inp: list[str] = []
    for s in segs:
        inp += ["-i", str(s)]
    filt = "".join(f"[{j}:a]" for j in range(len(segs))) + f"concat=n={len(segs)}:v=0:a=1[out]"
    raw = AUDIO / "bgm_raw.wav"
    run(["ffmpeg", "-y", *inp, "-filter_complex", filt, "-map", "[out]", str(raw)])
    run([
        "ffmpeg", "-y", "-i", str(raw), "-t", f"{dur + 2:.2f}",
        "-af", f"volume=0.55,afade=t=in:d=2,afade=t=out:st={max(0, dur - 2):.2f}:d=2",
        "-ar", "44100", "-ac", "2", str(path),
    ])
    for s in segs:
        s.unlink(missing_ok=True)
    raw.unlink(missing_ok=True)


def render_clip(frame: Path, vo: Path, dur: float, idx: int) -> Path:
    CLIPS.mkdir(parents=True, exist_ok=True)
    out = CLIPS / f"scene_{idx:02d}.mp4"
    total = dur + 0.55
    frames = max(int(total * FPS), 1)
    z_end = 1.045
    z_expr = f"1+{z_end - 1:.4f}*on/{frames}"
    vf = (
        f"scale={W}:{H},"
        f"zoompan=z='{z_expr}':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
        f"d={frames}:s={W}x{H}:fps={FPS},"
        f"fade=t=in:st=0:d=0.35,fade=t=out:st={total - 0.4:.3f}:d=0.4"
    )
    run([
        "ffmpeg", "-y", "-loop", "1", "-i", str(frame), "-i", str(vo),
        "-vf", vf, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "14", "-preset", "medium",
        "-c:a", "aac", "-b:a", "256k", "-ar", "44100", "-ac", "2",
        "-shortest", "-t", f"{total:.3f}", str(out),
    ])
    return out


def concat_clips(clips: list[Path], out: Path) -> None:
    if len(clips) == 1:
        run(["ffmpeg", "-y", "-i", str(clips[0]), "-c", "copy", str(out)])
        return
    # xfade chain
    inputs: list[str] = []
    for c in clips:
        inputs += ["-i", str(c)]
    # get durations
    durs = []
    for c in clips:
        r = run(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(c)], capture_output=True, text=True)
        durs.append(float(json.loads(r.stdout)["format"]["duration"]))
    fade = 0.35
    parts = []
    offset = durs[0] - fade
    parts.append(f"[0:v][1:v]xfade=transition=fade:duration={fade}:offset={offset:.3f}[v1]")
    vprev = "v1"
    acc = offset
    for i in range(2, len(clips)):
        acc += durs[i - 1] - fade
        vnext = f"v{i}"
        parts.append(f"[{vprev}][{i}:v]xfade=transition=fade:duration={fade}:offset={acc:.3f}[{vnext}]")
        vprev = vnext
    vout = vprev
    # audio acrossfade
    aparts = ["[0:a][1:a]acrossfade=d=0.35:c1=tri:c2=tri[a1]"]
    aprev = "a1"
    for i in range(2, len(clips)):
        anext = f"a{i}"
        aparts.append(f"[{aprev}][{i}:a]acrossfade=d=0.35:c1=tri:c2=tri[{anext}]")
        aprev = anext
    filt = ";".join(parts + aparts)
    run([
        "ffmpeg", "-y", *inputs, "-filter_complex", filt,
        "-map", f"[{vout}]", "-map", f"[{aprev}]",
        "-c:v", "libx264", "-crf", "14", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "256k", str(out),
    ])


async def main() -> None:
    for d in (ASSETS, AUDIO, FRAMES, CLIPS, SCREENS, DOWNLOAD):
        d.mkdir(parents=True, exist_ok=True)

    logo = load_logo()
    clips: list[Path] = []
    vo_files: list[Path] = []
    total_dur = 0.0

    print("=== Premium VO + Frames ===")
    for i, scene in enumerate(SCENES):
        vo = AUDIO / f"vo_{scene['id']}.mp3"
        dur = await make_vo(scene["vo"], vo)
        vo_files.append(vo)
        total_dur += dur + 0.55
        fr = FRAMES / f"premium_{i:02d}.png"
        render_frame(scene, logo).save(fr, quality=95)
        clips.append(render_clip(fr, vo, dur, i))
        print(f"  {scene['id']}: {dur:.1f}s")

    vo_list = AUDIO / "vo_all.txt"
    vo_list.write_text("\n".join(f"file '{v}'" for v in vo_files))
    vo_full = DOWNLOAD / "NeerCred-Voice-Only.mp3"
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(vo_list), "-c", "copy", str(vo_full)])

    merged = OUT / "premium_merged.mp4"
    concat_clips(clips, merged)

    bgm = AUDIO / "bgm_premium.mp3"
    r = run(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(merged)], capture_output=True, text=True)
    vid_dur = float(json.loads(r.stdout)["format"]["duration"])
    make_bgm(vid_dur, bgm)

    h_out = DOWNLOAD / "NeerCred-Promo-PREMIUM-16x9.mp4"
    run([
        "ffmpeg", "-y", "-i", str(merged), "-i", str(bgm),
        "-filter_complex",
        "[0:a]volume=2.2[va];[1:a]volume=0.35,aloop=loop=-1:size=2e+09[vb];"
        "[va][vb]amix=inputs=2:duration=first:dropout_transition=0[aout]",
        "-map", "0:v:0", "-map", "[aout]",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-ar", "44100", "-ac", "2",
        "-movflags", "+faststart", str(h_out),
    ])

    v_out = DOWNLOAD / "NeerCred-Promo-PREMIUM-9x16.mp4"
    run([
        "ffmpeg", "-y", "-i", str(h_out),
        "-vf", "scale=1080:-2,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0x070D18",
        "-c:v", "libx264", "-crf", "14", "-pix_fmt", "yuv420p",
        "-c:a", "copy", "-movflags", "+faststart", str(v_out),
    ])

    ws = Path("/workspace/artifacts")
    ws.mkdir(parents=True, exist_ok=True)
    for src, name in [
        (h_out, "NeerCred-Promo-PREMIUM-16x9.mp4"),
        (v_out, "NeerCred-Promo-PREMIUM-9x16.mp4"),
        (vo_full, "NeerCred-Voice-Only.mp3"),
    ]:
        (ws / name).write_bytes(src.read_bytes())

    det = run(["ffmpeg", "-y", "-i", str(h_out), "-af", "volumedetect", "-f", "null", "-"], capture_output=True, text=True)
    for ln in det.stderr.split("\n"):
        if "volume" in ln.lower():
            print(" ", ln.strip())
    print(f"\n✅ PREMIUM VIDEO:\n   {h_out}\n   {v_out}\n   {vo_full}")


if __name__ == "__main__":
    asyncio.run(main())
