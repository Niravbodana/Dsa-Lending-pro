#!/usr/bin/env python3
"""10 premium Instagram posts — AI lifestyle backgrounds + crisp official NeerCred logo."""

from __future__ import annotations

import shutil
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))
from generate_instagram_posts import (  # noqa: E402
    C,
    W,
    H,
    draw_text_centered,
    font,
    load_logo_dark,
    load_logo_light,
    paste_logo_branded,
    rgb,
)

BG_SRC = Path("/opt/cursor/artifacts/assets")
OUT = Path("/opt/cursor/artifacts/neercred-instagram-premium-10-v2")
K8 = OUT / "8K"
IG = OUT / "Instagram-1080x1350"

LOGO_H = 420
LOGO_X, LOGO_Y = 96, 84
HEADLINE_Y = 640
SAFE_BOTTOM = 160

# Marketing-audited palette per post: logo variant, scrim, headline/sub colors, shadows
POSTS = [
    {
        "bg": "bg-01-lifestyle-hero.png",
        "logo": "light",
        "scrim": "light",
        "headline": "Personal Loans\nUp to ₹15 Lakhs",
        "sub": "HDFC · ICICI · Bajaj · 100% Digital",
        "badge": "From 10.99% p.a. · Soft Check Only",
        "cta": "Apply at www.neercred.com",
        "head_color": "#0B1220",
        "sub_color": C["teal_deep"],
        "head_shadow": True,
        "footer_color": "#475569",
    },
    {
        "bg": "bg-02-wedding-loan.png",
        "logo": "light",
        "scrim": "light",
        "headline": "Your Dream Wedding\nDeserves the Best",
        "sub": "Personal Loans · Quick Approval",
        "badge": "Up to ₹15 Lakhs · Flexible EMI",
        "cta": "Check Eligibility on NeerCred",
        "head_color": "#0B1220",
        "sub_color": C["teal"],
        "head_shadow": True,
        "footer_color": "#475569",
    },
    {
        "bg": "bg-03-home-loan.png",
        "logo": "light",
        "scrim": "light_strong",
        "headline": "Upgrade Your\nHome Today",
        "sub": "Home Renovation Personal Loans",
        "badge": "Compare HDFC · ICICI · Bajaj",
        "cta": "Get Loan Offers →",
        "head_color": "#0B1220",
        "sub_color": C["teal_deep"],
        "head_shadow": True,
        "footer_color": "#475569",
    },
    {
        "bg": "bg-04-skip-branch.png",
        "logo": "dark",
        "scrim": "dark",
        "headline": "Skip the Branch.",
        "sub": "Get Your Personal Loan 100% Online",
        "badge": "3-Min Application · Secure OTP",
        "cta": "Start on www.neercred.com",
        "head_color": C["white"],
        "sub_color": C["mint"],
        "head_shadow": True,
        "footer_color": C["muted"],
    },
    {
        "bg": "bg-05-loan-approved.png",
        "logo": "dark",
        "scrim": "dark_top",
        "headline": "You May Qualify\nfor ₹15,00,000",
        "sub": "Indicative offer · Subject to lender approval",
        "badge": "Select Amount · Fast Disbursal",
        "cta": "Apply Now on NeerCred",
        "head_color": C["white"],
        "sub_color": C["mint"],
        "head_shadow": True,
        "footer_color": C["muted"],
    },
    {
        "bg": "bg-06-travel-loan.png",
        "logo": "dark",
        "scrim": "dark",
        "headline": "Finance Your\nDream Trip",
        "sub": "Personal Loans for Travel & Holidays",
        "badge": "Same-Day Approval · Digital KYC",
        "cta": "Explore Offers at neercred.com",
        "head_color": C["white"],
        "sub_color": C["gold_light"],
        "head_shadow": True,
        "footer_color": C["muted"],
    },
    {
        "bg": "bg-07-credit-card-hero.png",
        "logo": "dark",
        "scrim": "dark",
        "headline": "Premium Credit Cards.\nBest Rewards.",
        "sub": "Compare top cards on one platform",
        "badge": "Cashback · Lounge · Travel Miles",
        "cta": "Compare Cards on NeerCred",
        "head_color": C["white"],
        "sub_color": C["mint"],
        "head_shadow": True,
        "footer_color": C["muted"],
    },
    {
        "bg": "bg-08-cashback-card.png",
        "logo": "light",
        "scrim": "light_strong",
        "headline": "Earn Cashback on\nEvery Swipe",
        "sub": "Credit Cards with Rewards You'll Love",
        "badge": "Zero Annual Fee* · Instant Approval",
        "cta": "Find Your Card at neercred.com",
        "head_color": "#0B1220",
        "sub_color": C["teal"],
        "head_shadow": True,
        "footer_color": "#475569",
    },
    {
        "bg": "bg-09-business-loan.png",
        "logo": "dark",
        "scrim": "dark",
        "headline": "Grow Your Business\nFaster",
        "sub": "Business & Personal Loans · One Form",
        "badge": "Up to ₹15L · Trusted Partners",
        "cta": "Apply on www.neercred.com",
        "head_color": C["white"],
        "sub_color": C["mint"],
        "head_shadow": True,
        "footer_color": C["muted"],
    },
    {
        "bg": "bg-10-one-platform.png",
        "logo": "dark",
        "scrim": "dark",
        "headline": "Loans & Credit Cards.\nOne Platform.",
        "sub": "India's Digital Lending Aggregator",
        "badge": "Personal Loan · Credit Card · Compare",
        "cta": "www.neercred.com — Apply Free",
        "head_color": C["white"],
        "sub_color": C["gold_light"],
        "head_shadow": True,
        "footer_color": C["muted"],
    },
]


