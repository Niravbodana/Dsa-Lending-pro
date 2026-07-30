#!/usr/bin/env python3
"""Generate 30s premium NeerCred promo (9:16) — AI photos, Hindi VO, piano BGM."""

from __future__ import annotations

import asyncio
import json
import subprocess
from pathlib import Path

import edge_tts
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parents[1]
OUT = Path("/opt/cursor/artifacts/neercred-promo-video")
AI_DIR = OUT / "ai-photos"
SCENES_DIR = OUT / "scenes"
AUDIO_DIR = OUT / "audio"
FRAMES_DIR = OUT / "frames"

W, H = 1080, 1920
FPS = 30
VOICE = "hi-IN-MadhurNeural"
RATE = "+0%"
PITCH = "-1Hz"

BRAND = {
    "navy": "#0B1220",
    "teal": "#0F766E",
    "mint": "#14B8A6",
    "gold": "#D4A017",
    "white": "#F8FAFC",
    "slate": "#94A3B8",
}

SCENES = [
    {
        "id": "hook",
        "step": None,
        "headline": "Sapna bada ho?",
        "sub": "Loan lena ab mushkil nahi",
        "vo": "Sapna bada ho? Loan ab easy hai.",
        "accent": "gold",
        "photo": "scene-hook.png",
    },
    {
        "id": "mobile",
        "step": "1",
        "headline": "Mobile + OTP",
        "sub": "Turant verify · 100% secure",
        "vo": "Mobile number daalo... OTP verify karo.",
        "accent": "teal",
        "photo": "scene-mobile.png",
    },
    {
        "id": "profile",
        "step": "2",
        "headline": "Profile Complete",
        "sub": "Safe · Secure · Digital",
        "vo": "Profile complete karo... safe aur digital.",
        "accent": "mint",
        "photo": "scene-profile.png",
    },
    {
        "id": "offers",
        "step": "3",
        "headline": "15+ Lenders",
        "sub": "Best rate · Best EMI",
        "vo": "Offers compare karo... best EMI yahin.",
        "accent": "gold",
        "photo": "scene-offers.png",
    },
    {
        "id": "kyc",
        "step": "4",
        "headline": "KYC → Bank → eSign",
        "sub": "Sab phone se, ghar baithe",
        "vo": "KYC, bank, eSign... sab phone se.",
        "accent": "teal",
        "photo": "scene-kyc.png",
    },
    {
        "id": "disbursal",
        "step": "5",
        "headline": "Turant Disbursal",
        "sub": "Jaldi · Transparent · Zero jhanjhat",
        "vo": "Turant disbursal... transparent, zero jhanjhat.",
        "accent": "mint",
        "photo": "scene-disbursal.png",
        "no_border": True,
    },
    {
        "id": "close",
        "step": None,
        "headline": "",
        "sub": "",
        "vo": "Neer Cred... Dream Big, Borrow Smart.",
        "accent": "gold",
        "photo": None,
        "brand_close": True,
    },
]


def run(cmd: list[str], **kwargs) -> subprocess.CompletedProcess:
    print("$", " ".join(cmd))
    return subprocess.run(cmd, check=True, **kwargs)


def hex_to_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    for path in candidates:
        if Path(path).exists():
            return ImageFont.truetype(path, size)
    return ImageFont.load_default()


def draw_gradient(img: Image.Image, top: str, bottom: str) -> None:
    draw = ImageDraw.Draw(img)
    t, b = hex_to_rgb(top), hex_to_rgb(bottom)
    for y in range(H):
        ratio = y / H
        c = tuple(int(t[i] + (b[i] - t[i]) * ratio) for i in range(3))
        draw.line([(0, y), (W, y)], fill=c)


def add_premium_orbs(img: Image.Image, accent: str) -> Image.Image:
    overlay = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    rgb = hex_to_rgb(BRAND[accent])
    orbs = [(160, 300, 340, 40), (920, 700, 380, 35), (540, 1300, 420, 28), (300, 1600, 260, 22)]
    for cx, cy, r, alpha in orbs:
        for i in range(r, 0, -10):
            a = int(alpha * (1 - i / r))
            draw.ellipse([cx - i, cy - i, cx + i, cy + i], fill=(*rgb, a))
    return Image.alpha_composite(img.convert("RGBA"), overlay).convert("RGB")


