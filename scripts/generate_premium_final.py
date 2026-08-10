#!/usr/bin/env python3
"""NeerCred Premium Promo v11 — original logo, approved scene, premium audio."""

from __future__ import annotations

import asyncio
import json
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

BGM_SOURCE = ASSETS / "soft_morning_keys_piano.mp3"

W, H = 1920, 1080
FPS = 30
VOICE = "en-IN-NeerjaNeural"
PHONE_W, PHONE_H = 400, 866

SCENES = [
    {
        "id": "intro", "screen": "01-homepage.png", "step": "WELCOME",
        "title": "NeerCred", "subtitle": "Dream Big. Borrow Smart.",
        "bullets": ["15+ trusted lender partners", "Compare rates in minutes", "100% digital journey"],
        "vo": "Hey there! Welcome to NeerCred. India's friendliest place to find the right personal loan for you.",
        "vo_hi": "Welcome to NeerCred.\nYour personal loan marketplace.",
    },
    {
        "id": "home", "screen": "01-homepage.png", "step": "EXPLORE",
        "title": "One Platform.\nEvery Goal.",
        "subtitle": "Personal loans up to ₹20 Lakhs",
        "bullets": ["Compare HDFC, ICICI, Bajaj and more", "Fully online — no branch visits", "Rates from 10.99%"],
        "vo": "Whether it's a wedding, a home upgrade, or that dream trip... one platform brings every option to you.",
        "vo_hi": "One platform, every goal.\nUp to twenty lakhs — fully digital.",
    },
    {
        "id": "apply", "screen": "02-apply-email.png", "step": "APPLY",
        "title": "Email\nVerification",
        "subtitle": "Secure OTP in your inbox",
        "bullets": ["Quick email verification", "Encrypted and private", "No spam, ever"],
        "vo": "Enter your email address and we'll send a secure OTP straight to your inbox. Quick, easy, and completely safe.",
        "vo_hi": "Enter your email.\nOTP to your inbox.\nQuick and secure.",
    },
    {
        "id": "otp", "screen": "03-otp-email.png", "step": "VERIFY",
        "title": "OTP\nConfirmed",
        "subtitle": "Instant email verification",
        "bullets": ["6-digit secure OTP", "Session protected", "Continue in one tap"],
        "vo": "Check your email, enter the OTP, and you're in. Takes less than a minute — we promise.",
        "vo_hi": "Enter OTP from email.\nLess than a minute.",
    },
    {
        "id": "profile", "screen": "04-profile.png", "step": "PROFILE",
        "title": "Smart\nProfile",
        "subtitle": "PAN auto-fill from records",
        "bullets": ["One form, no repeat entry", "Minimal documentation", "Guided step by step"],
        "vo": "Fill in your profile once. Your PAN details auto-fill, so you're not typing the same thing over and over.",
        "vo_hi": "Complete your profile.\nPAN auto-fill.\nFill once only.",
    },
    {
        "id": "offers", "screen": "09-offers.png", "step": "COMPARE",
        "title": "Best Offers.\nOne Screen.",
        "subtitle": "Lowest rate · Lowest EMI",
        "bullets": ["50+ partner offers", "Transparent fees", "Select in one tap"],
        "vo": "Now the fun part — compare offers from multiple lenders side by side. Pick the best rate and EMI that works for you.",
        "vo_hi": "Compare lender offers.\nBest rates on one screen.\nSelect in one tap.",
    },
    {
        "id": "kyc", "screen": "10-kyc.png", "step": "KYC",
        "title": "Digital\nKYC",
        "subtitle": "Aadhaar · Bank · eSign",
        "bullets": ["Aadhaar OTP verification", "Bank account verify", "Digital eSign from home"],
        "vo": "KYC is fully digital. Aadhaar OTP, bank verification, and eSign — all done from your couch.",
        "vo_hi": "Digital KYC.\nAadhaar, bank, eSign.\nAll from home.",
    },
    {
        "id": "dashboard", "screen": "11-dashboard.png", "step": "DASHBOARD",
        "title": "Welcome Back,\nRamprakash",
        "subtitle": "Real-time loan dashboard",
        "bullets": ["Live application status", "Pre-approved offers", "Track every step"],
        "vo": "Welcome back, Ramprakash! Your personalised dashboard keeps every application update right at your fingertips.",
        "vo_hi": "Welcome back, Ramprakash.\nYour loan dashboard.",
    },
    {
        "id": "approved", "screen": "12-approved.png", "step": "APPROVED",
        "title": "Congratulations!\nLoan Approved",
        "subtitle": "₹5,00,000 pre-approved",
        "bullets": ["Select your loan amount", "Instant disbursal eligible", "Funds in minutes"],
        "vo": "Congratulations! Your loan of five lakhs is approved. Select your loan amount and get disbursed within minutes on NeerCred.",
        "vo_hi": "Loan approved — five lakhs.\nSelect amount.\nDisbursed in minutes.",
    },
]

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


