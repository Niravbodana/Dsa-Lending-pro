#!/usr/bin/env python3
"""5 premium Instagram posts — NeerCred Brand & Video Style Guide compliant."""

from __future__ import annotations

import math
import shutil
import sys
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from generate_instagram_posts import (  # noqa: E402
    W,
    H,
    add_orbs,
    draw_text_centered,
    load_logo_dark,
    load_logo_light,
    paste_logo,
    paste_logo_branded,
    rgb,
)

OUT = Path("/opt/cursor/artifacts/neercred-instagram-brand-5")
ASSETS = OUT / "assets"
K8 = OUT / "8K"
IG = OUT / "Instagram-1080x1350"

# Style Guide Section 2 — exact palette
BRAND = {
    "navy": "#0B1220",
    "teal": "#0F766E",
    "teal_deep": "#134E4A",
    "cyan": "#0891B2",
    "mint": "#5EEAD4",
    "gold": "#D4A017",
    "gold_light": "#FDE68A",
    "bg_blue": "#E8F4FC",
    "white": "#F8FAFC",
    "muted": "#64748B",
    "slate": "#475569",
}

LOGO_H = 400
LOGO_X, LOGO_Y = 96, 84


def ensure_brand_fonts() -> dict[str, Path]:
    ASSETS.mkdir(parents=True, exist_ok=True)
    urls = {
        "Poppins-ExtraBold.ttf": "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-ExtraBold.ttf",
        "Poppins-Bold.ttf": "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-Bold.ttf",
        "Poppins-SemiBold.ttf": "https://github.com/google/fonts/raw/main/ofl/poppins/Poppins-SemiBold.ttf",
        "Geist-Regular.ttf": "https://github.com/google/fonts/raw/main/ofl/geist/Geist%5Bwght%5D.ttf",
    }
    paths: dict[str, Path] = {}
    for name, url in urls.items():
        p = ASSETS / name
        if not p.exists() or p.stat().st_size < 1000:
            urllib.request.urlretrieve(url, p)
        paths[name.replace(".ttf", "").replace("-", "_").lower()] = p
    return {
        "heading_xb": ASSETS / "Poppins-ExtraBold.ttf",
        "heading_b": ASSETS / "Poppins-Bold.ttf",
        "heading_sb": ASSETS / "Poppins-SemiBold.ttf",
        "body": ASSETS / "Geist-Regular.ttf",
    }


_FONTS: dict[str, Path] | None = None


def fonts() -> dict[str, Path]:
    global _FONTS
    if _FONTS is None:
        _FONTS = ensure_brand_fonts()
    return _FONTS


def poppins(sz: int, weight: str = "xb") -> ImageFont.FreeTypeFont:
    f = fonts()
    key = {"xb": "heading_xb", "b": "heading_b", "sb": "heading_sb"}[weight]
    return ImageFont.truetype(str(f[key]), sz)


def geist(sz: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(fonts()["body"]), sz)


def lerp(c0: tuple[int, int, int], c1: tuple[int, int, int], t: float) -> tuple[int, int, int]:
    return tuple(int(c0[i] + (c1[i] - c0[i]) * t) for i in range(3))


def multi_stop_color(stops: list[tuple[float, str]], t: float) -> tuple[int, int, int]:
    t = max(0.0, min(1.0, t))
    for i in range(len(stops) - 1):
        t0, c0 = stops[i]
        t1, c1 = stops[i + 1]
        if t0 <= t <= t1:
            u = (t - t0) / (t1 - t0) if t1 > t0 else 0
            return lerp(rgb(c0), rgb(c1), u)
    return rgb(stops[-1][1])


