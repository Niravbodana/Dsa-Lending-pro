#!/usr/bin/env python3
"""NeerCred Instagram promo posts — official logo + real app screenshots, 8K."""

from __future__ import annotations

import subprocess
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = Path("/opt/cursor/artifacts/neercred-instagram-photos-v2")
ASSETS = OUT / "assets"
SCREENS = Path("/opt/cursor/artifacts/neercred-promo-video/screenshots")

W, H = 4320, 5400  # 8K-class Instagram 4:5

C = {
    "navy": "#0B1220",
    "teal": "#0F766E",
    "teal_deep": "#134E4A",
    "cyan": "#0891B2",
    "mint": "#5EEAD4",
    "gold": "#D4A017",
    "gold_light": "#FDE68A",
    "white": "#F8FAFC",
    "muted": "#94A3B8",
    "glass": (11, 18, 32, 200),
}


def run(cmd: list, **kw) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, check=True, **kw)


def rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def ensure_fonts() -> tuple[Path, Path]:
    ASSETS.mkdir(parents=True, exist_ok=True)
    urls = {
        "Poppins-Bold.ttf": "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Bold.ttf",
        "Poppins-SemiBold.ttf": "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-SemiBold.ttf",
        "Poppins-Regular.ttf": "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Regular.ttf",
    }
    paths = []
    for name, url in urls.items():
        p = ASSETS / name
        if not p.exists() or p.stat().st_size < 1000:
            urllib.request.urlretrieve(url, p)
        paths.append(p)
    return paths[0], paths[2]


def font(sz: int, bold: bool = False) -> ImageFont.FreeTypeFont:
    bold_p, reg_p = ensure_fonts()
    return ImageFont.truetype(str(bold_p if bold else reg_p), sz)


def render_svg_logo(svg_name: str, cache_key: str, target_h: int, bg: str = "transparent", scale: int = 3) -> Image.Image:
    """Render official NeerCred SVG at native target height with high DPI (no upscale blur)."""
    from playwright.sync_api import sync_playwright

    ASSETS.mkdir(parents=True, exist_ok=True)
    svg = ROOT / f"frontend/public/{svg_name}"
    out = ASSETS / f"{cache_key}_h{target_h}_s{scale}.png"
    if not out.exists() or out.stat().st_mtime < svg.stat().st_mtime:
        # SVG viewBox aspect ~ 320:108 (dark) / 248:84 (light) ≈ 2.96:1
        aspect = 320 / 108 if "dark" in svg_name else 248 / 84
        vp_h = target_h
        vp_w = max(int(target_h * aspect) + 40, 280)
        bg_css = "transparent" if bg == "transparent" else bg
        html = ASSETS / f"{cache_key}_render.html"
        html.write_text(
            f'<!DOCTYPE html><html><head>'
            f'<link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600;700;800&display=swap" rel="stylesheet">'
            f'<style>html,body{{margin:0;padding:0;background:{bg_css};width:{vp_w}px;height:{vp_h}px;'
            f'display:flex;align-items:center;justify-content:flex-start;overflow:hidden}}'
            f'svg{{width:100%;height:100%;display:block}}</style>'
            f'</head><body>{svg.read_text(encoding="utf-8", errors="replace")}</body></html>'
        )
        with sync_playwright() as p:
            browser = p.chromium.launch()
            page = browser.new_page(
                viewport={"width": vp_w, "height": vp_h},
                device_scale_factor=scale,
            )
            page.goto(f"file://{html.resolve()}")
            page.wait_for_timeout(400)
            page.screenshot(path=str(out), omit_background=(bg == "transparent"))
            browser.close()
    img = Image.open(out).convert("RGBA")
    if bg != "transparent":
        bg_rgb = rgb(bg)
        px = img.load()
        for y in range(img.height):
            for x in range(img.width):
                r, g, b, a = px[x, y]
                if abs(r - bg_rgb[0]) < 12 and abs(g - bg_rgb[1]) < 12 and abs(b - bg_rgb[2]) < 12:
                    px[x, y] = (r, g, b, 0)
    if img.getbbox():
        img = img.crop(img.getbbox())
    return img