def run(cmd: list, **kw) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, check=True, **kw)


def rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def ensure_fonts() -> tuple[Path, Path, Path]:
    ASSETS.mkdir(parents=True, exist_ok=True)
    urls = {
        "Poppins-Bold.ttf": "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Bold.ttf",
        "Poppins-Regular.ttf": "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Regular.ttf",
        "NotoSansDevanagari-Bold.ttf": "https://github.com/google/fonts/raw/main/ofl/notosansdevanagari/NotoSansDevanagari%5Bwdth%2Cwght%5D.ttf",
    }
    for name, url in urls.items():
        p = ASSETS / name
        if not p.exists() or p.stat().st_size < 1000:
            urllib.request.urlretrieve(url, p)
    return ASSETS / "Poppins-Bold.ttf", ASSETS / "Poppins-Regular.ttf", ASSETS / "NotoSansDevanagari-Bold.ttf"


def font(sz: int, bold: bool = False, hindi: bool = False) -> ImageFont.FreeTypeFont:
    bold_p, reg_p, hi_p = ensure_fonts()
    if hindi and hi_p.exists():
        return ImageFont.truetype(str(hi_p), sz)
    p = bold_p if bold else reg_p
    return ImageFont.truetype(str(p), sz)


def load_logo() -> Image.Image:
    p = ASSETS / "logo_lockup_dark.png"
    svg = ROOT / "frontend/public/neercred-logo-lockup-dark.svg"
    if not p.exists() or p.stat().st_mtime < svg.stat().st_mtime:
        html = ASSETS / "logo_lockup_render.html"
        html.write_text(
            f'<!DOCTYPE html><html><head>'
            f'<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap" rel="stylesheet">'
            f'<style>body{{margin:0;padding:8px 6px;background:#070D18;width:240px;height:72px;'
            f'display:flex;align-items:center;justify-content:flex-start;box-sizing:border-box}}</style>'
            f'</head><body>{svg.read_text(encoding="utf-8", errors="replace")}</body></html>'
        )
        run(
            ["npx", "playwright", "screenshot", "--browser", "chromium",
             f"file://{html.resolve()}", str(p), "--viewport-size=240,72"],
            cwd=ROOT / "frontend",
        )
    img = Image.open(p).convert("RGBA")
    px = img.load()
    bg = rgb(C["navy"])
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            if abs(r - bg[0]) < 8 and abs(g - bg[1]) < 8 and abs(b - bg[2]) < 8:
                px[x, y] = (r, g, b, 0)
    if img.getbbox():
        img = img.crop(img.getbbox())
    # Add breathing room so star/icon never clips in video overlay
    pad = 6
    padded = Image.new("RGBA", (img.width + pad * 2, img.height + pad * 2), (0, 0, 0, 0))
    padded.paste(img, (pad, pad), img)
    return padded


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

    # Original logo — top-left corner with safe padding (no clipping)
    lg = logo.copy()
    target_h = 54
    scale = target_h / lg.height
    lg = lg.resize((int(lg.width * scale), target_h), Image.Resampling.LANCZOS)
    rgba.paste(lg, (56, 52), lg)

    # Left copy — below logo
    lx, ly = 72, 132
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

    # Phone right
    sf = SCREENS / scene["screen"]
    if not sf.exists():
        sf = SCREENS / "01-homepage.png"
    phone = draw_phone(fit_screen(sf))
    px = int(W * 0.58) - phone.width // 2
    py = (H - phone.height) // 2 + 8
    sh = Image.new("RGBA", (phone.width + 80, phone.height + 80), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([30, 30, phone.width + 50, phone.height + 50], radius=60, fill=(0, 0, 0, 90))
    sh = sh.filter(ImageFilter.GaussianBlur(28))
    rgba.paste(sh, (px - 24, py + 16), sh)
    rgba.paste(phone, (px, py), phone)

    # Caption bar — dynamic height, lifted from bottom so text never clips
    cap_f = font(24, bold=True)
    cap_lines: list[str] = []
    for block in scene["vo_hi"].split("\n"):
        cap_lines.extend(wrap_lines(block, cap_f, W - 160))
    line_h = 36
    pad_top, pad_bottom = 22, 24
    bar_h = pad_top + len(cap_lines) * line_h + pad_bottom
    margin_bottom = 72
    bar_y = H - bar_h - margin_bottom

    bar = Image.new("RGBA", (W, bar_h), C["glass"])
    bd = ImageDraw.Draw(bar)
    bd.line([(0, 0), (W, 0)], fill=rgb(C["teal"]) + (120,), width=2)
    cy = pad_top
    for line in cap_lines:
        bd.text((80, cy), line, fill=rgb(C["white"]), font=cap_f)
        cy += line_h
    rgba.paste(bar, (0, bar_y), bar)

    # Progress accent — sits just above caption bar
    idx = SCENES.index(scene) + 1
    prog_w = int((W - 160) * idx / len(SCENES))
    bd2 = ImageDraw.Draw(rgba)
    bd2.rounded_rectangle([80, bar_y - 14, 80 + prog_w, bar_y - 8], radius=3, fill=rgb(C["gold"]))

    return rgba.convert("RGB")


async def make_vo(text: str, path: Path) -> float:
    """Warm, conversational TTS — natural pace with subtle warmth."""
    await edge_tts.Communicate(text, VOICE, rate="-5%", pitch="+0Hz").save(str(path))
    tmp = path.with_suffix(".boost.mp3")
    run([
        "ffmpeg", "-y", "-i", str(path),
        "-af",
        "highpass=f=75,lowpass=f=14000,afftdn=nr=3:nf=-28,"
        "compand=0.25|0.75:5:-70/-58|-20/-10|0/-3,volume=3.0,"
        "aecho=0.8:0.88:12:0.12,alimiter=limit=0.94",
        "-ar", "44100", "-ac", "2", "-b:a", "192k", str(tmp),
    ])
    tmp.replace(path)
    r = run(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(path)], capture_output=True, text=True)
    return float(json.loads(r.stdout)["format"]["duration"])


