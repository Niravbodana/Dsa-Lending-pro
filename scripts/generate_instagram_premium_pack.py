#!/usr/bin/env python3
"""10 premium Instagram posts — AI lifestyle backgrounds + official NeerCred logo overlay."""

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
    paste_logo,
    rgb,
)

BG_SRC = Path("/opt/cursor/artifacts/assets")
OUT = Path("/opt/cursor/artifacts/neercred-instagram-premium-10")
K8 = OUT / "8K"
IG = OUT / "Instagram-1080x1350"

POSTS = [
    {
        "bg": "bg-01-lifestyle-hero.png",
        "logo": "light",
        "headline": "Dream Big.\nBorrow Smart.",
        "sub": "Personal Loans Up to ₹15,00,000",
        "badge": "From 10.99% p.a. · 100% Digital",
        "cta": "Apply at www.neercred.com",
        "head_color": "#0B1220",
        "sub_color": C["teal_deep"],
    },
    {
        "bg": "bg-02-wedding-loan.png",
        "logo": "light",
        "headline": "Your Dream Wedding\nDeserves the Best",
        "sub": "Personal Loans · Quick Approval",
        "badge": "Up to ₹15 Lakhs · Flexible EMI",
        "cta": "Check Eligibility on NeerCred",
        "head_color": "#0B1220",
        "sub_color": C["teal"],
    },
    {
        "bg": "bg-03-home-loan.png",
        "logo": "light",
        "headline": "Upgrade Your\nHome Today",
        "sub": "Home Renovation Personal Loans",
        "badge": "Compare HDFC · ICICI · Bajaj",
        "cta": "Get Loan Offers →",
        "head_color": "#0B1220",
        "sub_color": C["teal_deep"],
    },
    {
        "bg": "bg-04-skip-branch.png",
        "logo": "dark",
        "headline": "Skip the Branch.",
        "sub": "Get Your Personal Loan 100% Online",
        "badge": "3-Min Application · Secure OTP",
        "cta": "Start on www.neercred.com",
        "head_color": C["white"],
        "sub_color": C["mint"],
    },
    {
        "bg": "bg-05-loan-approved.png",
        "logo": "light",
        "headline": "You May Qualify\nfor ₹15,00,000",
        "sub": "Indicative offer · Subject to lender approval",
        "badge": "Select Amount · Fast Disbursal",
        "cta": "Apply Now on NeerCred",
        "head_color": C["navy"],
        "sub_color": C["teal"],
    },
    {
        "bg": "bg-06-travel-loan.png",
        "logo": "dark",
        "headline": "Finance Your\nDream Trip",
        "sub": "Personal Loans for Travel & Holidays",
        "badge": "Same-Day Approval · Digital KYC",
        "cta": "Explore Offers at neercred.com",
        "head_color": C["white"],
        "sub_color": C["gold_light"],
    },
    {
        "bg": "bg-07-credit-card-hero.png",
        "logo": "dark",
        "headline": "Premium Credit Cards.\nBest Rewards.",
        "sub": "Compare top cards on one platform",
        "badge": "Cashback · Lounge · Travel Miles",
        "cta": "Compare Cards on NeerCred",
        "head_color": C["white"],
        "sub_color": C["mint"],
    },
    {
        "bg": "bg-08-cashback-card.png",
        "logo": "light",
        "headline": "Earn Cashback on\nEvery Swipe",
        "sub": "Credit Cards with Rewards You'll Love",
        "badge": "Zero Annual Fee* · Instant Approval",
        "cta": "Find Your Card at neercred.com",
        "head_color": "#0B1220",
        "sub_color": C["teal"],
    },
    {
        "bg": "bg-09-business-loan.png",
        "logo": "dark",
        "headline": "Grow Your Business\nFaster",
        "sub": "Business & Personal Loans · One Form",
        "badge": "Up to ₹15L · Trusted Partners",
        "cta": "Apply on www.neercred.com",
        "head_color": C["white"],
        "sub_color": C["mint"],
    },
    {
        "bg": "bg-10-one-platform.png",
        "logo": "dark",
        "headline": "Loans & Credit Cards.\nOne Platform.",
        "sub": "India's Digital Lending Aggregator",
        "badge": "Personal Loan · Credit Card · Compare",
        "cta": "www.neercred.com — Apply Free",
        "head_color": C["white"],
        "sub_color": C["gold_light"],
    },
]


