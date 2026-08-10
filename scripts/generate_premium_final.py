#!/usr/bin/env python3
"""NeerCred Premium Promo v14 — brand style guide compliant."""

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

BGM_SOURCE = ASSETS / "soft_morning_keys_piano.mp3"

W, H = 1920, 1080
FPS = 30
VOICE = "en-IN-NeerjaNeural"
PHONE_W, PHONE_H = 400, 866
PHONE_X_RATIO = 0.655

# NeerCred Brand & Video Style Guide (dev.neercred.com)
SCENES = [
    {
        "id": "intro", "screen": "01-homepage.png", "step": "WELCOME",
        "title": "NeerCred", "subtitle": "Dream Big · Borrow Smart",
        "bullets": ["Digital Lending Aggregator", "Purity & Trust", "100% digital journey"],
        "vo": "Welcome to NeerCred — your digital lending aggregator. Dream big, borrow smart, and discover eligible loan offers from trusted partners.",
        "vo_hi": "Welcome to NeerCred.\nDream Big · Borrow Smart.",
    },
    {
        "id": "home", "screen": "01-homepage.png", "step": "EXPLORE",
        "title": "One Platform.\nEvery Goal.",
        "subtitle": "Eligible offers up to ₹20 Lakhs · indicative",
        "bullets": ["Compare HDFC, ICICI, Bajaj & more", "Fully online — no branch visits", "Rates from 10.99% p.a.*"],
        "vo": "Whether it's a wedding, a home upgrade, or that dream trip — one platform brings every eligible option to you.",
        "vo_hi": "One platform, every goal.\nEligible offers — fully digital.",
    },
    {
        "id": "apply", "screen": "02-apply-email.png", "step": "APPLY",
        "title": "Email\nVerification",
        "subtitle": "Secure OTP in your inbox",
        "bullets": ["Quick email verification", "Encrypted and private", "No spam, ever"],
        "vo": "Enter your email and we'll send a secure OTP straight to your inbox. Quick, easy, and completely safe.",
        "vo_hi": "Enter your email.\nOTP to your inbox.\nQuick and secure.",
    },
    {
        "id": "otp", "screen": "03-otp-email.png", "step": "VERIFY",
        "title": "OTP\nConfirmed",
        "subtitle": "Instant email verification",
        "bullets": ["6-digit secure OTP", "Session protected", "Continue in one tap"],
        "vo": "Check your email, enter the OTP, and you're in. Takes less than a minute.",
        "vo_hi": "Enter OTP from email.\nLess than a minute.",
    },
    {
        "id": "profile", "screen": "04-profile.png", "step": "PROFILE",
        "title": "PAN\nVerification",
        "subtitle": "Enter PAN to verify identity",
        "bullets": ["Secure identity check", "Minimal documentation", "Guided step by step"],
        "vo": "Enter your PAN number and complete your profile — one simple form with guided steps.",
        "vo_hi": "Enter PAN.\nComplete profile.\nOne simple form.",
    },
    {
        "id": "offers", "screen": "09-offers.png", "step": "COMPARE",
        "title": "Best Offers.\nOne Screen.",
        "subtitle": "Compare eligible rates · indicative EMI",
        "bullets": ["50+ partner offers", "Transparent fees", "Select in one tap"],
        "vo": "Now compare eligible offers from multiple lenders side by side. Pick the rate and EMI that works best for you.",
        "vo_hi": "Compare eligible offers.\nBest rates on one screen.",
    },
    {
        "id": "kyc", "layout": "celebration", "animation": "ekyc", "step": "KYC",
        "title": "Aadhaar\neKYC",
        "subtitle": "Verified on lender platform",
        "bullets": ["Lender-side secure verification", "Fast digital process", "Not on NeerCred app"],
        "vo": "Your Aadhaar eKYC is completed on your lender's secure platform. Verified and ready to go!",
        "vo_hi": "Aadhaar eKYC verified!\nLender platform.\nDone in seconds.",
    },
    {
        "id": "dashboard", "screen": "11-dashboard.png", "step": "DASHBOARD",
        "title": "Welcome Back,\nRamprakash",
        "subtitle": "Track your loan journey",
        "bullets": ["Live application status", "Eligible partner offers", "Track every step"],
        "vo": "Welcome back, Ramprakash! Your custom dashboard keeps every loan update right at your fingertips.",
        "vo_hi": "Welcome back, Ramprakash.\nYour loan dashboard.",
    },
    {
        "id": "approved", "screen": "12-approved.png", "step": "APPROVED",
        "title": "You May\nQualify! 🎉",
        "subtitle": "Up to ₹5,00,000 · indicative offer",
        "bullets": ["Select your loan amount", "Disbursal via lender", "Funds to your bank"],
        "vo": "Great news! You may qualify for up to five lakhs. Select your loan amount and move closer to disbursal on NeerCred.",
        "vo_hi": "You may qualify!\nUp to five lakhs.\nSelect your amount.",
    },
    {
        "id": "transfer", "layout": "celebration", "animation": "transfer", "step": "DISBURSE",
        "title": "Funds to\nYour Bank",
        "subtitle": "Real-time transfer in progress",
        "bullets": ["Direct to your bank account", "Secure lender disbursal", "Track every step"],
        "vo": "And just like that — funds are transferring straight to your bank account. Real-time, secure, and seamless.",
        "vo_hi": "Transferring to your bank.\nReal-time.\nSecure disbursal.",
    },
    {
        "id": "endcard", "layout": "endcard", "step": "NEERCRED",
        "title": "Dream Big.\nBorrow Smart.",
        "subtitle": "neercred.com",
        "bullets": [],
        "vo": "NeerCred — your digital lending aggregator. Dream big, borrow smart. Visit neercred.com to check your eligibility today.",
        "vo_hi": "Dream Big · Borrow Smart.\nneercred.com",
    },
]