def gradient_diagonal(stops: list[tuple[float, str]], angle_deg: float = 135) -> Image.Image:
    """Diagonal gradient — hero 135deg, page 165deg per style guide."""
    img = Image.new("RGB", (W, H))
    px = img.load()
    rad = math.radians(angle_deg)
    cos_a, sin_a = math.cos(rad), math.sin(rad)
    corners = [(0, 0), (W, 0), (0, H), (W, H)]
    projections = [x * cos_a + y * sin_a for x, y in corners]
    pmin, pmax = min(projections), max(projections)
    span = pmax - pmin or 1
    step = 4  # sample every 4px then fill block for speed
    for y in range(0, H, step):
        for x in range(0, W, step):
            t = (x * cos_a + y * sin_a - pmin) / span
            col = multi_stop_color(stops, t)
            for dy in range(step):
                for dx in range(step):
                    if x + dx < W and y + dy < H:
                        px[x + dx, y + dy] = col
    return img


def page_bg() -> Image.Image:
    """Page background 165deg: sky-blue wash per style guide."""
    stops = [
        (0.0, "#DBEAFE"),
        (0.25, "#E0F2FE"),
        (0.5, "#F0F9FF"),
        (0.75, "#ECFEFF"),
        (1.0, "#F8FAFC"),
    ]
    return add_orbs(gradient_diagonal(stops, 165), "mint")


def hero_bg() -> Image.Image:
    """Hero/dark 135deg: Navy → Teal → Cyan."""
    stops = [(0.0, BRAND["navy"]), (0.45, BRAND["teal"]), (1.0, BRAND["cyan"])]
    return add_orbs(gradient_diagonal(stops, 135), "navy")


def cta_bg() -> Image.Image:
    """CTA button bg gradient 135deg: Navy → Deep Teal → Teal."""
    stops = [(0.0, BRAND["navy"]), (0.5, BRAND["teal_deep"]), (1.0, BRAND["teal"])]
    return gradient_diagonal(stops, 135)