def top_scrim(img: Image.Image, strength: float = 0.55) -> Image.Image:
    """Soft gradient scrim at top so logo/text always readable."""
    rgba = img.convert("RGBA")
    scrim = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(scrim)
    for y in range(int(H * 0.42)):
        a = int(255 * strength * (1 - y / (H * 0.42)))
        sd.line([(0, y), (W, y)], fill=(248, 250, 252, a))
    rgba = Image.alpha_composite(rgba, scrim)
    return rgba.convert("RGB")


def dark_scrim(img: Image.Image) -> Image.Image:
    rgba = img.convert("RGBA")
    scrim = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    sd = ImageDraw.Draw(scrim)
    for y in range(int(H * 0.45)):
        a = int(200 * (1 - y / (H * 0.45)))
        sd.line([(0, y), (W, y)], fill=(11, 18, 32, a))
    for y in range(int(H * 0.75), H):
        t = (y - H * 0.75) / (H * 0.25)
        a = int(180 * t)
        sd.line([(0, y), (W, y)], fill=(11, 18, 32, a))
    return Image.alpha_composite(rgba, scrim).convert("RGB")


def compose(post: dict, idx: int) -> Image.Image:
    src = BG_SRC / post["bg"]
    bg = Image.open(src).convert("RGB").resize((W, H), Image.Resampling.LANCZOS)
    if post["logo"] == "dark":
        bg = dark_scrim(bg)
    else:
        bg = top_scrim(bg)

    logo = load_logo_dark(260) if post["logo"] == "dark" else load_logo_light(260)
    paste_logo(bg, logo, W // 2, 120, center=True)

    d = ImageDraw.Draw(bg)
    y = draw_text_centered(d, 420, post["headline"], font(132, True), rgb(post["head_color"]))
    y = draw_text_centered(d, y + 24, post["sub"], font(56, True), rgb(post["sub_color"]))

    # Badge pill
    bf = font(42, True)
    badge = post["badge"]
    btw = d.textlength(badge, font=bf)
    bx0 = W // 2 - int(btw) // 2 - 50
    d.rounded_rectangle([bx0, y + 40, bx0 + int(btw) + 100, y + 120], radius=36,
                        fill=rgb(C["teal"]) if post["logo"] == "dark" else rgb(C["navy"]))
    d.text((bx0 + 50, y + 58), badge, fill=rgb(C["white"]), font=bf)

    # CTA at bottom
    cf = font(48, True)
    cta = post["cta"]
    ctw = d.textlength(cta, font=cf)
    cy0 = H - 280
    fill = rgb(C["gold"]) if post["logo"] == "dark" else rgb(C["teal"])
    d.rounded_rectangle([W // 2 - int(ctw) // 2 - 56, cy0, W // 2 + int(ctw) // 2 + 56, cy0 + 100],
                        radius=50, fill=fill)
    tc = rgb(C["navy"]) if post["logo"] == "dark" else rgb(C["white"])
    d.text((W // 2 - ctw // 2, cy0 + 22), cta, fill=tc, font=cf)

    # Footer trust line
    trust = "NeerCred™ · Purity & Trust · Digital Lending Aggregator"
    tf = font(32)
    ttw = d.textlength(trust, font=tf)
    d.text((W // 2 - ttw // 2, H - 140), trust, fill=rgb(C["muted"]) if post["logo"] == "dark" else rgb("#64748B"), font=tf)

    return bg


def main() -> None:
    K8.mkdir(parents=True, exist_ok=True)
    IG.mkdir(parents=True, exist_ok=True)
    print("=== NeerCred Premium Pack (10 posts) ===")
    for i, post in enumerate(POSTS, 1):
        name = f"{i:02d}-{post['bg'].replace('bg-','').replace('.png','')}"
        print(f"  [{i}/10] {name}...")
        img = compose(post, i)
        p8k = K8 / f"NeerCred-Premium-{name}-8K.png"
        img.save(p8k, "PNG", optimize=True)
        img.resize((1080, 1350), Image.Resampling.LANCZOS).save(
            IG / f"NeerCred-Premium-{name}-IG.png", "PNG", optimize=True
        )
        print(f"    ✓ {p8k.name}")

    for label, folder in [("8K", K8), ("IG", IG)]:
        shutil.make_archive(str(OUT / f"NeerCred-Premium-10-{label}"), "zip", folder)
    print(f"\nDone → {OUT}")


if __name__ == "__main__":
    main()