def load_logo_dark(h: int = 480) -> Image.Image:
    """Official dark-bg lockup — crisp at target height for 8K canvas."""
    raw = render_svg_logo("neercred-logo-header-dark.svg", "logo_header_dark_8k", h, "transparent", scale=3)
    if raw.height != h:
        ratio = h / raw.height
        raw = raw.resize((int(raw.width * ratio), h), Image.Resampling.LANCZOS)
    return raw


def load_logo_light(h: int = 480) -> Image.Image:
    """Official light-bg lockup — crisp at target height for 8K canvas."""
    raw = render_svg_logo("neercred-logo-header.svg", "logo_header_light_8k", h, "transparent", scale=3)
    if raw.height != h:
        ratio = h / raw.height
        raw = raw.resize((int(raw.width * ratio), h), Image.Resampling.LANCZOS)
    return raw


def load_hdfc_logo(h: int = 120) -> Image.Image:
    svg = ROOT / "frontend/public/logos/hdfc-bank.svg"
    out = ASSETS / "hdfc_logo.png"
    if not out.exists() or out.stat().st_mtime < svg.stat().st_mtime:
        html = ASSETS / "hdfc_render.html"
        html.write_text(
            f'<!DOCTYPE html><html><head><style>body{{margin:0;background:transparent;width:400px;height:80px;'
            f'display:flex;align-items:center;justify-content:center}}</style></head>'
            f'<body>{svg.read_text(encoding="utf-8")}</body></html>'
        )
        run(
            ["npx", "playwright", "screenshot", "--browser", "chromium",
             f"file://{html.resolve()}", str(out), "--viewport-size=400,80"],
            cwd=ROOT / "frontend",
        )
    img = Image.open(out).convert("RGBA")
    ratio = h / img.height
    return img.resize((int(img.width * ratio), h), Image.Resampling.LANCZOS)


def gradient_canvas(c0: str, c1: str, c2: str | None = None) -> Image.Image:
    c = Image.new("RGB", (W, H), rgb(c0))
    d = ImageDraw.Draw(c)
    r0, r1 = rgb(c0), rgb(c1)
    r2 = rgb(c2) if c2 else r1
    for y in range(H):
        t = y / H
        if c2 and t < 0.55:
            u = t / 0.55
            col = tuple(int(r0[i] + (r1[i] - r0[i]) * u) for i in range(3))
        elif c2:
            u = (t - 0.55) / 0.45
            col = tuple(int(r1[i] + (r2[i] - r1[i]) * u) for i in range(3))
        else:
            col = tuple(int(r0[i] + (r1[i] - r0[i]) * t) for i in range(3))
        d.line([(0, y), (W, y)], fill=col)
    return c