C = {
    "navy": "#0B1220",
    "teal": "#0F766E",
    "teal_deep": "#134E4A",
    "cyan": "#0891B2",
    "mint": "#5EEAD4",
    "gold": "#D4A017",
    "gold_light": "#FDE68A",
    "bg_blue": "#E8F4FC",
    "white": "#F8FAFC",
    "muted": "#94A3B8",
    "glass": (11, 18, 32, 215),
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
            f'<style>body{{margin:0;padding:16px 12px;background:#070D18;width:280px;height:104px;'
            f'display:flex;align-items:center;justify-content:flex-start;box-sizing:border-box;overflow:visible}}</style>'
            f'</head><body>{svg.read_text(encoding="utf-8", errors="replace")}</body></html>'
        )
        run(
            ["npx", "playwright", "screenshot", "--browser", "chromium",
             f"file://{html.resolve()}", str(p), "--viewport-size=280,104"],
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
    # Generous transparent padding on all sides
    pad_x, pad_top, pad_bottom = 12, 16, 16
    padded = Image.new(
        "RGBA",
        (img.width + pad_x * 2, img.height + pad_top + pad_bottom),
        (0, 0, 0, 0),
    )
    padded.paste(img, (pad_x, pad_top), img)
    return padded


def ensure_animation_frames(cache_name: str, url: str, n: int = 54) -> list[Path]:
    """Capture animated promo page frames (cached)."""
    cache = ASSETS / f"{cache_name}_frames"
    cache.mkdir(parents=True, exist_ok=True)
    existing = sorted(cache.glob("frame_*.png"))
    if len(existing) >= n:
        return existing

    from playwright.sync_api import sync_playwright

    print(f"  Capturing {cache_name} animation frames...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 420, "height": 720}, device_scale_factor=2)
        ctx.add_init_script("""
            localStorage.setItem('neer_cookie_consent_v1', JSON.stringify({
              essential: true, analytics: false, savedAt: new Date().toISOString()
            }));
        """)
        page = ctx.new_page()
        page.goto(url, wait_until="domcontentloaded", timeout=30000)
        page.wait_for_function("document.fonts.ready", timeout=15000)
        page.evaluate("""() => {
          document.querySelectorAll('[class*="cookie"], [class*="Cookie"], [aria-label*="Cookie"]')
            .forEach(e => e.remove());
        }""")
        page.wait_for_timeout(800)
        paths: list[Path] = []
        for i in range(n):
            fp = cache / f"frame_{i:03d}.png"
            page.screenshot(path=str(fp), type="png", animations="allow")
            page.wait_for_timeout(65 if cache_name == "transfer" else 70)
            paths.append(fp)
        browser.close()
    return paths


def ensure_celebration_frames() -> list[Path]:
    return ensure_animation_frames("ekyc", "http://localhost:3000/promo-ekyc-approved")


def ensure_transfer_frames() -> list[Path]:
    return ensure_animation_frames("transfer", "http://localhost:3000/promo-transfer", n=60)


def celebration_panel_at(frame_paths: list[Path], t: float) -> Image.Image:
    """Pick celebration frame by animation time (loops every ~3.4s)."""
    if not frame_paths:
        return Image.new("RGBA", (420, 720), rgb(C["navy"]) + (255,))
    cycle = len(frame_paths)
    idx = int(t * cycle * 0.85) % cycle
    return Image.open(frame_paths[idx]).convert("RGBA")


def phone_position(phone_w: int, phone_h: int) -> tuple[int, int]:
    px = int(W * PHONE_X_RATIO) - phone_w // 2 + 18
    py = (H - phone_h) // 2 + 4
    return px, py


_bg_cache: Image.Image | None = None


def bg_canvas() -> Image.Image:
    """Brand hero gradient: Navy → Teal → Cyan — cached."""
    global _bg_cache
    if _bg_cache is None:
        c = Image.new("RGB", (W, H), rgb(C["navy"]))
        d = ImageDraw.Draw(c)
        c0, c1, c2 = rgb(C["navy"]), rgb(C["teal"]), rgb(C["cyan"])
        for y in range(H):
            t = y / H
            if t < 0.55:
                u = t / 0.55
                col = tuple(int(c0[i] + (c1[i] - c0[i]) * u) for i in range(3))
            else:
                u = (t - 0.55) / 0.45
                col = tuple(int(c1[i] + (c2[i] - c1[i]) * u) for i in range(3))
            d.line([(0, y), (W, y)], fill=col)
        orbs = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        od = ImageDraw.Draw(orbs)
        od.ellipse([W - 520, -120, W + 80, 480], fill=(15, 118, 110, 42))
        od.ellipse([-180, H - 420, 380, H + 80], fill=(94, 234, 212, 18))
        od.ellipse([W // 2 - 200, H // 2 - 100, W // 2 + 300, H // 2 + 200], fill=(212, 160, 23, 14))
        orbs = orbs.filter(ImageFilter.GaussianBlur(60))
        c.paste(orbs, (0, 0), orbs)
        _bg_cache = c
    return _bg_cache.copy()


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


def render_endcard(scene: dict, logo: Image.Image) -> Image.Image:
    """Full-frame brand end-card per style guide."""
    c = bg_canvas()
    rgba = c.convert("RGBA")
    d = ImageDraw.Draw(rgba)

    lg = logo.copy()
    scale = 72 / lg.height
    lg = lg.resize((int(lg.width * scale), 72), Image.Resampling.LANCZOS)
    rgba.paste(lg, ((W - lg.width) // 2, H // 2 - 160), lg)

    tag_f = font(18, bold=True)
    tag = "DREAM BIG · BORROW SMART"
    tw = ImageDraw.Draw(Image.new("RGB", (1, 1))).textlength(tag, font=tag_f)
    d.text(((W - tw) // 2, H // 2 - 68), tag, fill=rgb(C["gold_light"]), font=tag_f)

    val_f = font(14)
    val = "Purity & Trust"
    vw = ImageDraw.Draw(Image.new("RGB", (1, 1))).textlength(val, font=val_f)
    d.text(((W - vw) // 2, H // 2 - 38), val, fill=rgb(C["mint"]), font=val_f)

    site_f = font(42, bold=True)
    site = "neercred.com"
    sw = ImageDraw.Draw(Image.new("RGB", (1, 1))).textlength(site, font=site_f)
    d.text(((W - sw) // 2, H // 2 + 10), site, fill=rgb(C["white"]), font=site_f)

    leg_f = font(13)
    leg = "Nirav Enterprises, operating as NeerCred"
    lw = ImageDraw.Draw(Image.new("RGB", (1, 1))).textlength(leg, font=leg_f)
    d.text(((W - lw) // 2, H - 100), leg, fill=rgb(C["muted"]), font=leg_f)

    agg = "Digital Lending Aggregator · Financial Services Platform"
    aw = ImageDraw.Draw(Image.new("RGB", (1, 1))).textlength(agg, font=leg_f)
    d.text(((W - aw) // 2, H - 72), agg, fill=rgb(C["muted"]), font=leg_f)

    return rgba.convert("RGB")


def render_frame(
    scene: dict,
    logo: Image.Image,
    frame_t: float = 0.0,
    anim_frames: dict[str, list[Path]] | None = None,
    scene_idx: int = 0,
) -> Image.Image:
    if scene.get("layout") == "endcard":
        return render_endcard(scene, logo)

    anim_frames = anim_frames or {}
    c = bg_canvas()
    rgba = c.convert("RGBA")

    # Original logo — top-left with generous safe margin (never clip at frame edge)
    lg = logo.copy()
    target_h = 48
    scale = target_h / lg.height
    lg = lg.resize((int(lg.width * scale), target_h), Image.Resampling.LANCZOS)
    logo_x, logo_y = 64, 88
    rgba.paste(lg, (logo_x, logo_y), lg)

    # Left copy — starts below logo block
    lx, ly = 72, logo_y + target_h + 28
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

    # Right panel — phone mockup OR celebration card
    if scene.get("layout") == "celebration":
        key = scene.get("animation", "ekyc")
        frames = anim_frames.get(key, [])
        panel = celebration_panel_at(frames, frame_t)
        pw, ph = panel.width, panel.height
        scale = min(440 / pw, 820 / ph)
        nw, nh = int(pw * scale), int(ph * scale)
        panel = panel.resize((nw, nh), Image.Resampling.LANCZOS)
        px, py = phone_position(nw, nh)
        sh = Image.new("RGBA", (nw + 80, nh + 80), (0, 0, 0, 0))
        ImageDraw.Draw(sh).rounded_rectangle([30, 30, nw + 50, nh + 50], radius=40, fill=(15, 118, 110, 60))
        sh = sh.filter(ImageFilter.GaussianBlur(32))
        rgba.paste(sh, (px - 28, py + 12), sh)
        rgba.paste(panel, (px, py), panel)
    else:
        sf = SCREENS / scene["screen"]
        if not sf.exists():
            sf = SCREENS / "01-homepage.png"
        phone = draw_phone(fit_screen(sf))
        px, py = phone_position(phone.width, phone.height)
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

    # Progress accent
    prog_w = int((W - 160) * (scene_idx + 1) / len(SCENES))
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


def render_celebration_clip(
    scene: dict, logo: Image.Image, vo: Path, dur: float, idx: int,
    anim_frames: dict[str, list[Path]],
) -> Path:
    """Animated celebration scene — loops frames while VO plays."""
    CLIPS.mkdir(parents=True, exist_ok=True)
    out = CLIPS / f"scene_{idx:02d}.mp4"
    total = dur + 0.55
    n_frames = max(int(total * FPS), 30)
    seq_dir = CLIPS / f"celebration_seq_{idx}"
    seq_dir.mkdir(parents=True, exist_ok=True)
    for f in range(n_frames):
        t = f / n_frames
        img = render_frame(scene, logo, frame_t=t, anim_frames=anim_frames, scene_idx=idx)
        img.save(seq_dir / f"frame_{f:04d}.png", quality=92)
    vf = f"fade=t=in:st=0:d=0.35,fade=t=out:st={total - 0.4:.3f}:d=0.4"
    run([
        "ffmpeg", "-y", "-framerate", str(FPS), "-i", str(seq_dir / "frame_%04d.png"),
        "-i", str(vo),
        "-vf", vf, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "14", "-preset", "medium",
        "-c:a", "aac", "-b:a", "256k", "-ar", "44100", "-ac", "2",
        "-shortest", "-t", f"{total:.3f}", str(out),
    ])
    for fp in seq_dir.glob("*.png"):
        fp.unlink(missing_ok=True)
    seq_dir.rmdir()
    return out


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


async def main(anim_frames: dict[str, list[Path]]) -> None:
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
        render_frame(scene, logo, anim_frames=anim_frames, scene_idx=i).save(fr, quality=95)
        if scene.get("layout") == "celebration":
            clips.append(render_celebration_clip(scene, logo, vo, dur, i, anim_frames))
        else:
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
        "-vf", "scale=1080:-2,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0x0B1220",
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
    ekyc_frames = ensure_celebration_frames()
    transfer_frames = ensure_transfer_frames()
    anim_frames = {"ekyc": ekyc_frames, "transfer": transfer_frames}
    asyncio.run(main(anim_frames))