def apply_scrim(img: Image.Image, mode: str) -> Image.Image:
    rgba = img.convert("RGBA")
    scrim = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(scrim)

    if mode == "light":
        strength, depth = 0.72, 0.38
        for y in range(int(H * depth)):
            a = int(255 * strength * (1 - y / (H * depth)))
            sd.line([(0, y), (W, y)], fill=(248, 250, 252, a))
    elif mode == "light_strong":
        strength, depth = 0.88, 0.45
        for y in range(int(H * depth)):
            a = int(255 * strength * (1 - y / (H * depth)))
            sd.line([(0, y), (W, y)], fill=(248, 250, 252, a))
        for y in range(int(H * 0.72), H):
            t = (y - H * 0.72) / (H * 0.28)
            a = int(120 * t)
            sd.line([(0, y), (W, y)], fill=(11, 18, 32, a))
    elif mode == "dark_top":
        for y in range(int(H * 0.42)):
            a = int(220 * (1 - y / (H * 0.42)))
            sd.line([(0, y), (W, y)], fill=(11, 18, 32, a))
        for y in range(int(H * 0.78), H):
            t = (y - H * 0.78) / (H * 0.22)
            a = int(160 * t)
            sd.line([(0, y), (W, y)], fill=(11, 18, 32, a))
    else:  # dark
        for y in range(int(H * 0.48)):
            a = int(215 * (1 - y / (H * 0.48)))
            sd.line([(0, y), (W, y)], fill=(11, 18, 32, a))
        for y in range(int(H * 0.74), H):
            t = (y - H * 0.74) / (H * 0.26)
            a = int(190 * t)
            sd.line([(0, y), (W, y)], fill=(11, 18, 32, a))

    return Image.alpha_composite(rgba, scrim).convert("RGB")


def draw_badge_pill(
    d: ImageDraw.ImageDraw,
    y: int,
    text: str,
    *,
    dark_theme: bool,
) -> int:
    bf = font(44, True)
    btw = d.textlength(text, font=bf)
    bx0 = W // 2 - int(btw) // 2 - 54
    fill = rgb(C["teal"]) if dark_theme else rgb(C["navy"])
    d.rounded_rectangle([bx0, y, bx0 + int(btw) + 108, y + 88], radius=40, fill=fill)
    d.text((bx0 + 54, y + 18), text, fill=rgb(C["white"]), font=bf)
    return y + 88