def ensure_bgm_source() -> Path:
    ASSETS.mkdir(parents=True, exist_ok=True)
    if not BGM_SOURCE.exists() or BGM_SOURCE.stat().st_size < 50000:
        print("  Downloading Pixabay soft morning keys piano...")
        import subprocess
        subprocess.run(["python", str(ROOT / "scripts" / "download_pixabay_bgm.py")], check=True)
    return BGM_SOURCE


def make_bgm(dur: float, path: Path, drum_times: list[float] | None = None) -> None:
    """Soft morning keys piano — gentle, warm, human feel."""
    _ = drum_times
    src = ensure_bgm_source()
    processed = AUDIO / "bgm_processed.wav"
    run([
        "ffmpeg", "-y", "-i", str(src),
        "-af",
        "highpass=f=80,lowpass=f=8000,"
        "volume=1.05",
        str(processed),
    ])
    looped = AUDIO / "bgm_looped.wav"
    run([
        "ffmpeg", "-y", "-stream_loop", "-1", "-i", str(processed),
        "-t", f"{dur + 2:.2f}",
        "-af",
        f"loudnorm=I=-17:TP=-1.0:LRA=9,afade=t=in:d=3,afade=t=out:st={max(0, dur - 3):.2f}:d=3",
        str(looped),
    ])
    run([
        "ffmpeg", "-y", "-i", str(looped), "-t", f"{dur + 1:.2f}",
        "-ar", "44100", "-ac", "2", str(path),
    ])
    processed.unlink(missing_ok=True)
    looped.unlink(missing_ok=True)


def render_clip(frame: Path, vo: Path, dur: float, idx: int) -> Path:
    """Stable static frame — no zoompan (prevents screen shake/vibration)."""
    CLIPS.mkdir(parents=True, exist_ok=True)
    out = CLIPS / f"scene_{idx:02d}.mp4"
    total = dur + 0.55
    vf = (
        f"scale={W}:{H}:flags=lanczos,"
        f"fps={FPS},"
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
    scene_ends: list[float] = []
    acc = 0.0

    print("=== Premium VO + Frames (stable video) ===")
    for i, scene in enumerate(SCENES):
        vo = AUDIO / f"vo_{scene['id']}.mp3"
        dur = await make_vo(scene["vo"], vo)
        vo_files.append(vo)
        acc += dur + 0.55
        scene_ends.append(acc)
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
        "[0:a]highpass=f=100,lowpass=f=13000,volume=2.5[sp1];"
        "[sp1]asplit=2[sc][mx];"
        "[1:a]volume=0.72,aloop=loop=-1:size=2e+09[pi1];"
        "[pi1][sc]sidechaincompress=threshold=0.03:ratio=5:attack=40:release=450:makeup=2.5[du1];"
        "[mx][du1]amix=inputs=2:duration=first:weights=1 0.9:normalize=0,"
        "loudnorm=I=-16:TP=-1.0:LRA=11,alimiter=limit=0.96[aout]",
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