def cover_crop(img: Image.Image, tw: int, th: int) -> Image.Image:
    src = img.convert("RGB")
    scale = max(tw / src.width, th / src.height)
    nw, nh = int(src.width * scale), int(src.height * scale)
    src = src.resize((nw, nh), Image.Resampling.LANCZOS)
    left = (nw - tw) // 2
    top = (nh - th) // 2
    return src.crop((left, top, left + tw, top + th))


def fit_font_size(text: str, max_w: int, start: int, min_size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for size in range(start, min_size - 1, -1):
        font = load_font(size, bold=bold)
        if ImageDraw.Draw(Image.new("RGB", (1, 1))).textlength(text, font=font) <= max_w:
            return font
    return load_font(min_size, bold=bold)


def wrap_text_lines(text: str, font: ImageFont.ImageFont, max_w: int) -> list[str]:
    words = text.replace("  ", " ").split()
    lines: list[str] = []
    current = ""
    measure = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    for word in words:
        trial = f"{current} {word}".strip()
        if measure.textlength(trial, font=font) <= max_w:
            current = trial
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines or [text]


def draw_footer_bar(draw: ImageDraw.ImageDraw, accent: str) -> None:
    """Footer text fully inside premium border — auto-fit font."""
    box = (60, 1755, W - 60, 1860)
    teal = hex_to_rgb(BRAND["teal"])
    gold = hex_to_rgb(BRAND["gold"])
    inner_w = box[2] - box[0] - 48

    draw.rounded_rectangle(box, radius=30, fill="#0A1628", outline=teal, width=2)
    draw.rounded_rectangle([box[0] + 6, box[1] + 6, box[2] - 6, box[3] - 6], radius=26, outline=gold, width=1)

    bar = "Rates from 10.99%  ·  100% Digital  ·  Compare 15+ Lenders"
    font = fit_font_size(bar, inner_w, 24, 17, bold=True)
    lines = wrap_text_lines(bar, font, inner_w)
    if len(lines) > 2:
        font = load_font(17, bold=True)
        lines = wrap_text_lines(bar, font, inner_w)

    line_h = 30
    total_h = len(lines) * line_h
    start_y = box[1] + (box[3] - box[1] - total_h) // 2 + 2
    for i, line in enumerate(lines):
        lw = draw.textlength(line, font=font)
        draw.text((box[0] + (box[2] - box[0] - lw) // 2, start_y + i * line_h), line, fill=hex_to_rgb(BRAND["white"]), font=font)


def draw_premium_frame(
    draw: ImageDraw.ImageDraw,
    box: tuple[int, int, int, int],
    accent: str,
    radius: int = 48,
) -> None:
    """Company-level double-border frame with gold accents."""
    x1, y1, x2, y2 = box
    accent_rgb = hex_to_rgb(BRAND[accent])
    gold_rgb = hex_to_rgb(BRAND["gold"])
    teal_rgb = hex_to_rgb(BRAND["teal"])

    # Outer ambient glow (RGBA layer)
    glow = Image.new("RGBA", (x2 - x1 + 80, y2 - y1 + 80), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    ox, oy = 40, 40
    for pad, alpha in [(34, 14), (22, 22), (12, 32)]:
        gdraw.rounded_rectangle(
            [ox - pad, oy - pad, x2 - x1 + ox + pad, y2 - y1 + oy + pad],
            radius=radius + pad,
            outline=(*accent_rgb, alpha),
            width=2,
        )

    # Main borders drawn directly
    draw.rounded_rectangle([x1, y1, x2, y2], radius=radius, outline=teal_rgb, width=5)
    draw.rounded_rectangle([x1 + 6, y1 + 6, x2 - 6, y2 - 6], radius=radius - 5, outline=gold_rgb, width=2)
    draw.rounded_rectangle([x1 + 12, y1 + 12, x2 - 12, y2 - 12], radius=radius - 10, outline="#2A3A4A", width=1)

    # Corner L-brackets (premium fintech detail)
    cl = 28
    for cx, cy, dx, dy in [
        (x1 + 18, y1 + 18, 1, 1),
        (x2 - 18, y1 + 18, -1, 1),
        (x1 + 18, y2 - 18, 1, -1),
        (x2 - 18, y2 - 18, -1, -1),
    ]:
        draw.line([cx, cy, cx + dx * cl, cy], fill=gold_rgb, width=3)
        draw.line([cx, cy, cx, cy + dy * cl], fill=gold_rgb, width=3)


def paste_photo_card(
    base: Image.Image,
    photo_path: Path,
    accent: str,
    card_box: tuple[int, int, int, int],
    headline: str = "",
    sub: str = "",
    no_border: bool = False,
) -> None:
    x1, y1, x2, y2 = card_box
    cw, ch = x2 - x1, y2 - y1
    accent_rgb = hex_to_rgb(BRAND[accent])
    pad = 12 if no_border else 24
    text_h = 200 if headline else 0

    if not no_border:
        glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        gdraw = ImageDraw.Draw(glow)
        for gp, alpha in [(36, 16), (20, 26), (10, 38)]:
            gdraw.rounded_rectangle(
                [x1 - gp, y1 - gp, x2 + gp, y2 + gp],
                radius=56 + gp, fill=(*accent_rgb, alpha),
            )
        base.paste(Image.alpha_composite(base.convert("RGBA"), glow).convert("RGB"))

    pw, ph = cw - pad * 2, ch - pad * 2
    photo = cover_crop(Image.open(photo_path), pw, ph)

    # Strong bottom vignette for in-card text readability
    vignette = Image.new("RGBA", (pw, ph), (0, 0, 0, 0))
    vdraw = ImageDraw.Draw(vignette)
    for i in range(320):
        a = int(210 * (i / 320) ** 1.4)
        vdraw.rectangle([0, ph - 320 + i, pw, ph - 320 + i + 1], fill=(0, 0, 0, a))
    photo_rgba = Image.alpha_composite(photo.convert("RGBA"), vignette)

    # Draw headline + sub INSIDE photo at bottom
    if headline:
        overlay = ImageDraw.Draw(photo_rgba)
        inner_w = pw - 48
        title_font = fit_font_size(headline, inner_w, 56, 40, bold=True)
        sub_font = fit_font_size(sub, inner_w, 34, 24) if sub else load_font(24)
        title_lines = wrap_text_lines(headline, title_font, inner_w)
        sub_lines = wrap_text_lines(sub, sub_font, inner_w) if sub else []

        y = ph - 36 - len(sub_lines) * 34 - len(title_lines) * 58
        for line in title_lines:
            lw = overlay.textlength(line, font=title_font)
            overlay.text(((pw - lw) // 2, y), line, fill=(255, 255, 255, 255), font=title_font)
            y += 58
        accent_rgba = (*hex_to_rgb(BRAND[accent]), 255)
        for line in sub_lines:
            sw = overlay.textlength(line, font=sub_font)
            overlay.text(((pw - sw) // 2, y), line, fill=accent_rgba, font=sub_font)
            y += 34

    radius = 40 if no_border else 38
    mask = Image.new("L", (pw, ph), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, pw - 1, ph - 1], radius=radius, fill=255)
    rounded = Image.new("RGBA", (pw, ph), (0, 0, 0, 0))
    rounded.paste(photo_rgba, (0, 0))
    rounded.putalpha(mask)

    base_rgba = base.convert("RGBA")
    base_rgba.paste(rounded, (x1 + pad, y1 + pad), rounded)
    base.paste(base_rgba.convert("RGB"))

    if not no_border:
        draw = ImageDraw.Draw(base)
        draw_premium_frame(draw, card_box, accent, radius=48)


def paste_transparent_logo(
    base: Image.Image,
    logo_path: Path,
    width: int = 420,
    y: int = 175,
) -> Image.Image:
    """Premium transparent logo — no box, no border, soft glow only."""
    logo = Image.open(logo_path).convert("RGBA")
    bbox = logo.getbbox()
    if bbox:
        logo = logo.crop(bbox)
    scale = width / logo.width
    nw, nh = int(logo.width * scale), int(logo.height * scale)
    logo = logo.resize((nw, nh), Image.Resampling.LANCZOS)

    px = (W - nw) // 2
    py = y
    base_rgba = base.convert("RGBA")

    # Subtle gold ambient glow (premium, not a box)
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    cx, cy = W // 2, py + nh // 2
    for r in range(140, 0, -5):
        a = int(22 * (1 - r / 140))
        gdraw.ellipse([cx - r, cy - r // 2, cx + r, cy + r // 2], fill=(*hex_to_rgb(BRAND["gold"]), a))
    base_rgba = Image.alpha_composite(base_rgba, glow)

    # Soft drop shadow
    sa = logo.split()[3]
    shadow_alpha = sa.point(lambda p: int(p * 0.35))
    shadow_img = Image.new("RGBA", (nw, nh), (0, 0, 0, 255))
    shadow_img.putalpha(shadow_alpha)
    shadow_img = shadow_img.filter(ImageFilter.GaussianBlur(6))
    base_rgba.paste(shadow_img, (px + 3, py + 5), shadow_img)

    base_rgba.paste(logo, (px, py), logo)
    return base_rgba.convert("RGB")


def logo_top_y(scene: dict) -> int:
    """Place logo just below step badge, or top for hook."""
    return 178 if scene.get("step") else 100


def render_step5_fullbleed(
    base: Image.Image,
    photo_path: Path,
    headline: str,
    sub: str,
) -> Image.Image:
    """Step 5 — full-bleed photo below logo, zero borders."""
    y1, y2 = 300, 1480
    ph = y2 - y1
    photo = cover_crop(Image.open(photo_path), W, ph)

    base_rgba = base.convert("RGBA")
    base_rgba.paste(photo, (0, y1))

    vignette = Image.new("RGBA", (W, ph), (0, 0, 0, 0))
    vdraw = ImageDraw.Draw(vignette)
    for i in range(280):
        a = int(200 * (i / 280) ** 1.3)
        vdraw.rectangle([0, ph - 280 + i, W, ph - 280 + i + 1], fill=(0, 0, 0, a))
    base_rgba.paste(Image.alpha_composite(
        base_rgba.crop((0, y1, W, y2)).convert("RGBA"), vignette
    ), (0, y1))

    overlay = ImageDraw.Draw(base_rgba)
    inner_w = W - 80
    title_font = fit_font_size(headline, inner_w, 58, 42, bold=True)
    sub_font = fit_font_size(sub, inner_w, 34, 26) if sub else load_font(26)
    ty = y2 - 130
    for line in wrap_text_lines(headline, title_font, inner_w):
        lw = overlay.textlength(line, font=title_font)
        overlay.text(((W - lw) // 2, ty), line, fill=(255, 255, 255, 255), font=title_font)
        ty += 56
    for line in wrap_text_lines(sub, sub_font, inner_w):
        sw = overlay.textlength(line, font=sub_font)
        overlay.text(((W - sw) // 2, ty), line, fill=(*hex_to_rgb(BRAND["mint"]), 255), font=sub_font)
        ty += 34

    return base_rgba.convert("RGB")


def render_premium_close(img: Image.Image, logo_path: Path, accent: str) -> Image.Image:
    """Last scene — huge transparent logo, premium glow, no box."""
    gold = hex_to_rgb(BRAND["gold"])
    teal = hex_to_rgb(BRAND["teal"])
    base = img.convert("RGBA")

    spot = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(spot)
    for r in range(760, 0, -6):
        a = int(55 * max(0, 1 - r / 760))
        sd.ellipse([W // 2 - r, H // 2 - 120 - r // 2, W // 2 + r, H // 2 - 120 + r // 2], fill=(*gold, a // 3))
    for r in range(600, 0, -6):
        a = int(40 * max(0, 1 - r / 600))
        sd.ellipse([W // 2 - r, H // 2 - 100 - r // 2, W // 2 + r, H // 2 - 100 + r // 2], fill=(*teal, a // 2))
    base = Image.alpha_composite(base, spot)

    logo = Image.open(logo_path).convert("RGBA")
    bbox = logo.getbbox()
    if bbox:
        logo = logo.crop(bbox)

    target_w = 1060
    scale = target_w / logo.width
    nw, nh = int(logo.width * scale), int(logo.height * scale)
    logo = logo.resize((nw, nh), Image.Resampling.LANCZOS)

    px, py = (W - nw) // 2, 520
    sa = logo.split()[3]
    shadow_alpha = sa.point(lambda p: int(p * 0.4))
    shadow_img = Image.new("RGBA", (nw, nh), (0, 0, 0, 255))
    shadow_img.putalpha(shadow_alpha)
    shadow_img = shadow_img.filter(ImageFilter.GaussianBlur(10))
    base.paste(shadow_img, (px + 4, py + 8), shadow_img)
    base.paste(logo, (px, py), logo)

    draw = ImageDraw.Draw(base)
    rbi = "RBI LSP Registered Platform"
    rbi_font = load_font(34, bold=True)
    rw = draw.textlength(rbi, font=rbi_font)
    ry = py + nh + 56
    draw.line([120, ry + 20, W // 2 - rw // 2 - 18, ry + 20], fill=(*gold, 180), width=2)
    draw.line([W // 2 + rw // 2 + 18, ry + 20, W - 120, ry + 20], fill=(*gold, 180), width=2)
    draw.text(((W - rw) / 2, ry), rbi, fill=gold, font=rbi_font)

    return base.convert("RGB")


def render_scene(
    scene: dict,
    logo_path: Path | None,
    photo_path: Path | None,
    center_logo_path: Path | None = None,
) -> Image.Image:
    accent = scene["accent"]
    img = Image.new("RGB", (W, H), BRAND["navy"])
    draw_gradient(img, "#070D18", "#0F172A")
    img = add_premium_orbs(img, accent)
    draw = ImageDraw.Draw(img)

    # Top step pill
    if scene.get("step"):
        pill_font = load_font(34, bold=True)
        label = f"STEP {scene['step']}"
        tw = draw.textlength(label, font=pill_font)
        px, py = (W - tw) / 2 - 40, 100
        draw.rounded_rectangle([px, py, px + tw + 80, py + 58], radius=29, fill=hex_to_rgb(BRAND[accent]))
        draw.text((px + 40, py + 10), label, fill=hex_to_rgb(BRAND["white"]), font=pill_font)

    card = (90, 380, 990, 1400)

    # Transparent logo below step badge (all scenes except close)
    if not scene.get("brand_close") and center_logo_path and center_logo_path.exists():
        img = paste_transparent_logo(img, center_logo_path, width=400, y=logo_top_y(scene))

    if scene.get("brand_close") and logo_path and logo_path.exists():
        img = render_premium_close(img, logo_path, accent)
        draw = ImageDraw.Draw(img)
    elif scene.get("no_border") and photo_path and photo_path.exists():
        img = render_step5_fullbleed(
            img, photo_path,
            scene.get("headline", ""), scene.get("sub", ""),
        )
        draw = ImageDraw.Draw(img)
    elif photo_path and photo_path.exists():
        paste_photo_card(
            img, photo_path, accent, card,
            headline=scene.get("headline", ""),
            sub=scene.get("sub", ""),
            no_border=False,
        )
        draw = ImageDraw.Draw(img)

    draw_footer_bar(draw, accent)

    return img


async def synth_vo(scene: dict, out_path: Path) -> float:
    """Natural Hindi VO — split on pauses, light studio polish only."""
    parts = [p.strip() for p in scene["vo"].split("...") if p.strip()]
    segment_files: list[Path] = []

    for i, part in enumerate(parts):
        seg = out_path.with_suffix(f".seg{i}.mp3")
        await edge_tts.Communicate(part, VOICE, rate=RATE, pitch=PITCH).save(str(seg))
        segment_files.append(seg)

    if len(segment_files) == 1:
        segment_files[0].replace(out_path)
    else:
        # Concatenate with 380ms natural pause between phrases
        inputs: list[str] = []
        filter_parts: list[str] = []
        for i, seg in enumerate(segment_files):
            inputs += ["-i", str(seg)]
            if i < len(segment_files) - 1:
                filter_parts.append(f"[{i}:a]apad=pad_dur=0.22[a{i}]")
            else:
                filter_parts.append(f"[{i}:a]anull[a{i}]")
        concat_in = "".join(f"[a{i}]" for i in range(len(segment_files)))
        run([
            "ffmpeg", "-y", *inputs,
            "-filter_complex", ";".join(filter_parts) + f";{concat_in}concat=n={len(segment_files)}:v=0:a=1[aout]",
            "-map", "[aout]", str(out_path),
        ])
        for seg in segment_files:
            seg.unlink(missing_ok=True)

    # Light natural polish — no heavy EQ (sounds robotic)
    polished = out_path.with_suffix(".polished.mp3")
    run([
        "ffmpeg", "-y", "-i", str(out_path),
        "-af",
        "highpass=f=85,"
        "equalizer=f=2200:width_type=h:width=1800:g=1.2,"
        "aecho=0.82:0.88:30:0.06,"
        "compand=0.3|0.7:6:-70/-60/-22/-10/-3/0:2:0:0,"
        "volume=1.08",
        str(polished),
    ])
    polished.replace(out_path)

    probe = run(
        ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(out_path)],
        capture_output=True,
        text=True,
    )
    return float(json.loads(probe.stdout)["format"]["duration"])


def _rasterize_transparent_logo(path: Path, svg: str, vp: str) -> None:
    """Render SVG then remove white background for true transparency."""
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


def ensure_logo() -> tuple[Path, Path]:
    """Return (center_logo, close_logo). Center = one line; close = with tagline, bigger."""
    center_logo = SCENES_DIR / "neercred-logo-center.png"
    close_logo = SCENES_DIR / "neercred-logo-close.png"

    center_svg = """<svg width="600" height="90" viewBox="0 0 600 90" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="c-blue" x1="8" y1="8" x2="36" y2="52" gradientUnits="userSpaceOnUse">
      <stop stop-color="#22D3EE"/><stop offset="0.55" stop-color="#3B82F6"/><stop offset="1" stop-color="#1E3A8A"/>
    </linearGradient>
    <linearGradient id="c-gold" x1="42" y1="12" x2="52" y2="50" gradientUnits="userSpaceOnUse">
      <stop stop-color="#FDE68A"/><stop offset="0.45" stop-color="#E8C547"/><stop offset="1" stop-color="#B8860B"/>
    </linearGradient>
    <linearGradient id="c-ring-blue" x1="6" y1="32" x2="32" y2="32" gradientUnits="userSpaceOnUse">
      <stop stop-color="#38BDF8"/><stop offset="1" stop-color="#1D4ED8"/>
    </linearGradient>
    <linearGradient id="c-ring-gold" x1="32" y1="32" x2="58" y2="32" gradientUnits="userSpaceOnUse">
      <stop stop-color="#F5D76E"/><stop offset="1" stop-color="#C9A227"/>
    </linearGradient>
    <linearGradient id="c-cred" x1="100" y1="0" x2="400" y2="0" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0F766E"/><stop offset="1" stop-color="#14B8A6"/>
    </linearGradient>
  </defs>
  <g transform="translate(8, -14) scale(1.0)">
    <path d="M48 14 A34 34 0 0 0 48 82" stroke="url(#c-ring-blue)" stroke-width="2.8" fill="none" stroke-linecap="round"/>
    <path d="M48 14 A34 34 0 0 1 48 82" stroke="url(#c-ring-gold)" stroke-width="2.8" fill="none" stroke-linecap="round"/>
    <path d="M34 30 L34 66" stroke="url(#c-blue)" stroke-width="7.5" stroke-linecap="round"/>
    <path d="M34 30 L62 66" stroke="url(#c-blue)" stroke-width="7.5" stroke-linecap="round"/>
    <path d="M62 30 L62 66" stroke="url(#c-gold)" stroke-width="7.5" stroke-linecap="round"/>
    <path d="M48 9.5 L49.8 13.8 L54.4 13.8 L50.8 16.6 L52.2 21 L48 18.4 L43.8 21 L45.2 16.6 L41.6 13.8 L46.2 13.8 Z" fill="url(#c-gold)"/>
  </g>
  <text x="108" y="58" font-family="Poppins, system-ui, sans-serif" font-size="48" font-weight="700" letter-spacing="-0.5">
    <tspan fill="#F8FAFC">Neer</tspan><tspan fill="url(#c-cred)">Cred</tspan>
  </text>
</svg>"""

    close_svg = """<svg width="700" height="160" viewBox="0 0 700 160" fill="none" xmlns="http://www.w3.org/2000/svg">
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
  <g transform="translate(12, -14) scale(1.2)">
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

    for path, svg, vp in [
        (center_logo, center_svg, "1200,200"),
        (close_logo, close_svg, "1400,340"),
    ]:
        _rasterize_transparent_logo(path, svg, vp)
    return center_logo, close_logo


def build_scene_clip(scene_img: Path, vo_path: Path, vo_duration: float, idx: int) -> Path:
    clip = OUT / f"clip_{idx:02d}.mp4"
    dur = vo_duration + 0.15
    run([
        "ffmpeg", "-y",
        "-loop", "1", "-i", str(scene_img),
        "-i", str(vo_path),
        "-filter_complex",
        f"[0:v]scale={W}:{H}:force_original_aspect_ratio=decrease,pad={W}:{H}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps={FPS}[v]",
        "-map", "[v]", "-map", "1:a",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18",
        "-c:a", "aac", "-b:a", "192k",
        "-t", f"{dur:.3f}",
        str(clip),
    ])
    return clip


def concat_clips(clips: list[Path], piano: Path, output: Path) -> None:
    list_file = OUT / "clips.txt"
    list_file.write_text("\n".join(f"file '{c}'" for c in clips))

    merged = OUT / "merged.mp4"
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(list_file), "-c", "copy", str(merged)])

    probe = run(
        ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(merged)],
        capture_output=True, text=True,
    )
    merged_dur = float(json.loads(probe.stdout)["format"]["duration"])
    target = 30.0
    pad = max(0.0, target - merged_dur)
    speed = merged_dur / target if merged_dur > target else 1.0
    print(f"Merged: {merged_dur:.2f}s | pad: {pad:.2f}s | speed: {speed:.3f}x")

    fade_out = max(27.5, target - 2.0)
    if speed > 1.0:
        vfilter = f"[0:v]setpts=PTS/{speed:.6f},tpad=stop_mode=clone:stop_duration=0[vout];"
        afilter = f"[0:a]atempo={min(speed, 2.0):.6f}" + (f",atempo={speed/2.0:.6f}" if speed > 2.0 else "") + "[a0];"
    else:
        vfilter = f"[0:v]tpad=stop_mode=clone:stop_duration={pad:.3f}[vout];"
        afilter = "[0:a]anull[a0];"

    run([
        "ffmpeg", "-y", "-i", str(merged), "-stream_loop", "-1", "-i", str(piano),
        "-filter_complex",
        vfilter + afilter +
        f"[1:a]volume=0.14,afade=t=in:st=0:d=2.5,afade=t=out:st={fade_out:.1f}:d=2.5[bg];"
        "[a0][bg]amix=inputs=2:duration=longest:dropout_transition=2[aout]",
        "-map", "[vout]", "-map", "[aout]",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18",
        "-c:a", "aac", "-b:a", "192k", "-t", "30", str(output),
    ])


async def main() -> None:
    for d in (SCENES_DIR, AUDIO_DIR, FRAMES_DIR, AI_DIR):
        d.mkdir(parents=True, exist_ok=True)

    logo_center, logo_close = await asyncio.to_thread(ensure_logo)

    vo_durations: list[float] = []
    for i, scene in enumerate(SCENES):
        vo_path = AUDIO_DIR / f"vo_{i:02d}_{scene['id']}.mp3"
        dur = await synth_vo(scene, vo_path)
        vo_durations.append(dur)
        print(f"VO {scene['id']}: {dur:.2f}s")

        photo = None
        if scene.get("photo"):
            photo = AI_DIR / scene["photo"]
            if not photo.exists():
                photo = Path("/opt/cursor/artifacts/assets") / scene["photo"]

        use_logo = logo_close if scene.get("brand_close") else logo_center
        frame_path = FRAMES_DIR / f"scene_{i:02d}.png"
        render_scene(scene, use_logo, photo, logo_center).save(frame_path, quality=96)

    clips = []
    for i, scene in enumerate(SCENES):
        clips.append(build_scene_clip(
            FRAMES_DIR / f"scene_{i:02d}.png",
            AUDIO_DIR / f"vo_{i:02d}_{scene['id']}.mp3",
            vo_durations[i], i,
        ))

    output = OUT / "neercred-promo-30s-v2.mp4"
    concat_clips(clips, AUDIO_DIR / "piano.mp3", output)

    # Also copy to standard name
    final = OUT / "neercred-promo-30s.mp4"
    final.write_bytes(output.read_bytes())
    workspace = Path("/workspace/artifacts/neercred-promo-30s.mp4")
    workspace.parent.mkdir(exist_ok=True)
    workspace.write_bytes(output.read_bytes())

    print(f"\n✅ Premium video ready: {output}")
    print(f"   30s | 1080x1920 | AI photos + original logo")


if __name__ == "__main__":
    asyncio.run(main())