def draw_cta_button(d: ImageDraw.ImageDraw, y: int, text: str, *, gold: bool = False) -> None:
    cf = poppins(48, "b")
    ctw = d.textlength(text, font=cf)
    bx0 = W // 2 - int(ctw) // 2 - 64
    by0, by1 = y, y + 108
    if gold:
        # Gold accent gradient approximation
        d.rounded_rectangle([bx0, by0, bx0 + int(ctw) + 128, by1], radius=54, fill=rgb(BRAND["gold"]))
        tc = rgb(BRAND["navy"])
    else:
        d.rounded_rectangle([bx0, by0, bx0 + int(ctw) + 128, by1], radius=54, fill=rgb(BRAND["teal"]))
        tc = rgb(BRAND["white"])
    d.text((W // 2 - ctw // 2, y + 26), text, fill=tc, font=cf)


def draw_badge(d: ImageDraw.ImageDraw, y: int, text: str, *, dark: bool) -> int:
    bf = poppins(38, "sb")
    btw = d.textlength(text, font=bf)
    bx0 = W // 2 - int(btw) // 2 - 48
    fill = (15, 118, 110, 200) if dark else rgb(BRAND["navy"])
    d.rounded_rectangle([bx0, y, bx0 + int(btw) + 96, y + 80], radius=40, fill=fill)
    d.text((bx0 + 48, y + 18), text, fill=rgb(BRAND["white"] if not dark else BRAND["mint"]), font=bf)
    return y + 80


def draw_feature_cards(d: ImageDraw.ImageDraw, items: list[tuple[str, str]], y0: int) -> None:
    card_h = 180
    gap = 32
    for title, sub in items:
        rounded_card(d, [200, y0, W - 200, y0 + card_h], 32, rgb(BRAND["white"]), outline=rgb(BRAND["teal"]), width=3)
        d.text((260, y0 + 36), title, fill=rgb(BRAND["navy"]), font=poppins(50, "b"))
        d.text((260, y0 + 108), sub, fill=rgb(BRAND["slate"]), font=geist(40))
        y0 += card_h + gap


def rounded_card(d, box, radius, fill, outline=None, width=2):
    d.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def footer_legal(d: ImageDraw.ImageDraw, y: int, *, dark: bool = False) -> None:
  lines = [
      "Purity & Trust  |  Digital Lending Aggregator",
      "Nirav Enterprises, operating as NeerCred",
  ]
  col = rgb(BRAND["muted"] if dark else BRAND["slate"])
  gf = geist(30)
  for line in lines:
      tw = d.textlength(line, font=gf)
      d.text((W // 2 - tw // 2, y), line, fill=col, font=gf)
      y += 42


def post_01_brand_hero() -> Image.Image:
    """Intro — tagline + positioning on light page gradient."""
    c = page_bg()
    paste_logo_branded(c, load_logo_light(LOGO_H), LOGO_X, LOGO_Y, glass=False)

    d = ImageDraw.Draw(c)
    y = draw_text_centered(d, 620, "Dream Big.\nBorrow Smart.", poppins(148, "xb"), rgb(BRAND["navy"]), shadow=True)
    y = draw_text_centered(d, y + 32, "India's Digital Lending Aggregator", geist(56), rgb(BRAND["teal"]), shadow=True)
    draw_text_centered(d, y + 20, "Purity & Trust", poppins(52, "sb"), rgb(BRAND["gold"]), shadow=True)

    draw_badge(d, y + 100, "Personal Loans  |  Credit Cards  |  Compare", dark=False)
    draw_cta_button(d, H - 360, "www.neercred.com")
    footer_legal(d, H - 200)
    return c


def post_02_eligible_offers() -> Image.Image:
    """Eligible offers — compliant language, dark hero gradient."""
    c = hero_bg()
    paste_logo_branded(c, load_logo_dark(LOGO_H), LOGO_X, LOGO_Y, glass=True, dark_glass=True)

    d = ImageDraw.Draw(c)
    y = draw_text_centered(
        d, 620, "Compare Eligible\nLoan Offers", poppins(136, "xb"), rgb(BRAND["white"]),
        shadow=True, shadow_rgba=(0, 0, 0, 160),
    )
    y = draw_text_centered(
        d, y + 28, "You may qualify for up to", geist(52), rgb(BRAND["mint"]),
        shadow=True, shadow_rgba=(0, 0, 0, 140),
    )
    draw_text_centered(
        d, y + 12, "₹15,00,000", poppins(120, "xb"), rgb(BRAND["gold_light"]),
        shadow=True, shadow_rgba=(0, 0, 0, 160),
    )
    draw_badge(d, y + 160, "Indicative only  |  Subject to lender approval", dark=True)
    draw_cta_button(d, H - 380, "Check Eligibility on NeerCred", gold=True)
    footer_legal(d, H - 220, dark=True)
    return c


def post_03_digital_journey() -> Image.Image:
    """100% digital — warm, confident, no branch visits."""
    c = add_orbs(gradient_diagonal(
        [(0.0, BRAND["navy"]), (0.5, BRAND["teal_deep"]), (1.0, BRAND["teal"])], 135
    ), "navy")
    paste_logo_branded(c, load_logo_dark(LOGO_H), LOGO_X, LOGO_Y, glass=True, dark_glass=True)

    d = ImageDraw.Draw(c)
    y = draw_text_centered(
        d, 620, "Skip the Branch.\nBorrow Smart.", poppins(132, "xb"), rgb(BRAND["white"]),
        shadow=True, shadow_rgba=(0, 0, 0, 160),
    )
    y = draw_text_centered(
        d, y + 24, "100% online application on one platform", geist(52), rgb(BRAND["mint"]),
        shadow=True, shadow_rgba=(0, 0, 0, 140),
    )

    bullets = [
        ("Soft eligibility check", "Won't hurt your credit score"),
        ("Compare partner offers", "HDFC, ICICI, Bajaj & more"),
        ("Digital from start to finish", "OTP, PAN verify, select offer"),
    ]
    draw_feature_cards(d, bullets, y + 80)
    draw_cta_button(d, H - 340, "Start at www.neercred.com")
    footer_legal(d, H - 180, dark=True)
    return c


def post_04_partner_compare() -> Image.Image:
    """Partner compare — light page bg, indicative rates."""
    c = page_bg()
    paste_logo_branded(c, load_logo_light(LOGO_H), LOGO_X, LOGO_Y, glass=False)

    d = ImageDraw.Draw(c)
    y = draw_text_centered(
        d, 620, "One Form.\nMultiple Offers.", poppins(136, "xb"), rgb(BRAND["navy"]), shadow=True,
    )
    y = draw_text_centered(
        d, y + 28, "We match you with trusted lending partners", geist(52), rgb(BRAND["slate"]), shadow=True,
    )

    pills = [
        "HDFC  |  ICICI  |  Bajaj",
        "From 10.99% p.a. indicative",
        "50+ partner offers",
    ]
    py = y + 80
    for p in pills:
        draw_badge(d, py, p, dark=False)
        py += 100

    draw_text_centered(
        d, py + 40,
        "Rates shown are indicative only.\nFinal terms depend on lender approval.",
        geist(40), rgb(BRAND["muted"]), shadow=False,
    )
    draw_cta_button(d, H - 360, "Compare Offers on NeerCred")
    footer_legal(d, H - 200)
    return c


def post_05_end_card() -> Image.Image:
    """End-card — logo, tagline, website, legal line."""
    c = page_bg()
    logo = load_logo_light(520)
    paste_logo(c, logo, W // 2, 480, center=True)

    d = ImageDraw.Draw(c)
    y = draw_text_centered(d, 1100, "Dream Big. Borrow Smart.", poppins(100, "xb"), rgb(BRAND["navy"]))
    y = draw_text_centered(d, y + 24, "Purity & Trust", poppins(56, "sb"), rgb(BRAND["gold"]))
    y = draw_text_centered(d, y + 16, "Digital Lending Aggregator", geist(52), rgb(BRAND["teal"]))

    draw_feature_cards(d, [
        ("Eligible offers, not guarantees", "Subject to partner approval"),
        ("Never a bank or lender", "We connect you to partners"),
        ("100% digital journey", "Apply free at neercred.com"),
    ], y + 80)

    cf = poppins(80, "xb")
    cta = "www.neercred.com"
    tw = d.textlength(cta, font=cf)
    rounded_card(d, [W // 2 - int(tw) // 2 - 72, H - 520, W // 2 + int(tw) // 2 + 72, H - 360], 56, rgb(BRAND["teal"]))
    d.text((W // 2 - tw // 2, H - 490), cta, fill=rgb(BRAND["white"]), font=cf)
    d.text((W // 2 - d.textlength("Apply Free", font=geist(44)) // 2, H - 300), "Apply Free",
           fill=rgb(BRAND["teal_deep"]), font=geist(44))

    footer_legal(d, H - 200)
    return c


POSTS = [
    ("01-brand-hero", post_01_brand_hero),
    ("02-eligible-offers", post_02_eligible_offers),
    ("03-digital-journey", post_03_digital_journey),
    ("04-partner-compare", post_04_partner_compare),
    ("05-end-card", post_05_end_card),
]


def main() -> None:
    if K8.exists():
        shutil.rmtree(K8)
    if IG.exists():
        shutil.rmtree(IG)
    K8.mkdir(parents=True)
    IG.mkdir(parents=True)

    print("=== NeerCred Brand Pack — 5 Style-Guide Posts ===")
    fonts()  # prefetch
    for name, fn in POSTS:
        print(f"  Rendering {name}...")
        img = fn()
        p8k = K8 / f"NeerCred-Brand-{name}-8K.png"
        pig = IG / f"NeerCred-Brand-{name}-IG.png"
        img.save(p8k, "PNG", optimize=True)
        img.resize((1080, 1350), Image.Resampling.LANCZOS).save(pig, "PNG", optimize=True)
        print(f"    OK {pig.name}")

    for label, folder in [("8K", K8), ("IG", IG)]:
        shutil.make_archive(str(OUT / f"NeerCred-Brand-5-{label}"), "zip", folder)
    print(f"\nDone -> {OUT}")


if __name__ == "__main__":
    main()