def draw_cta_pill(d: ImageDraw.ImageDraw, text: str, *, dark_theme: bool) -> None:
    cf = font(50, True)
    ctw = d.textlength(text, font=cf)
    cy0 = H - 300
    fill = rgb(C["gold"]) if dark_theme else rgb(C["teal"])
    tc = rgb(C["navy"]) if dark_theme else rgb(C["white"])
    d.rounded_rectangle(
        [W // 2 - int(ctw) // 2 - 60, cy0, W // 2 + int(ctw) // 2 + 60, cy0 + 104],
        radius=52,
        fill=fill,
    )
    d.text((W // 2 - ctw // 2, cy0 + 24), text, fill=tc, font=cf)


def compose(post: dict, idx: int) -> Image.Image:
    src = BG_SRC / post["bg"]
    bg = Image.open(src).convert("RGB").resize((W, H), Image.Resampling.LANCZOS)
    bg = apply_scrim(bg, post["scrim"])

    dark_theme = post["logo"] == "dark"
    logo = load_logo_dark(LOGO_H) if dark_theme else load_logo_light(LOGO_H)
    paste_logo_branded(
        bg,
        logo,
        LOGO_X,
        LOGO_Y,
        glass=True,
        dark_glass=dark_theme,
    )

    d = ImageDraw.Draw(bg)
    shadow = post.get("head_shadow", False)
    shadow_rgba = (11, 18, 32, 160) if not dark_theme else (0, 0, 0, 180)

    y = draw_text_centered(
        d,
        HEADLINE_Y,
        post["headline"],
        font(136, True),
        rgb(post["head_color"]),
        shadow=shadow,
        shadow_rgba=shadow_rgba,
    )
    y = draw_text_centered(
        d,
        y + 28,
        post["sub"],
        font(58, True),
        rgb(post["sub_color"]),
        shadow=shadow,
        shadow_rgba=shadow_rgba,
    )
    y = draw_badge_pill(d, y + 48, post["badge"], dark_theme=dark_theme)
    draw_cta_pill(d, post["cta"], dark_theme=dark_theme)

    trust = "NeerCred TM · Purity & Trust · Digital Lending Aggregator"
    tf = font(34)
    ttw = d.textlength(trust, font=tf)
    d.text(
        (W // 2 - ttw // 2, H - SAFE_BOTTOM),
        trust,
        fill=rgb(post["footer_color"]),
        font=tf,
    )

    return bg


def verify_ig_preview(img: Image.Image, name: str) -> dict:
    """Quick legibility audit at Instagram feed size."""
    ig = img.resize((1080, 1350), Image.Resampling.LANCZOS)
    px = ig.load()
    # Sample logo corner brightness
    logo_samples = [px[x, y][:3] for x in (40, 80, 120) for y in (30, 60, 90)]
    avg_luma = sum(0.299 * r + 0.587 * g + 0.114 * b for r, g, b in logo_samples) / len(logo_samples)
    return {"name": name, "logo_zone_luma": round(avg_luma, 1), "size": ig.size}


def main() -> None:
    if K8.exists():
        shutil.rmtree(K8)
    if IG.exists():
        shutil.rmtree(IG)
    K8.mkdir(parents=True, exist_ok=True)
    IG.mkdir(parents=True, exist_ok=True)
    print("=== NeerCred Premium Pack v2 (10 posts, crisp logo) ===")
    audits: list[dict] = []
    for i, post in enumerate(POSTS, 1):
        slug = post["bg"].removeprefix("bg-").removesuffix(".png")
        name = slug
        print(f"  [{i}/10] {name}...")
        img = compose(post, i)
        p8k = K8 / f"NeerCred-Premium-{name}-8K.png"
        pig = IG / f"NeerCred-Premium-{name}-IG.png"
        img.save(p8k, "PNG", optimize=True)
        ig_img = img.resize((1080, 1350), Image.Resampling.LANCZOS)
        ig_img.save(pig, "PNG", optimize=True)
        audits.append(verify_ig_preview(img, name))
        print(f"    ✓ {p8k.name} + IG preview")

    for label, folder in [("8K", K8), ("IG", IG)]:
        shutil.make_archive(str(OUT / f"NeerCred-Premium-10-v2-{label}"), "zip", folder)

    print("\n--- Marketing audit (IG 1080×1350) ---")
    for a in audits:
        print(f"  {a['name']}: logo zone luma={a['logo_zone_luma']}")
    print(f"\nDone → {OUT}")


if __name__ == "__main__":
    main()