def add_orbs(base: Image.Image, style: str = "navy") -> Image.Image:
    rgba = base.convert("RGBA")
    orbs = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    od = ImageDraw.Draw(orbs)
    if style == "mint":
        od.ellipse([W // 2 - 900, H // 3 - 600, W // 2 + 900, H // 3 + 600], fill=(187, 247, 208, 90))
        od.ellipse([W - 600, 200, W + 200, 1000], fill=(110, 231, 183, 60))
    else:
        od.ellipse([W - 800, -200, W + 300, 700], fill=(15, 118, 110, 55))
        od.ellipse([-200, H - 900, 500, H + 200], fill=(94, 234, 212, 35))
        od.ellipse([W // 2 - 400, H // 2, W // 2 + 500, H // 2 + 700], fill=(212, 160, 23, 25))
    orbs = orbs.filter(ImageFilter.GaussianBlur(120))
    rgba.paste(orbs, (0, 0), orbs)
    return rgba.convert("RGB")


def fit_screen(path: Path, pw: int, ph: int) -> Image.Image:
    src = Image.open(path).convert("RGB")
    scale = min(pw / src.width, ph / src.height)
    nw, nh = int(src.width * scale), int(src.height * scale)
    r = src.resize((nw, nh), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (pw, ph), "#F8FAFC")
    canvas.paste(r, ((pw - nw) // 2, 0))
    return canvas


def draw_phone(screen: Image.Image, scale: float = 1.0) -> Image.Image:
    pw, ph = int(520 * scale), int(1064 * scale)
    bezel = int(18 * scale)
    frame = Image.new("RGBA", (pw + bezel * 2, ph + bezel * 2 + int(48 * scale)), (0, 0, 0, 0))
    fd = ImageDraw.Draw(frame)
    for i in range(bezel):
        shade = 28 + i * 6
        fd.rounded_rectangle(
            [i, i + int(24 * scale), pw + 2 * bezel - 1 - i, ph + 2 * bezel - 1 - i],
            radius=int(56 * scale) - i, fill=(shade, shade, shade + 8, 255),
        )
    fd.rounded_rectangle(
        [bezel, bezel + int(24 * scale), pw + bezel, ph + bezel],
        radius=int(48 * scale), fill=(6, 8, 14, 255),
    )
    fd.rounded_rectangle(
        [pw // 2 + bezel - int(60 * scale), bezel + int(8 * scale),
         pw // 2 + bezel + int(60 * scale), bezel + int(26 * scale)],
        radius=int(12 * scale), fill=(2, 2, 4, 255),
    )
    scr = fit_screen(screen if isinstance(screen, Path) else screen, pw, ph) if isinstance(screen, Path) else screen.resize((pw, ph), Image.Resampling.LANCZOS)
    mask = Image.new("L", (pw, ph), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, pw - 1, ph - 1], radius=int(42 * scale), fill=255)
    scr_rgba = scr.convert("RGBA")
    scr_rgba.putalpha(mask)
    frame.paste(scr_rgba, (bezel, bezel + int(24 * scale)), scr_rgba)
    return frame


def paste_logo(canvas: Image.Image, logo: Image.Image, x: int, y: int, center: bool = False) -> None:
    rgba = canvas.convert("RGBA")
    lx = x - logo.width // 2 if center else x
    rgba.paste(logo, (lx, y), logo)
    canvas.paste(rgba.convert("RGB"))


def paste_logo_branded(
    canvas: Image.Image,
    logo: Image.Image,
    x: int = 100,
    y: int = 90,
    *,
    glass: bool = True,
    dark_glass: bool = False,
) -> None:
    """Top-left logo placement with optional frosted pill for readability."""
    rgba = canvas.convert("RGBA")
    pad_x, pad_y = 28, 18
    if glass:
        pill = Image.new("RGBA", (logo.width + pad_x * 2, logo.height + pad_y * 2), (0, 0, 0, 0))
        pd = ImageDraw.Draw(pill)
        fill = (11, 18, 32, 120) if dark_glass else (248, 250, 252, 95)
        pd.rounded_rectangle([0, 0, pill.width - 1, pill.height - 1], radius=24, fill=fill)
        rgba.paste(pill, (x - pad_x, y - pad_y), pill)
    rgba.paste(logo, (x, y), logo)
    canvas.paste(rgba.convert("RGB"))


def draw_text_centered(
    d: ImageDraw.ImageDraw,
    y: int,
    text: str,
    fnt: ImageFont.FreeTypeFont,
    fill: tuple,
    max_w: int = W - 320,
    *,
    shadow: bool = False,
    shadow_rgba: tuple[int, int, int, int] = (11, 18, 32, 140),
    align: str = "center",
    x_anchor: int | None = None,
) -> int:
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
    lh = int(fnt.size * 1.25)
    for line in lines:
        tw = d.textlength(line, font=fnt)
        if align == "left" and x_anchor is not None:
            tx = x_anchor
        else:
            tx = (W - tw) // 2
        if shadow:
            for ox, oy in ((0, 4), (2, 6), (0, 8)):
                d.text((tx + ox, y + oy), line, fill=shadow_rgba[:3], font=fnt)
        d.text((tx, y), line, fill=fill, font=fnt)
        y += lh
    return y


def rounded_card(d: ImageDraw.ImageDraw, box: list, radius: int, fill, outline=None, width=2):
    d.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def post_01_hero() -> Image.Image:
    """Mint greeting-card hero — official light logo."""
    c = add_orbs(gradient_canvas("#F0FDF9", "#D1FAE5", "#86EFAC"), "mint")
    rgba = c.convert("RGBA")
    logo = load_logo_light(380)
    paste_logo(c, logo, W // 2, 140, center=True)

    d = ImageDraw.Draw(c)
    y = draw_text_centered(d, 560, "Dream Big.\nBorrow Smart.", font(156, True), rgb("#0B1220"))
    draw_text_centered(d, y + 50, "Personal Loans Up to ₹15,00,000", font(76, True), rgb(C["teal_deep"]))
    draw_text_centered(d, y + 150, "100% Digital · HDFC · ICICI · Bajaj Partners", font(46), rgb("#475569"))

    phone = draw_phone(SCREENS / "01-homepage.png", scale=1.55)
    sh = Image.new("RGBA", (phone.width + 120, phone.height + 120), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([30, 30, phone.width + 90, phone.height + 90], radius=80, fill=(0, 0, 0, 60))
    sh = sh.filter(ImageFilter.GaussianBlur(50))
    px, py = (W - phone.width) // 2, 1180
    rgba.paste(sh, (px - 40, py + 30), sh)
    rgba.paste(phone, (px, py), phone)
    c = rgba.convert("RGB")
    d = ImageDraw.Draw(c)

    # CTA pill
    cta = "Apply Now at www.neercred.com"
    cf = font(52, True)
    tw = d.textlength(cta, font=cf)
    rounded_card(d, [W // 2 - int(tw) // 2 - 60, H - 340, W // 2 + int(tw) // 2 + 60, H - 220],
                 50, rgb(C["navy"]))
    d.text((W // 2 - tw // 2, H - 310), cta, fill=rgb(C["white"]), font=cf)
    return c


def post_02_compare() -> Image.Image:
    """Navy — compare offers with HDFC."""
    c = add_orbs(gradient_canvas(C["navy"], C["teal_deep"], C["teal"]), "navy")
    rgba = c.convert("RGBA")
    logo = load_logo_dark(280)
    paste_logo(c, logo, W // 2, 160, center=True)

    d = ImageDraw.Draw(c)
    y = draw_text_centered(d, 500, "Compare. Choose.\nGet Funded.", font(136, True), rgb(C["white"]))
    draw_text_centered(d, y + 20, "Best eligible offers on one screen", font(52), rgb(C["muted"]))

    phone = draw_phone(SCREENS / "09-offers.png", scale=1.45)
    px, py = (W - phone.width) // 2, 1050
    sh = phone.copy().filter(ImageFilter.GaussianBlur(40))
    rgba.paste(sh, (px + 20, py + 40), sh)
    rgba.paste(phone, (px, py), phone)
    c = rgba.convert("RGB")
    d = ImageDraw.Draw(c)

    # Trust pills
    pills = ["HDFC · ICICI · Bajaj", "From 10.99% p.a.", "50+ Partner Offers"]
    x = 200
    for p in pills:
        pf = font(40, True)
        tw = d.textlength(p, font=pf)
        rounded_card(d, [x, H - 360, x + int(tw) + 80, H - 260], 40, (15, 118, 110, 180))
        d.text((x + 40, H - 330), p, fill=rgb(C["mint"]), font=pf)
        x += int(tw) + 120
    return c


def post_03_approved() -> Image.Image:
    """Approved ₹15L celebration."""
    c = add_orbs(gradient_canvas("#DBEAFE", "#E0F2FE", "#F0F9FF"), "mint")
    rgba = c.convert("RGBA")
    logo = load_logo_light(260)
    paste_logo(c, logo, W // 2, 150, center=True)

    d = ImageDraw.Draw(c)
    y = draw_text_centered(d, 480, "You May Qualify! 🎉", font(120, True), rgb(C["navy"]))
    draw_text_centered(d, y + 10, "Up to ₹15,00,000", font(96, True), rgb(C["teal"]))
    draw_text_centered(d, y + 120, "Indicative offer · Subject to lender approval", font(44), rgb("#64748B"))

    phone = draw_phone(SCREENS / "12-approved.png", scale=1.5)
    px, py = (W - phone.width) // 2, 1000
    rgba.paste(phone, (px, py), phone)
    c = rgba.convert("RGB")
    d = ImageDraw.Draw(c)
    draw_text_centered(d, H - 300, "Select your amount → Get disbursed fast", font(48, True), rgb(C["teal_deep"]))
    return c


def post_04_digital() -> Image.Image:
    """Skip the branch — digital journey."""
    c = add_orbs(gradient_canvas(C["navy"], "#134E4A", C["cyan"]), "navy")
    rgba = c.convert("RGBA")
    logo = load_logo_dark(270)
    paste_logo(c, logo, W // 2, 150, center=True)

    d = ImageDraw.Draw(c)
    y = draw_text_centered(d, 480, "Skip the Branch.", font(120, True), rgb(C["white"]))
    draw_text_centered(d, y + 10, "Get Your Loan 100% Online", font(80, True), rgb(C["mint"]))
    draw_text_centered(d, y + 120, "3-minute application · Secure OTP · PAN verify", font(46), rgb(C["muted"]))

    phone = draw_phone(SCREENS / "03-otp-email.png", scale=1.4)
    px, py = (W - phone.width) // 2, 1080
    rgba.paste(phone, (px, py), phone)
    c = rgba.convert("RGB")
    d = ImageDraw.Draw(c)

    bullets = ["✓  No branch visits", "✓  Compare HDFC & more", "✓  Funds to your bank"]
    by = H - 400
    for b in bullets:
        draw_text_centered(d, by, b, font(50, True), rgb(C["gold_light"]))
        by += 72
    return c


def post_05_cta() -> Image.Image:
    """Endcard-style CTA — mint premium."""
    c = add_orbs(gradient_canvas("#F0FDF9", "#A7F3D0", "#86EFAC"), "mint")
    rgba = c.convert("RGBA")
    logo = load_logo_light(340)
    paste_logo(c, logo, W // 2, 420, center=True)

    d = ImageDraw.Draw(c)
    y = draw_text_centered(d, 820, "Personal Loans\nMade Simple.", font(140, True), rgb("#0F172A"))
    draw_text_centered(d, y + 40, "India's Digital Lending Aggregator", font(52), rgb("#475569"))

    features = [
        ("Soft Check Only", "Won't hurt your score"),
        ("Zero Branch Visits", "Fully online journey"),
        ("Same-Day Disbursal", "When lender approves"),
    ]
    fy = 1350
    for title, sub in features:
        rounded_card(d, [220, fy, W - 220, fy + 200], 36, (255, 255, 255, 230), outline=rgb("#0F766E"), width=3)
        d.text((280, fy + 40), title, fill=rgb(C["navy"]), font=font(56, True))
        d.text((280, fy + 115), sub, fill=rgb("#64748B"), font=font(42))
        fy += 240

    cta = "www.neercred.com"
    cf = font(88, True)
    tw = d.textlength(cta, font=cf)
    rounded_card(d, [W // 2 - int(tw) // 2 - 80, H - 420, W // 2 + int(tw) // 2 + 80, H - 260], 60, rgb(C["teal"]))
    d.text((W // 2 - tw // 2, H - 380), cta, fill=rgb(C["white"]), font=cf)
    d.text((W // 2 - d.textlength("Apply Free →", font=font(44)) // 2, H - 180), "Apply Free →",
           fill=rgb("#047857"), font=font(44, True))
    return c


def save_all() -> list[Path]:
    OUT.mkdir(parents=True, exist_ok=True)
    ig_dir = OUT / "Instagram-1080x1350"
    k8_dir = OUT / "8K"
    ig_dir.mkdir(exist_ok=True)
    k8_dir.mkdir(exist_ok=True)

    posts = [
        ("01-hero-dream-big", post_01_hero),
        ("02-compare-offers", post_02_compare),
        ("03-approved-15l", post_03_approved),
        ("04-digital-online", post_04_digital),
        ("05-cta-apply", post_05_cta),
    ]
    paths: list[Path] = []
    for name, fn in posts:
        print(f"  Rendering {name}...")
        img = fn()
        p8k = k8_dir / f"NeerCred-IG-{name}-8K.png"
        img.save(p8k, "PNG", optimize=True)
        img.resize((1080, 1350), Image.Resampling.LANCZOS).save(
            ig_dir / f"NeerCred-IG-{name}-IG.png", "PNG", optimize=True
        )
        paths.append(p8k)
        print(f"    ✓ {p8k.name} ({img.size[0]}×{img.size[1]})")
    return paths


if __name__ == "__main__":
    print("=== NeerCred Instagram Posts (official logo) ===")
    save_all()
    print("Done.")
