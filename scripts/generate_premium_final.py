#!/usr/bin/env python3
"""NeerCred Premium Promo v22 — end-card voice + mobile-compatible MP4."""

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
V_SCALE = 2  # 4K vertical export: 2160×3840
W_V, H_V = 1080 * V_SCALE, 1920 * V_SCALE
FPS = 30
VOICE = "en-US-AvaNeural"  # Warm premium English female — same as pre-Hindi promo
VO_RATE = "-4%"
VO_PITCH = "+5Hz"
PHONE_W, PHONE_H = 400, 844
PHONE_W_V, PHONE_H_V = 520 * V_SCALE, 1064 * V_SCALE
PHONE_X_RATIO = 0.62
CAPTION_RESERVE = 200
CAPTION_RESERVE_V = 270 * V_SCALE
MARGIN_X_V = 52 * V_SCALE


def vfont(sz: int, bold: bool = False, hindi: bool = False) -> ImageFont.FreeTypeFont:
    return font(int(round(sz * V_SCALE)), bold, hindi=hindi)


def vsz(n: int | float) -> int:
    return int(round(n * V_SCALE))

# NeerCred Brand & Video Style Guide (dev.neercred.com)
SCENES = [
    {
        "id": "greeting", "layout": "greeting_full", "animation": "greeting", "step": "",
        "title": "", "subtitle": "", "bullets": [],
        "vo": "Welcome to NeerCred.",
        "vo_hi": "",
    },
    {
        "id": "intro", "screen": "01-homepage.png", "step": "WELCOME",
        "title": "NeerCred", "subtitle": "Dream Big · Borrow Smart",
        "bullets": ["Digital Lending Aggregator", "Purity & Trust", "100% digital journey"],
        "vo": "Your digital lending aggregator. Dream big, borrow smart, and discover eligible loan offers from trusted partners.",
        "vo_hi": "Dream Big · Borrow Smart.\nEligible offers from partners.",
    },
    {
        "id": "home", "screen": "01-homepage.png", "step": "EXPLORE",
        "title": "One Platform.\nEvery Goal.",
        "subtitle": "Eligible offers up to ₹15 Lakhs · indicative",
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
        "id": "approved", "screen": "12-approved.png", "step": "APPROVED",
        "title": "You May\nQualify! 🎉",
        "subtitle": "Up to ₹15,00,000 · indicative offer",
        "bullets": ["Select your loan amount", "Disbursal via lender", "Funds to your bank"],
        "vo": "Great news! You may qualify for up to fifteen lakhs. Select your loan amount and move closer to disbursal on NeerCred.",
        "vo_hi": "You may qualify!\nUp to fifteen lakhs.\nSelect your amount.",
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
        "id": "transfer", "layout": "celebration", "animation": "transfer", "step": "DISBURSE",
        "title": "Funds to\nYour Bank",
        "subtitle": "Quick same-day transfer in progress",
        "bullets": ["Direct to your bank account", "Fast lender disbursal", "Track every step"],
        "vo": "And just like that — funds are transferring straight to your bank account. Quick, secure, and often same-day.",
        "vo_hi": "Transferring to your bank.\nQuick and secure.\nSame-day disbursal.",
    },
    {
        "id": "endcard", "layout": "endcard_full", "animation": "endcard", "step": "NEERCRED",
        "title": "Dream Big.\nBorrow Smart.",
        "subtitle": "www.neercred.com",
        "bullets": [],
        "vo": "Apply now on neercred.com.",
        "duration": 9.0,
        "vo_hi": "Apply now on NeerCred.\nwww.neercred.com",
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
    """Transparent lockup — same render path as v11 (no dark box artifact)."""
    p = ASSETS / "logo_lockup_dark.png"
    svg = ROOT / "frontend/public/neercred-logo-lockup-dark.svg"
    bg_hex = C["navy"]
    if not p.exists() or p.stat().st_mtime < svg.stat().st_mtime:
        html = ASSETS / "logo_lockup_render.html"
        html.write_text(
            f'<!DOCTYPE html><html><head>'
            f'<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@700&display=swap" rel="stylesheet">'
            f'<style>body{{margin:0;padding:0;background:{bg_hex};width:220px;height:52px;'
            f'display:flex;align-items:center;justify-content:flex-start}}</style>'
            f'</head><body>{svg.read_text(encoding="utf-8", errors="replace")}</body></html>'
        )
        run(
            ["npx", "playwright", "screenshot", "--browser", "chromium",
             f"file://{html.resolve()}", str(p), "--viewport-size=220,52"],
            cwd=ROOT / "frontend",
        )
    img = Image.open(p).convert("RGBA")
    px = img.load()
    bg = rgb(bg_hex)
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            if abs(r - bg[0]) < 10 and abs(g - bg[1]) < 10 and abs(b - bg[2]) < 10:
                px[x, y] = (r, g, b, 0)
    if img.getbbox():
        img = img.crop(img.getbbox())
    return img


def load_logo_hires() -> Image.Image:
    """HD header lockup for greeting / end-card overlays."""
    p = ASSETS / "logo_header_dark_hires.png"
    svg = ROOT / "frontend/public/neercred-logo-header-dark.svg"
    bg_hex = C["navy"]
    if not p.exists() or p.stat().st_mtime < svg.stat().st_mtime:
        html = ASSETS / "logo_header_hires_render.html"
        html.write_text(
            f'<!DOCTYPE html><html><head>'
            f'<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">'
            f'<style>body{{margin:0;padding:0;background:{bg_hex};width:480px;height:162px;'
            f'display:flex;align-items:center;justify-content:center}}</style>'
            f'</head><body>{svg.read_text(encoding="utf-8", errors="replace")}</body></html>'
        )
        run(
            ["npx", "playwright", "screenshot", "--browser", "chromium",
             f"file://{html.resolve()}", str(p), "--viewport-size=480,162"],
            cwd=ROOT / "frontend",
        )
    img = Image.open(p).convert("RGBA")
    px = img.load()
    bg = rgb(bg_hex)
    for y in range(img.height):
        for x in range(img.width):
            r, g, b, a = px[x, y]
            if abs(r - bg[0]) < 10 and abs(g - bg[1]) < 10 and abs(b - bg[2]) < 10:
                px[x, y] = (r, g, b, 0)
    if img.getbbox():
        img = img.crop(img.getbbox())
    return img


def ease_out_cubic(t: float) -> float:
    t = max(0.0, min(1.0, t))
    return 1 - (1 - t) ** 3


def ensure_animation_frames(
    cache_name: str,
    url: str,
    n: int = 54,
    *,
    viewport_w: int = 420,
    viewport_h: int = 720,
    device_scale: int = 2,
) -> list[Path]:
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
        ctx = browser.new_context(
            viewport={"width": viewport_w, "height": viewport_h},
            device_scale_factor=device_scale,
        )
        ctx.add_init_script("""
            localStorage.setItem('neer_cookie_consent_v1', JSON.stringify({
              essential: true, analytics: false, savedAt: new Date().toISOString()
            }));
        """)
        if cache_name == "endcard":
            ctx.add_init_script("""
                document.addEventListener('DOMContentLoaded', () => {
                  document.querySelectorAll('.loan-guide-root, [class*="cookie"], [class*="Cookie"]')
                    .forEach(e => e.remove());
                });
            """)
        page = ctx.new_page()
        page.goto(url, wait_until="domcontentloaded", timeout=30000)
        page.wait_for_function("document.fonts.ready", timeout=15000)
        page.evaluate("""() => {
          document.querySelectorAll(
            '.loan-guide-root, [class*="cookie"], [class*="Cookie"], [aria-label*="Cookie"], ' +
            'nextjs-portal, [data-nextjs-toast], [data-next-mark], [data-nextjs-dev-tools-button], ' +
            '#__nextjs-dev-tools-menu, #__nextjs-build-indicator, button.fixed.bottom-6.left-6'
          ).forEach(e => e.remove());
        }""")
        page.wait_for_timeout(800)
        paths: list[Path] = []
        for i in range(n):
            fp = cache / f"frame_{i:03d}.png"
            page.screenshot(path=str(fp), type="png", animations="allow")
            page.wait_for_timeout(55 if cache_name == "endcard" else (65 if cache_name == "transfer" else 70))
            paths.append(fp)
        browser.close()
    return paths


def ensure_celebration_frames() -> list[Path]:
    return ensure_animation_frames("ekyc", "http://localhost:3000/promo-ekyc-approved")


def ensure_transfer_frames() -> list[Path]:
    return ensure_animation_frames("transfer", "http://localhost:3000/promo-transfer", n=60)


def ensure_endcard_frames() -> list[Path]:
    """Full HD end-card — vector-sharp logo + premium entrance animation."""
    return ensure_animation_frames(
        "endcard",
        "http://localhost:3000/promo-endcard",
        n=96,
        viewport_w=960,
        viewport_h=540,
        device_scale=2,
    )


def ensure_greeting_frames() -> list[Path]:
    """Full HD greeting — vector-sharp logo at 1920×1080."""
    return ensure_animation_frames(
        "greeting",
        "http://localhost:3000/promo-greeting",
        n=54,
        viewport_w=960,
        viewport_h=540,
        device_scale=2,
    )


def ensure_greeting_frames_vertical() -> list[Path]:
    """Native 4K 9:16 greeting for Instagram full-screen."""
    return ensure_animation_frames(
        "greeting_916",
        "http://localhost:3000/promo-greeting",
        n=54,
        viewport_w=1080,
        viewport_h=1920,
        device_scale=2,
    )


def ensure_endcard_frames_vertical() -> list[Path]:
    """Native 4K 9:16 end card for Instagram full-screen."""
    return ensure_animation_frames(
        "endcard_916",
        "http://localhost:3000/promo-endcard",
        n=96,
        viewport_w=1080,
        viewport_h=1920,
        device_scale=2,
    )


def celebration_panel_at(frame_paths: list[Path], t: float) -> Image.Image:
    """Pick celebration frame by animation time (loops every ~3.4s)."""
    if not frame_paths:
        return Image.new("RGBA", (420, 720), rgb(C["navy"]) + (255,))
    cycle = len(frame_paths)
    idx = int(t * cycle * 0.85) % cycle
    return Image.open(frame_paths[idx]).convert("RGBA")


def phone_position(phone_w: int, phone_h: int) -> tuple[int, int]:
    px = int(W * PHONE_X_RATIO) - phone_w // 2 + 12
    py = max(16, (H - CAPTION_RESERVE - phone_h) // 2)
    return px, py


def fit_phone_frame(phone: Image.Image) -> Image.Image:
    """Scale phone mockup so full device + footer stays above caption bar."""
    max_h = H - CAPTION_RESERVE - 24
    if phone.height <= max_h:
        return phone
    scale = max_h / phone.height
    nw, nh = int(phone.width * scale), int(phone.height * scale)
    return phone.resize((nw, nh), Image.Resampling.LANCZOS)


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


def bg_canvas_vertical() -> Image.Image:
    """Portrait brand gradient — fills 1080×1920 Instagram canvas."""
    c = Image.new("RGB", (W_V, H_V), rgb(C["navy"]))
    d = ImageDraw.Draw(c)
    c0, c1, c2 = rgb(C["navy"]), rgb(C["teal"]), rgb(C["cyan"])
    for y in range(H_V):
        t = y / H_V
        if t < 0.5:
            u = t / 0.5
            col = tuple(int(c0[i] + (c1[i] - c0[i]) * u) for i in range(3))
        else:
            u = (t - 0.5) / 0.5
            col = tuple(int(c1[i] + (c2[i] - c1[i]) * u) for i in range(3))
        d.line([(0, y), (W_V, y)], fill=col)
    orbs = Image.new("RGBA", (W_V, H_V), (0, 0, 0, 0))
    od = ImageDraw.Draw(orbs)
    od.ellipse([W_V - 380, -80, W_V + 120, 420], fill=(15, 118, 110, 48))
    od.ellipse([-120, H_V - 520, 360, H_V + 60], fill=(94, 234, 212, 22))
    od.ellipse([W_V // 2 - 280, H_V // 2 - 80, W_V // 2 + 280, H_V // 2 + 280], fill=(212, 160, 23, 16))
    orbs = orbs.filter(ImageFilter.GaussianBlur(70))
    c.paste(orbs, (0, 0), orbs)
    return c


def phone_position_vertical(phone_w: int, phone_h: int) -> tuple[int, int]:
    """Center phone horizontally; sit above caption safe zone."""
    px = (W_V - phone_w) // 2
    py = H_V - CAPTION_RESERVE_V - phone_h - vsz(36)
    py = max(vsz(420), min(py, H_V - CAPTION_RESERVE_V - phone_h - vsz(20)))
    return px, py


def fit_phone_frame_vertical(phone: Image.Image) -> Image.Image:
    max_h = H_V - CAPTION_RESERVE_V - vsz(400)
    if phone.height <= max_h:
        return phone
    scale = max_h / phone.height
    nw, nh = int(phone.width * scale), int(phone.height * scale)
    return phone.resize((nw, nh), Image.Resampling.LANCZOS)


def render_story_frame_vertical(anim_frames: dict[str, list[Path]], key: str, frame_t: float) -> Image.Image:
    """Full-frame Instagram Story beat — problem / swipe / solution."""
    frames = anim_frames.get(key, [])
    if not frames:
        return bg_canvas_vertical()
    cycle = len(frames)
    idx = min(int(frame_t * cycle * 0.92), cycle - 1)
    img = Image.open(frames[idx]).convert("RGB")
    if img.size != (W_V, H_V):
        img = img.resize((W_V, H_V), Image.Resampling.LANCZOS)
    return img


def render_greeting_frame_vertical(anim_frames: dict[str, list[Path]], frame_t: float) -> Image.Image:
    frames = anim_frames.get("greeting", [])
    if not frames:
        return bg_canvas_vertical()
    cycle = len(frames)
    idx = min(int(frame_t * cycle * 0.92), cycle - 1)
    img = Image.open(frames[idx]).convert("RGB")
    if img.size != (W_V, H_V):
        img = img.resize((W_V, H_V), Image.Resampling.LANCZOS)
    return img


def render_endcard_frame_vertical(anim_frames: dict[str, list[Path]], frame_t: float) -> Image.Image:
    frames = anim_frames.get("endcard", [])
    if not frames:
        return bg_canvas_vertical()
    cycle = len(frames)
    idx = min(int(frame_t * cycle * 0.92), cycle - 1)
    img = Image.open(frames[idx]).convert("RGB")
    if img.size != (W_V, H_V):
        img = img.resize((W_V, H_V), Image.Resampling.LANCZOS)
    return img


def render_frame_vertical(
    scene: dict,
    logo: Image.Image,
    frame_t: float = 0.0,
    anim_frames: dict[str, list[Path]] | None = None,
    scene_idx: int = 0,
    logo_hires: Image.Image | None = None,
    total_scenes: int | None = None,
) -> Image.Image:
    """Mobile-first 9:16 layout — full screen, no letterboxing."""
    if scene.get("layout") == "greeting_full":
        return render_greeting_frame_vertical(anim_frames or {}, frame_t)
    if scene.get("layout") == "endcard_full":
        return render_endcard_frame_vertical(anim_frames or {}, frame_t)
    if scene.get("layout") == "story_full":
        return render_story_frame_vertical(anim_frames or {}, scene.get("animation", ""), frame_t)

    n_scenes = total_scenes or len(SCENES)
    rgba = bg_canvas_vertical().convert("RGBA")
    d = ImageDraw.Draw(rgba)

    # Logo — top center
    lg = logo.copy()
    lg.thumbnail((vsz(240), vsz(44)), Image.Resampling.LANCZOS)
    rgba.paste(lg, ((W_V - lg.width) // 2, vsz(44)), lg)

    # Copy block — centered, compact
    max_text_w = W_V - MARGIN_X_V * 2
    y = vsz(108)
    step_f = vfont(18, bold=True)
    step_text = scene["step"]
    if step_text:
        tw = ImageDraw.Draw(Image.new("RGB", (1, 1))).textlength(step_text, font=step_f)
        d.text(((W_V - tw) // 2, y), step_text, fill=rgb(C["teal"]), font=step_f)
        y += vsz(34)

    title_f = vfont(46, bold=True)
    for line in scene["title"].split("\n"):
        tw = ImageDraw.Draw(Image.new("RGB", (1, 1))).textlength(line, font=title_f)
        d.text(((W_V - tw) // 2, y), line, fill=rgb(C["white"]), font=title_f)
        y += vsz(54)

    if scene.get("subtitle"):
        sub_f = vfont(21)
        for line in wrap_lines(scene["subtitle"], sub_f, max_text_w):
            tw = ImageDraw.Draw(Image.new("RGB", (1, 1))).textlength(line, font=sub_f)
            d.text(((W_V - tw) // 2, y), line, fill=rgb(C["muted"]), font=sub_f)
            y += vsz(30)
        y += vsz(8)

    bullet_f = vfont(17)
    for b in scene["bullets"][:3]:
        tw = ImageDraw.Draw(Image.new("RGB", (1, 1))).textlength(f"• {b}", font=bullet_f)
        d.text(((W_V - tw) // 2, y), f"• {b}", fill=rgb(C["white"]), font=bullet_f)
        y += vsz(30)

    # Phone / celebration — centered, large
    if scene.get("layout") == "celebration":
        key = scene.get("animation", "ekyc")
        frames = anim_frames.get(key, [])
        panel = celebration_panel_at(frames, frame_t)
        scale = min(PHONE_W_V / panel.width, (H_V - CAPTION_RESERVE_V - y - vsz(40)) / panel.height)
        nw, nh = int(panel.width * scale), int(panel.height * scale)
        panel = panel.resize((nw, nh), Image.Resampling.LANCZOS)
        phone_like = Image.new("RGBA", (nw, nh), (0, 0, 0, 0))
        phone_like.paste(panel, (0, 0), panel)
        phone_like = fit_phone_frame_vertical(phone_like)
    else:
        sf = SCREENS / scene["screen"]
        if not sf.exists():
            sf = SCREENS / "01-homepage.png"
        # Temporarily use larger phone canvas for vertical
        global PHONE_W, PHONE_H
        old_w, old_h = PHONE_W, PHONE_H
        PHONE_W, PHONE_H = PHONE_W_V, PHONE_H_V
        phone = fit_phone_frame_vertical(draw_phone(fit_screen(sf)))
        PHONE_W, PHONE_H = old_w, old_h
        phone_like = phone

    nw, nh = phone_like.width, phone_like.height
    px, py = phone_position_vertical(nw, nh)
    sh = Image.new("RGBA", (nw + vsz(60), nh + vsz(60)), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([vsz(20), vsz(20), nw + vsz(40), nh + vsz(40)], radius=vsz(48), fill=(0, 0, 0, 80))
    sh = sh.filter(ImageFilter.GaussianBlur(vsz(24)))
    rgba.paste(sh, (px - vsz(20), py + vsz(10)), sh)
    rgba.paste(phone_like, (px, py), phone_like)

    # Caption bar — bottom safe area (Instagram UI margin)
    cap_f = vfont(22, bold=True)
    cap_lines: list[str] = []
    for block in scene["vo_hi"].split("\n"):
        cap_lines.extend(wrap_lines(block, cap_f, W_V - vsz(96)))
    line_h = vsz(34)
    pad_top, pad_bottom = vsz(20), vsz(28)
    bar_h = pad_top + len(cap_lines) * line_h + pad_bottom
    bar_y = H_V - bar_h - vsz(88)

    bar = Image.new("RGBA", (W_V, bar_h), C["glass"])
    bd = ImageDraw.Draw(bar)
    bd.line([(0, 0), (W_V, 0)], fill=rgb(C["teal"]) + (120,), width=vsz(2))
    cy = pad_top
    for line in cap_lines:
        tw = ImageDraw.Draw(Image.new("RGB", (1, 1))).textlength(line, font=cap_f)
        bd.text(((W_V - tw) // 2, cy), line, fill=rgb(C["white"]), font=cap_f)
        cy += line_h
    rgba.paste(bar, (0, bar_y), bar)

    prog_w = int((W_V - vsz(96)) * (scene_idx + 1) / n_scenes)
    bd2 = ImageDraw.Draw(rgba)
    bd2.rounded_rectangle([(W_V - prog_w) // 2, bar_y - vsz(12), (W_V + prog_w) // 2, bar_y - vsz(6)], radius=vsz(3), fill=rgb(C["gold"]))

    return rgba.convert("RGB")


def fit_screen(path: Path) -> Image.Image:
    """Fit mobile screenshot — contain within phone, top-aligned (header never clipped)."""
    src = Image.open(path).convert("RGB")
    scale = min(PHONE_W / src.width, PHONE_H / src.height)
    nw, nh = int(src.width * scale), int(src.height * scale)
    r = src.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (PHONE_W, PHONE_H), "#F8FAFC")
    ox = (PHONE_W - nw) // 2
    canvas.paste(r, (ox, 0))
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


def render_greeting_frame(anim_frames: dict[str, list[Path]], frame_t: float) -> Image.Image:
    """Full-frame HD greeting from browser-captured animation."""
    frames = anim_frames.get("greeting", [])
    if not frames:
        return bg_canvas()
    cycle = len(frames)
    idx = min(int(frame_t * cycle * 0.92), cycle - 1)
    img = Image.open(frames[idx]).convert("RGB")
    if img.size != (W, H):
        img = img.resize((W, H), Image.Resampling.LANCZOS)
    return img


def render_endcard_frame(anim_frames: dict[str, list[Path]], frame_t: float) -> Image.Image:
    """Full-frame HD end card from browser-captured animation."""
    frames = anim_frames.get("endcard", [])
    if not frames:
        return bg_canvas()
    cycle = len(frames)
    idx = min(int(frame_t * cycle * 0.92), cycle - 1)
    img = Image.open(frames[idx]).convert("RGB")
    if img.size != (W, H):
        img = img.resize((W, H), Image.Resampling.LANCZOS)
    return img


def render_frame(
    scene: dict,
    logo: Image.Image,
    frame_t: float = 0.0,
    anim_frames: dict[str, list[Path]] | None = None,
    scene_idx: int = 0,
    logo_hires: Image.Image | None = None,
) -> Image.Image:
    if scene.get("layout") == "greeting_full":
        return render_greeting_frame(anim_frames or {}, frame_t)
    if scene.get("layout") == "endcard_full":
        return render_endcard_frame(anim_frames or {}, frame_t)

    anim_frames = anim_frames or {}
    c = bg_canvas()
    rgba = c.convert("RGBA")

    # Original logo — top-left, N icon + NeerCred on one line (v11 placement)
    lg = logo.copy()
    lg.thumbnail((280, 50), Image.Resampling.LANCZOS)
    rgba.paste(lg, (48, 32), lg)

    # Left copy
    lx, ly = 72, 118
    d = ImageDraw.Draw(rgba)
    step_f = font(20, bold=True)
    d.text((lx, ly), scene["step"], fill=rgb(C["teal"]), font=step_f)
    d.line([(lx, ly + 36), (lx + 96, ly + 36)], fill=rgb(C["mint"]), width=3)

    title_f = font(58, bold=True)
    y = ly + 58
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
        scale = min(420 / pw, 780 / ph)
        nw, nh = int(pw * scale), int(ph * scale)
        panel = panel.resize((nw, nh), Image.Resampling.LANCZOS)
        phone_like = Image.new("RGBA", (nw, nh), (0, 0, 0, 0))
        phone_like.paste(panel, (0, 0), panel)
        phone_like = fit_phone_frame(phone_like)
        nw, nh = phone_like.width, phone_like.height
        px, py = phone_position(nw, nh)
        sh = Image.new("RGBA", (nw + 80, nh + 80), (0, 0, 0, 0))
        ImageDraw.Draw(sh).rounded_rectangle([30, 30, nw + 50, nh + 50], radius=40, fill=(15, 118, 110, 60))
        sh = sh.filter(ImageFilter.GaussianBlur(32))
        rgba.paste(sh, (px - 28, py + 12), sh)
        rgba.paste(phone_like, (px, py), phone_like)
    else:
        sf = SCREENS / scene["screen"]
        if not sf.exists():
            sf = SCREENS / "01-homepage.png"
        phone = fit_phone_frame(draw_phone(fit_screen(sf)))
        px, py = phone_position(phone.width, phone.height)
        sh = Image.new("RGBA", (phone.width + 80, phone.height + 80), (0, 0, 0, 0))
        ImageDraw.Draw(sh).rounded_rectangle([30, 30, phone.width + 50, phone.height + 50], radius=60, fill=(0, 0, 0, 90))
        sh = sh.filter(ImageFilter.GaussianBlur(28))
        rgba.paste(sh, (px - 24, py + 16), sh)
        rgba.paste(phone, (px, py), phone)

    # Caption bar — skip on full-frame greeting
    if scene.get("layout") in ("greeting_full", "greeting"):
        return rgba.convert("RGB")

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


def brand_voice_text(text: str) -> str:
    """TTS-friendly brand pronunciation — Neer Cred (not Near Cred)."""
    text = text.replace("NeerCred", "Neer Cred")
    text = text.replace("www.neercred.com", "www dot Neer Cred dot com")
    text = text.replace("neercred.com", "Neer Cred dot com")
    return text


def mobile_encode_args() -> list[str]:
    """H.264 Main + AAC-LC — plays on iPhone & Android gallery/WhatsApp."""
    return [
        "-c:v", "libx264", "-profile:v", "main", "-level", "4.0",
        "-pix_fmt", "yuv420p", "-crf", "14", "-preset", "slow",
        "-movflags", "+faststart", "-tag:v", "avc1",
        "-c:a", "aac", "-b:a", "128k", "-ar", "44100", "-ac", "2",
        "-brand", "mp42", "-map_metadata", "-1",
    ]


def finalize_mobile_mp4(src: Path, dst: Path, vf: str | None = None) -> None:
    cmd = ["ffmpeg", "-y", "-i", str(src)]
    if vf:
        cmd += ["-vf", vf]
    cmd += mobile_encode_args()
    cmd.append(str(dst))
    run(cmd)


def make_silent_audio(dur: float, path: Path) -> float:
    """Silent track — scene plays with BGM only."""
    run([
        "ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo",
        "-t", f"{dur:.3f}", "-c:a", "libmp3lame", "-b:a", "192k", "-ar", "44100", "-ac", "2",
        str(path),
    ])
    return dur


async def make_vo(text: str, path: Path) -> float:
    """Warm TTS with correct NeerCred brand pronunciation."""
    spoken = brand_voice_text(text)
    await edge_tts.Communicate(spoken, VOICE, rate=VO_RATE, pitch=VO_PITCH).save(str(path))
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
    logo_hires: Image.Image | None = None,
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
        img = render_frame(scene, logo, frame_t=t, anim_frames=anim_frames, scene_idx=idx, logo_hires=logo_hires)
        img.save(seq_dir / f"frame_{f:04d}.png", quality=92)
    vf = f"fade=t=in:st=0:d=0.35,fade=t=out:st={total - 0.4:.3f}:d=0.4"
    run([
        "ffmpeg", "-y", "-framerate", str(FPS), "-i", str(seq_dir / "frame_%04d.png"),
        "-i", str(vo),
        "-vf", vf, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "12", "-preset", "medium",
        "-c:a", "aac", "-b:a", "256k", "-ar", "44100", "-ac", "2",
        "-shortest", "-t", f"{total:.3f}", str(out),
    ])
    for fp in seq_dir.glob("*.png"):
        fp.unlink(missing_ok=True)
    seq_dir.rmdir()
    return out


def render_clip_vertical(frame: Path, vo: Path, dur: float, idx: int) -> Path:
    """Stable vertical frame clip — native 1080×1920."""
    CLIPS.mkdir(parents=True, exist_ok=True)
    out = CLIPS / f"scene_v_{idx:02d}.mp4"
    total = dur + 0.55
    vf = (
        f"scale={W_V}:{H_V}:flags=lanczos,"
        f"fps={FPS},"
        f"fade=t=in:st=0:d=0.35,fade=t=out:st={total - 0.4:.3f}:d=0.4"
    )
    run([
        "ffmpeg", "-y", "-loop", "1", "-i", str(frame), "-i", str(vo),
        "-vf", vf, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "12", "-preset", "medium",
        "-c:a", "aac", "-b:a", "256k", "-ar", "44100", "-ac", "2",
        "-shortest", "-t", f"{total:.3f}", str(out),
    ])
    return out


def render_celebration_clip_vertical(
    scene: dict, logo: Image.Image, vo: Path, dur: float, idx: int,
    anim_frames: dict[str, list[Path]],
    logo_hires: Image.Image | None = None,
) -> Path:
    CLIPS.mkdir(parents=True, exist_ok=True)
    out = CLIPS / f"scene_v_{idx:02d}.mp4"
    total = dur + 0.55
    n_frames = max(int(total * FPS), 30)
    seq_dir = CLIPS / f"celebration_v_seq_{idx}"
    seq_dir.mkdir(parents=True, exist_ok=True)
    for f in range(n_frames):
        t = f / n_frames
        img = render_frame_vertical(scene, logo, frame_t=t, anim_frames=anim_frames, scene_idx=idx, logo_hires=logo_hires)
        img.save(seq_dir / f"frame_{f:04d}.png", quality=92)
    vf = f"fade=t=in:st=0:d=0.35,fade=t=out:st={total - 0.4:.3f}:d=0.4"
    run([
        "ffmpeg", "-y", "-framerate", str(FPS), "-i", str(seq_dir / "frame_%04d.png"),
        "-i", str(vo),
        "-vf", vf, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "12", "-preset", "medium",
        "-c:a", "aac", "-b:a", "256k", "-ar", "44100", "-ac", "2",
        "-shortest", "-t", f"{total:.3f}", str(out),
    ])
    for fp in seq_dir.glob("*.png"):
        fp.unlink(missing_ok=True)
    seq_dir.rmdir()
    return out


def audit_instagram_video(path: Path) -> dict:
    """QC gate for Instagram full-screen mobile export."""
    r = run(
        ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_streams", "-show_format", str(path)],
        capture_output=True, text=True,
    )
    data = json.loads(r.stdout)
    video = next((s for s in data["streams"] if s["codec_type"] == "video"), {})
    audio = next((s for s in data["streams"] if s["codec_type"] == "audio"), {})
    fmt = data.get("format", {})
    w, h = video.get("width"), video.get("height")
    checks = {
        "resolution_4k_2160x3840": w == 2160 and h == 3840,
        "resolution_1080x1920": w == 1080 and h == 1920,
        "h264_video": video.get("codec_name") == "h264",
        "aac_audio": audio.get("codec_name") == "aac",
        "has_audio": bool(audio),
        "duration_ok": 60 <= float(fmt.get("duration", 0)) <= 120,
        "file_size_ok": path.stat().st_size > 500_000,
    }
    # Full-frame check — sample mid-video frame; reject black letterbox bars top/bottom
    sample = path.parent / "_audit_sample.png"
    run(["ffmpeg", "-y", "-i", str(path), "-vf", "select=eq(n\\,900)", "-frames:v", "1", str(sample)], capture_output=True)
    if sample.exists():
        img = Image.open(sample).convert("L")
        top_mean = sum(img.crop((0, 0, w, 48)).getdata()) / (w * 48)
        bot_mean = sum(img.crop((0, h - 48, w, h)).getdata()) / (w * 48)
        checks["no_top_letterbox"] = top_mean > 18
        checks["no_bottom_letterbox"] = bot_mean > 18
        checks["full_screen_fill"] = top_mean > 18 and bot_mean > 18
        sample.unlink(missing_ok=True)
    else:
        checks["no_top_letterbox"] = True
        checks["no_bottom_letterbox"] = True
        checks["full_screen_fill"] = True
    checks["passed"] = all(
        v for k, v in checks.items()
        if k not in ("passed", "resolution_1080x1920", "resolution_4k_2160x3840")
    ) and (checks["resolution_4k_2160x3840"] or checks["resolution_1080x1920"])
    return {"path": str(path), "width": w, "height": h, "duration": float(fmt.get("duration", 0)), "checks": checks}


async def build_vertical_promo(
    anim_frames: dict[str, list[Path]],
    logo: Image.Image,
    logo_hires: Image.Image,
    scene_durations: list[tuple[dict, float, Path]],
) -> Path:
    """Build native 9:16 Instagram promo reusing landscape VO timings."""
    print("\n=== Native 9:16 Instagram full-screen build ===")
    v_clips: list[Path] = []
    for i, (scene, dur, vo) in enumerate(scene_durations):
        fr = FRAMES / f"premium_v_{i:02d}.png"
        render_frame_vertical(scene, logo, anim_frames=anim_frames, scene_idx=i, logo_hires=logo_hires).save(fr, quality=95)
        if scene.get("layout") in ("celebration", "endcard_full", "greeting_full", "story_full"):
            v_clips.append(render_celebration_clip_vertical(scene, logo, vo, dur, i, anim_frames, logo_hires))
        else:
            v_clips.append(render_clip_vertical(fr, vo, dur, i))
        print(f"  [9:16] {scene['id']}: {dur:.1f}s")

    merged_v = OUT / "premium_merged_916.mp4"
    concat_clips(v_clips, merged_v)

    r = run(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(merged_v)], capture_output=True, text=True)
    vid_dur = float(json.loads(r.stdout)["format"]["duration"])
    bgm = AUDIO / "bgm_premium_916.mp3"
    make_bgm(vid_dur, bgm)

    v_raw = DOWNLOAD / "NeerCred-Promo-RAW-9x16.mp4"
    run([
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

    v_out = DOWNLOAD / "NeerCred-Promo-PREMIUM-9x16.mp4"
    print("  Finalizing native 9:16 for Instagram...")
    finalize_mobile_mp4(v_raw, v_out)
    v_raw.unlink(missing_ok=True)
    return v_out


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
        "-vf", vf, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "12", "-preset", "medium",
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
        "-c:v", "libx264", "-crf", "12", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "256k", str(out),
    ])


async def main(anim_frames: dict[str, list[Path]], anim_frames_v: dict[str, list[Path]]) -> None:
    for d in (ASSETS, AUDIO, FRAMES, CLIPS, SCREENS, DOWNLOAD):
        d.mkdir(parents=True, exist_ok=True)

    logo = load_logo()
    logo_hires = load_logo_hires()
    clips: list[Path] = []
    vo_files: list[Path] = []
    voiced_files: list[Path] = []
    scene_durations: list[tuple[dict, float, Path]] = []
    scene_ends: list[float] = []
    acc = 0.0

    print("=== Premium VO + Frames (stable video) ===")
    for i, scene in enumerate(SCENES):
        vo = AUDIO / f"vo_{scene['id']}.mp3"
        if scene.get("vo_silent") or not scene.get("vo", "").strip():
            dur = float(scene.get("duration", 9.0))
            make_silent_audio(dur, vo)
            print(f"  {scene['id']}: {dur:.1f}s (silent — BGM only)")
        else:
            if vo.exists():
                r = run(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(vo)], capture_output=True, text=True)
                dur = float(json.loads(r.stdout)["format"]["duration"])
            else:
                dur = await make_vo(scene["vo"], vo)
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
            voiced_files.append(vo)
            print(f"  {scene['id']}: {dur:.1f}s")
        vo_files.append(vo)
        scene_durations.append((scene, dur, vo))
        acc += dur + 0.55
        scene_ends.append(acc)
        fr = FRAMES / f"premium_{i:02d}.png"
        render_frame(scene, logo, anim_frames=anim_frames, scene_idx=i, logo_hires=logo_hires).save(fr, quality=95)
        if scene.get("layout") in ("celebration", "endcard_full", "greeting_full", "story_full"):
            clips.append(render_celebration_clip(scene, logo, vo, dur, i, anim_frames, logo_hires))
        else:
            clips.append(render_clip(fr, vo, dur, i))

    vo_list = AUDIO / "vo_all.txt"
    vo_list.write_text("\n".join(f"file '{v}'" for v in voiced_files))
    vo_full = DOWNLOAD / "NeerCred-Voice-Only.mp3"
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(vo_list), "-c", "copy", str(vo_full)])

    merged = OUT / "premium_merged.mp4"
    concat_clips(clips, merged)

    bgm = AUDIO / "bgm_premium.mp3"
    r = run(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(merged)], capture_output=True, text=True)
    vid_dur = float(json.loads(r.stdout)["format"]["duration"])
    make_bgm(vid_dur, bgm)

    h_raw = DOWNLOAD / "NeerCred-Promo-RAW-16x9.mp4"
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
        str(h_raw),
    ])

    h_out = DOWNLOAD / "NeerCred-Promo-PREMIUM-16x9.mp4"
    print("  Finalizing 16:9 for mobile playback...")
    finalize_mobile_mp4(h_raw, h_out)
    h_raw.unlink(missing_ok=True)

    v_out = await build_vertical_promo(anim_frames_v, logo, logo_hires, scene_durations)

    ig_reels = DOWNLOAD / "NeerCred-Instagram-Reels.mp4"
    ig_reels.write_bytes(v_out.read_bytes())
    print(f"  Instagram Reels alias: {ig_reels}")

    audit = audit_instagram_video(v_out)
    audit_path = OUT / "instagram_916_audit.json"
    audit_path.write_text(json.dumps(audit, indent=2))
    print("\n=== Instagram 9:16 QC Audit ===")
    for k, v in audit["checks"].items():
        print(f"  {'✅' if v else '❌'} {k}: {v}")
    if not audit["checks"].get("passed"):
        print("  ⚠️  QC warnings — review before posting")

    ws = Path("/workspace/artifacts")
    ws.mkdir(parents=True, exist_ok=True)
    for src, name in [
        (h_out, "NeerCred-Promo-PREMIUM-16x9.mp4"),
        (v_out, "NeerCred-Promo-PREMIUM-9x16.mp4"),
        (ig_reels, "NeerCred-Instagram-Reels.mp4"),
        (vo_full, "NeerCred-Voice-Only.mp3"),
        (audit_path, "instagram_916_audit.json"),
    ]:
        if Path(src).exists():
            (ws / name).write_bytes(Path(src).read_bytes())

    det = run(["ffmpeg", "-y", "-i", str(v_out), "-af", "volumedetect", "-f", "null", "-"], capture_output=True, text=True)
    for ln in det.stderr.split("\n"):
        if "volume" in ln.lower():
            print(" ", ln.strip())
    print(f"\n✅ PREMIUM VIDEO:\n   {h_out}\n   {v_out} (native Instagram full-screen)\n   Audit: {audit_path}")


if __name__ == "__main__":
    ekyc_frames = ensure_celebration_frames()
    transfer_frames = ensure_transfer_frames()
    endcard_frames = ensure_endcard_frames()
    greeting_frames = ensure_greeting_frames()
    greeting_frames_v = ensure_greeting_frames_vertical()
    endcard_frames_v = ensure_endcard_frames_vertical()
    anim_frames = {
        "ekyc": ekyc_frames,
        "transfer": transfer_frames,
        "endcard": endcard_frames,
        "greeting": greeting_frames,
    }
    anim_frames_v = {
        "ekyc": ekyc_frames,
        "transfer": transfer_frames,
        "endcard": endcard_frames_v,
        "greeting": greeting_frames_v,
    }
    asyncio.run(main(anim_frames, anim_frames_v))
