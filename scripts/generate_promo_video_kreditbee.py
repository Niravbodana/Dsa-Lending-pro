#!/usr/bin/env python3
"""NeerCred KreditBee-style promo: split-screen (text + phone), female Hindi VO, piano BGM."""

from __future__ import annotations

import asyncio
import json
import math
import subprocess
from pathlib import Path

import edge_tts
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = Path("/opt/cursor/artifacts/neercred-promo-video")
SCENES_DIR = OUT / "scenes"
AUDIO_DIR = OUT / "audio"
FRAMES_DIR = OUT / "frames"
PHONE_DIR = OUT / "phone-screens"

# 16:9 landscape — KreditBee website style
W, H = 1920, 1080
FPS = 30
VOICE = "hi-IN-SwaraNeural"  # Female Hindi voice
RATE = "+5%"
PITCH = "+2Hz"

BRAND = {
    "navy": "#0B1220",
    "teal": "#0F766E",
    "mint": "#14B8A6",
    "cyan": "#0891B2",
    "gold": "#D4A017",
    "white": "#F8FAFC",
    "slate": "#64748B",
    "sky": "#DBEAFE",
    "ice": "#F0F9FF",
    "light": "#F8FAFC",
}

# Complete workflow — every step covered
SCENES = [
    {
        "id": "intro",
        "step": None,
        "badge": "RBI LSP Registered Platform",
        "headline": "NeerCred",
        "sub": "Dream Big. Borrow Smart.",
        "bullets": ["Personal loans up to ₹10 Lakhs", "50+ partner lenders", "100% digital journey"],
        "vo": "Neer Cred — sapna bada ho, loan lena ab easy hai. Dream Big, Borrow Smart.",
        "screen": "intro",
    },
    {
        "id": "homepage",
        "step": "01",
        "badge": "Step 1 — Homepage",
        "headline": "One Platform.\nEvery Financial Goal.",
        "sub": "Compare offers from HDFC, ICICI, Bajaj & 15+ lenders",
        "bullets": ["Instant loans up to ₹20 Lakhs", "Zero branch visits", "Soft check — no credit impact"],
        "vo": "Neer Cred par aaiye. Ek hi platform par sabse best loan offers compare karein.",
        "screen": "homepage",
    },
    {
        "id": "mobile",
        "step": "02",
        "badge": "Step 2 — Mobile Number",
        "headline": "Mobile Number\n+ OTP Verify",
        "sub": "Secure SMS verification in seconds",
        "bullets": ["10-digit mobile enter karein", "OTP SMS par aayega", "DPDP Act 2023 compliant"],
        "vo": "Apna mobile number daaliye. OTP verify kijiye — bilkul safe aur secure.",
        "screen": "mobile",
    },
    {
        "id": "profile",
        "step": "03",
        "badge": "Step 3 — Profile Details",
        "headline": "PAN, Income\n& Personal Info",
        "sub": "One form — no repeat entry",
        "bullets": ["PAN se auto-fill", "Income & employment", "Loan purpose select"],
        "vo": "Profile complete kijiye — PAN, income, employment. Ek baar bhariye, baar baar nahi.",
        "screen": "profile",
    },
    {
        "id": "consent",
        "step": "04",
        "badge": "Step 4 — Consent",
        "headline": "Terms &\nDPDP Consent",
        "sub": "Transparent data processing",
        "bullets": ["Privacy Policy accept", "DPDP Act 2023 consent", "Optional credit bureau check"],
        "vo": "Privacy aur DPDP consent accept kijiye. Aapka data poori tarah safe hai.",
        "screen": "consent",
    },
    {
        "id": "eligibility",
        "step": "05",
        "badge": "Step 5 — Eligibility",
        "headline": "Instant\nEligibility Check",
        "sub": "Score & amount in real-time",
        "bullets": ["Up to ₹10 Lakhs eligible", "Credit score analysis", "5 minute approval"],
        "vo": "Eligibility turant check hoti hai. Aap kitne loan ke liye eligible hain, abhi jaaniye.",
        "screen": "eligibility",
    },
    {
        "id": "offers",
        "step": "06",
        "badge": "Step 6 — Compare Offers",
        "headline": "50+ Partner\nOffers Side by Side",
        "sub": "Lowest rate · Lowest EMI · Best match",
        "bullets": ["HDFC, ICICI, Bajaj & more", "Sort by rate or EMI", "Transparent fees shown"],
        "vo": "50 se zyada partners ke offers ek hi screen par. Best rate aur EMI compare karein.",
        "screen": "offers",
    },
    {
        "id": "select",
        "step": "07",
        "badge": "Step 7 — Select Offer",
        "headline": "Choose Your\nBest Offer",
        "sub": "Recommended match for your profile",
        "bullets": ["Lowest rate highlighted", "EMI & tenure clear", "One-click selection"],
        "vo": "Apna best offer select kijiye. Recommended offer aapke profile ke liye perfect hai.",
        "screen": "select",
    },
    {
        "id": "kyc",
        "step": "08",
        "badge": "Step 8 — Aadhaar eKYC",
        "headline": "Aadhaar OTP\nVerification",
        "sub": "UIDAI-linked mobile OTP",
        "bullets": ["Aadhaar number enter", "OTP on linked mobile", "Instant eKYC complete"],
        "vo": "Aadhaar eKYC — ghar baithe. OTP aayega, verify kijiye, ho gaya.",
        "screen": "kyc",
    },
    {
        "id": "bank",
        "step": "09",
        "badge": "Step 9 — Bank Verify",
        "headline": "Bank Account\nVerification",
        "sub": "Penny drop — ₹1 credit & reverse",
        "bullets": ["Account number & IFSC", "Instant verification", "Disbursal account linked"],
        "vo": "Bank account verify kijiye. Penny drop se instant confirmation.",
        "screen": "bank",
    },
    {
        "id": "esign",
        "step": "10",
        "badge": "Step 10 — Digital eSign",
        "headline": "Loan Agreement\neSign",
        "sub": "RBI compliant digital signature",
        "bullets": ["Read loan agreement", "Digital signature", "Legally binding"],
        "vo": "Digital eSign kijiye. Loan agreement padhiye aur sign kijiye — poora legal.",
        "screen": "esign",
    },
    {
        "id": "submit",
        "step": "11",
        "badge": "Step 11 — Submit",
        "headline": "Application\nSubmitted! 🎉",
        "sub": "Partner lender will review",
        "bullets": ["Application sent to lender", "Track on dashboard", "Disbursal in 24-48 hrs"],
        "vo": "Application submit ho gayi! Partner lender review karega, jaldi disbursal.",
        "screen": "submit",
    },
    {
        "id": "dashboard",
        "step": "12",
        "badge": "Step 12 — Track & Dashboard",
        "headline": "Track Your\nLoan Anytime",
        "sub": "Real-time status updates",
        "bullets": ["Application status live", "Ref number se track", "Dashboard par sab kuch"],
        "vo": "Dashboard par apna loan track kijiye. Status, offers, sab ek jagah.",
        "screen": "dashboard",
    },
    {
        "id": "close",
        "step": None,
        "badge": "Apply Now",
        "headline": "dev.neercred.com",
        "sub": "Dream Big. Borrow Smart.",
        "bullets": ["Rates from 10.99% p.a.", "100% Digital · Zero Hidden Charges", "RBI LSP Registered"],
        "vo": "Abhi apply karein — dev dot neer cred dot com. Neer Cred — Dream Big, Borrow Smart.",
        "screen": "close",
    },
]


def run(cmd: list[str], **kwargs) -> subprocess.CompletedProcess:
    print("$", " ".join(cmd[:8]), "..." if len(cmd) > 8 else "")
    return subprocess.run(cmd, check=True, **kwargs)


def hex_rgb(h: str) -> tuple[int, int, int]:
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    paths = [
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ]
    for p in paths:
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def wrap_lines(text: str, font: ImageFont.ImageFont, max_w: int) -> list[str]:
    words = text.replace("\n", " \n ").split()
    lines: list[str] = []
    cur = ""
    m = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    for w in words:
        if w == "\n":
            if cur:
                lines.append(cur)
            lines.append("")
            cur = ""
            continue
        trial = f"{cur} {w}".strip()
        if m.textlength(trial, font=font) <= max_w:
            cur = trial
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines or [text]


# ─── Phone screen renderers ───────────────────────────────────────────────

PHONE_W, PHONE_H = 380, 780
SCREEN_X, SCREEN_Y = 18, 72
SCREEN_W, SCREEN_H = 344, 680


def draw_phone_frame(base: Image.Image, x: int, y: int) -> tuple[int, int, int, int]:
    """Draw iPhone-style frame, return screen rect."""
    draw = ImageDraw.Draw(base)
    px, py = x, y
    pw, ph = PHONE_W, PHONE_H

    # Shadow
    shadow = Image.new("RGBA", (pw + 40, ph + 40), (0, 0, 0, 0))
    sd = ImageDraw.Draw(shadow)
    sd.rounded_rectangle([20, 20, pw + 20, ph + 20], radius=48, fill=(0, 0, 0, 60))
    shadow = shadow.filter(ImageFilter.GaussianBlur(12))
    base_rgba = base.convert("RGBA")
    base_rgba.paste(shadow, (px - 10, py + 8), shadow)

    # Frame body
    draw = ImageDraw.Draw(base_rgba)
    draw.rounded_rectangle([px, py, px + pw, py + ph], radius=44, fill="#1a1a2e", outline="#2d2d44", width=3)
    # Inner bezel
    draw.rounded_rectangle([px + 6, py + 6, px + pw - 6, py + ph - 6], radius=40, outline="#3d3d5c", width=1)
    # Notch
    nw = 120
    draw.rounded_rectangle([px + (pw - nw) // 2, py + 12, px + (pw + nw) // 2, py + 32], radius=12, fill="#0a0a14")
    # Home indicator
    draw.rounded_rectangle([px + pw // 2 - 50, py + ph - 22, px + pw // 2 + 50, py + ph - 14], radius=4, fill="#555")

    base.paste(base_rgba.convert("RGB"))
    return (px + SCREEN_X, py + SCREEN_Y, px + SCREEN_X + SCREEN_W, py + SCREEN_Y + SCREEN_H)


def fill_screen_gradient(img: Image.Image, rect: tuple[int, int, int, int]) -> None:
    x1, y1, x2, y2 = rect
    draw = ImageDraw.Draw(img)
    for y in range(y1, y2):
        t = (y - y1) / max(1, y2 - y1)
        c = tuple(int(hex_rgb("#DBEAFE")[i] + (hex_rgb("#F8FAFC")[i] - hex_rgb("#DBEAFE")[i]) * t) for i in range(3))
        draw.line([(x1, y), (x2, y)], fill=c)


def draw_mini_logo(draw: ImageDraw.ImageDraw, cx: int, y: int) -> None:
    """Simple NeerCred text logo in phone screen."""
    font = load_font(22, bold=True)
    text = "NeerCred"
    tw = draw.textlength(text, font=font)
    draw.text((cx - tw // 2, y), text, fill=hex_rgb(BRAND["navy"]), font=font)
    sub = load_font(9)
    st = "Dream Big. Borrow Smart."
    sw = draw.textlength(st, font=sub)
    draw.text((cx - sw // 2, y + 26), st, fill=hex_rgb(BRAND["slate"]), font=sub)


def draw_phone_btn(draw: ImageDraw.ImageDraw, x: int, y: int, w: int, text: str, primary: bool = True) -> None:
    h = 44
    color = hex_rgb(BRAND["teal"]) if primary else hex_rgb(BRAND["slate"])
    draw.rounded_rectangle([x, y, x + w, y + h], radius=12, fill=color)
    font = load_font(16, bold=True)
    tw = draw.textlength(text, font=font)
    draw.text((x + (w - tw) // 2, y + 12), text, fill=(255, 255, 255), font=font)


def render_phone_screen(screen_id: str) -> Image.Image:
    """Render app UI inside phone screen area."""
    img = Image.new("RGB", (SCREEN_W, SCREEN_H), BRAND["light"])
    draw = ImageDraw.Draw(img)
    cx = SCREEN_W // 2
    navy, teal, slate, gold = hex_rgb(BRAND["navy"]), hex_rgb(BRAND["teal"]), hex_rgb(BRAND["slate"]), hex_rgb(BRAND["gold"])
    mint = hex_rgb(BRAND["mint"])

    if screen_id == "intro":
        for y in range(SCREEN_H):
            t = y / SCREEN_H
            c = tuple(int(hex_rgb("#0B1220")[i] * (1 - t * 0.3) + hex_rgb("#0F766E")[i] * t * 0.3) for i in range(3))
            draw.line([(0, y), (SCREEN_W, y)], fill=c)
        draw_mini_logo(draw, cx, 200)
        tag = load_font(28, bold=True)
        t1 = "Dream Big."
        t2 = "Borrow Smart."
        draw.text((cx - draw.textlength(t1, font=tag) // 2, 280), t1, fill=(255, 255, 255), font=tag)
        draw.text((cx - draw.textlength(t2, font=tag) // 2, 320), t2, fill=gold, font=tag)
        draw_phone_btn(draw, 40, 500, SCREEN_W - 80, "Get Loan Offers →")

    elif screen_id == "homepage":
        fill_screen_gradient(img, (0, 0, SCREEN_W, SCREEN_H))
        draw = ImageDraw.Draw(img)
        draw_mini_logo(draw, cx, 30)
        hfont = load_font(20, bold=True)
        lines = ["One Platform.", "Every Financial Goal."]
        y = 100
        for line in lines:
            draw.text((30, y), line, fill=navy, font=hfont)
            y += 28
        draw.rounded_rectangle([30, 180, SCREEN_W - 30, 220], radius=8, fill=teal)
        draw.text((50, 192), "✓ Instant loans up to ₹20 Lakhs", fill=(255, 255, 255), font=load_font(12))
        draw.rounded_rectangle([30, 230, SCREEN_W - 30, 270], radius=8, fill="#E0F2FE")
        draw.text((50, 242), "✓ 50+ partner lenders compared", fill=navy, font=load_font(12))
        draw.rounded_rectangle([30, 280, SCREEN_W - 30, 320], radius=8, fill="#E0F2FE")
        draw.text((50, 292), "✓ 100% digital, zero branch visits", fill=navy, font=load_font(12))
        draw_phone_btn(draw, 30, 400, SCREEN_W - 60, "Check Loan Eligibility →")
        # Partner logos row
        for i, name in enumerate(["HDFC", "ICICI", "Bajaj", "Tata"]):
            bx = 30 + i * 78
            draw.rounded_rectangle([bx, 480, bx + 70, 520], radius=6, fill="#fff", outline="#ddd")
            draw.text((bx + 8, 492), name, fill=slate, font=load_font(11, bold=True))

    elif screen_id == "mobile":
        fill_screen_gradient(img, (0, 0, SCREEN_W, SCREEN_H))
        draw = ImageDraw.Draw(img)
        draw.text((30, 60), "Mobile number", fill=navy, font=load_font(22, bold=True))
        draw.text((30, 95), "We'll send OTP to verify you", fill=slate, font=load_font(13))
        draw.rounded_rectangle([30, 140, SCREEN_W - 30, 190], radius=10, fill="#fff", outline=teal, width=2)
        draw.text((50, 158), "+91 98765 43210", fill=navy, font=load_font(18))
        draw.rounded_rectangle([30, 210, 50, 230], radius=4, fill=teal)
        draw.text((58, 212), "✓ DPDP SMS consent", fill=slate, font=load_font(11))
        draw_phone_btn(draw, 30, 280, SCREEN_W - 60, "Continue →")
        # OTP preview below
        draw.text((30, 360), "Enter OTP", fill=navy, font=load_font(18, bold=True))
        draw.text((30, 388), "Sent to +91 98765 43210", fill=slate, font=load_font(12))
        for i in range(6):
            bx = 30 + i * 50
            draw.rounded_rectangle([bx, 420, bx + 40, 460], radius=8, fill="#fff", outline=teal, width=2)
            draw.text((bx + 14, 432), str(i + 1) if i < 4 else "•", fill=navy, font=load_font(18, bold=True))

    elif screen_id == "profile":
        fill_screen_gradient(img, (0, 0, SCREEN_W, SCREEN_H))
        draw = ImageDraw.Draw(img)
        draw.text((30, 40), "Profile 3 of 12", fill=slate, font=load_font(11))
        draw.text((30, 65), "PAN number", fill=navy, font=load_font(20, bold=True))
        draw.rounded_rectangle([30, 110, SCREEN_W - 30, 155], radius=10, fill="#fff", outline=teal, width=2)
        draw.text((50, 125), "ABCDE1234F", fill=navy, font=load_font(16))
        draw.text((50, 165), "✓ PAN verified — details auto-filled", fill=teal, font=load_font(11))
        fields = [("Full name", "Rahul Sharma"), ("Monthly income", "₹75,000"), ("Employment", "Salaried"), ("Loan purpose", "Wedding")]
        y = 200
        for label, val in fields:
            draw.text((30, y), label, fill=slate, font=load_font(11))
            draw.rounded_rectangle([30, y + 18, SCREEN_W - 30, y + 52], radius=8, fill="#fff", outline="#ddd")
            draw.text((45, y + 30), val, fill=navy, font=load_font(14))
            y += 68

    elif screen_id == "consent":
        fill_screen_gradient(img, (0, 0, SCREEN_W, SCREEN_H))
        draw = ImageDraw.Draw(img)
        draw.text((30, 50), "Terms & consent", fill=navy, font=load_font(20, bold=True))
        consents = [
            ("✓", "Privacy Policy accepted", True),
            ("✓", "Terms of Service accepted", True),
            ("✓", "DPDP Act 2023 consent", True),
            ("✓", "Credit bureau check", False),
            ("○", "Product updates via SMS", False),
        ]
        y = 110
        for icon, text, checked in consents:
            color = teal if checked else slate
            draw.rounded_rectangle([30, y, SCREEN_W - 30, y + 44], radius=8, fill="#fff" if checked else "#f8fafc", outline=color if checked else "#ddd")
            draw.text((45, y + 12), f"{icon}  {text}", fill=navy if checked else slate, font=load_font(13))
            y += 54
        draw_phone_btn(draw, 30, 420, SCREEN_W - 60, "See my offers →")

    elif screen_id == "eligibility":
        fill_screen_gradient(img, (0, 0, SCREEN_W, SCREEN_H))
        draw = ImageDraw.Draw(img)
        draw.rounded_rectangle([30, 50, SCREEN_W - 30, 180], radius=16, fill=teal)
        draw.text((50, 70), "You're eligible! 🎉", fill=(255, 255, 255), font=load_font(22, bold=True))
        draw.text((50, 110), "Up to ₹8,50,000", fill=gold, font=load_font(32, bold=True))
        draw.text((50, 150), "Score: 82/100 · Strong match", fill=(255, 255, 255), font=load_font(13))
        metrics = [("Max Amount", "₹8.5L"), ("Best Rate", "10.99%"), ("Approval", "5 min")]
        y = 210
        for label, val in metrics:
            draw.rounded_rectangle([30, y, SCREEN_W - 30, y + 55], radius=10, fill="#fff", outline="#e2e8f0")
            draw.text((50, y + 10), label, fill=slate, font=load_font(11))
            draw.text((50, y + 28), val, fill=navy, font=load_font(18, bold=True))
            y += 65

    elif screen_id == "offers":
        fill_screen_gradient(img, (0, 0, SCREEN_W, SCREEN_H))
        draw = ImageDraw.Draw(img)
        draw.text((30, 30), "Your offers (4)", fill=navy, font=load_font(18, bold=True))
        draw.text((30, 55), "Sort: lowest rate ▾", fill=slate, font=load_font(11))
        offers = [
            ("HDFC Bank", "10.99%", "₹12,450/mo", True),
            ("ICICI Bank", "11.49%", "₹12,680/mo", False),
            ("Bajaj Finserv", "11.99%", "₹12,890/mo", False),
        ]
        y = 85
        for name, rate, emi, rec in offers:
            outline = gold if rec else "#e2e8f0"
            draw.rounded_rectangle([20, y, SCREEN_W - 20, y + 95], radius=12, fill="#fff", outline=outline, width=2 if rec else 1)
            if rec:
                draw.rounded_rectangle([30, y + 8, 160, y + 26], radius=6, fill=gold)
                draw.text((40, y + 10), "★ Recommended", fill=(255, 255, 255), font=load_font(9, bold=True))
            draw.text((30, y + 32), name, fill=navy, font=load_font(15, bold=True))
            draw.text((30, y + 55), f"{rate} p.a.", fill=teal, font=load_font(14, bold=True))
            draw.text((180, y + 55), f"EMI {emi}", fill=slate, font=load_font(12))
            y += 105

    elif screen_id == "select":
        fill_screen_gradient(img, (0, 0, SCREEN_W, SCREEN_H))
        draw = ImageDraw.Draw(img)
        draw.rounded_rectangle([20, 40, SCREEN_W - 20, 280], radius=16, fill="#fff", outline=gold, width=3)
        draw.text((40, 55), "HDFC Bank", fill=navy, font=load_font(22, bold=True))
        draw.text((40, 90), "10.99% interest p.a.", fill=teal, font=load_font(18, bold=True))
        draw.text((40, 125), "Amount: ₹3,00,000", fill=navy, font=load_font(14))
        draw.text((40, 150), "EMI: ₹12,450 × 36 months", fill=slate, font=load_font(13))
        draw.text((40, 180), "Processing fee: ₹999", fill=slate, font=load_font(12))
        draw.rounded_rectangle([40, 210, 200, 235], radius=6, fill="#ecfdf5")
        draw.text((50, 215), "✓ Strong match for you", fill=teal, font=load_font(11))
        draw_phone_btn(draw, 30, 320, SCREEN_W - 60, "Select this offer →")
        draw.text((cx - 80, 390), "KYC starts next →", fill=slate, font=load_font(12))

    elif screen_id == "kyc":
        for y in range(SCREEN_H):
            t = y / SCREEN_H
            c = tuple(int(hex_rgb("#0B1220")[i] * (1 - t * 0.2)) for i in range(3))
            draw.line([(0, y), (SCREEN_W, y)], fill=c)
        draw = ImageDraw.Draw(img)
        draw.text((30, 50), "Phase 3 — KYC", fill=mint, font=load_font(11, bold=True))
        draw.text((30, 75), "Aadhaar eKYC", fill=(255, 255, 255), font=load_font(22, bold=True))
        draw.text((30, 110), "OTP on Aadhaar-linked mobile", fill=(180, 180, 200), font=load_font(12))
        draw.rounded_rectangle([30, 150, SCREEN_W - 30, 195], radius=10, fill="#1a2332", outline=mint, width=2)
        draw.text((50, 168), "XXXX XXXX 4521", fill=(255, 255, 255), font=load_font(16))
        draw_phone_btn(draw, 30, 230, SCREEN_W - 60, "Send Aadhaar OTP →")
        # Progress steps
        steps = ["Aadhaar", "Bank", "eSign", "Submit"]
        for i, s in enumerate(steps):
            bx = 30 + i * 78
            color = mint if i == 0 else (100, 100, 120)
            draw.ellipse([bx + 20, 350, bx + 44, 374], fill=color)
            draw.text((bx + 10, 380), s, fill=(200, 200, 220) if i == 0 else (120, 120, 140), font=load_font(10))

    elif screen_id == "bank":
        for y in range(SCREEN_H):
            draw.line([(0, y), (SCREEN_W, y)], fill=hex_rgb("#0B1220") if y < SCREEN_H // 2 else hex_rgb("#0f1a2e"))
        draw = ImageDraw.Draw(img)
        draw.text((30, 50), "Bank Verification", fill=(255, 255, 255), font=load_font(22, bold=True))
        draw.text((30, 85), "Penny drop — ₹1 credit & reverse", fill=(180, 180, 200), font=load_font(12))
        draw.rounded_rectangle([30, 130, SCREEN_W - 30, 175], radius=10, fill="#1a2332", outline=mint, width=1)
        draw.text((45, 140), "Account number", fill=(150, 150, 170), font=load_font(10))
        draw.text((45, 155), "12345678901234", fill=(255, 255, 255), font=load_font(15))
        draw.rounded_rectangle([30, 190, SCREEN_W - 30, 235], radius=10, fill="#1a2332", outline=mint, width=1)
        draw.text((45, 200), "IFSC Code", fill=(150, 150, 170), font=load_font(10))
        draw.text((45, 215), "HDFC0001234", fill=(255, 255, 255), font=load_font(15))
        draw_phone_btn(draw, 30, 280, SCREEN_W - 60, "Verify Bank Account →")
        draw.text((50, 360), "✓ Account verified successfully", fill=mint, font=load_font(13))

    elif screen_id == "esign":
        for y in range(SCREEN_H):
            draw.line([(0, y), (SCREEN_W, y)], fill=hex_rgb("#0B1220"))
        draw = ImageDraw.Draw(img)
        draw.text((30, 40), "Digital Loan Agreement", fill=(255, 255, 255), font=load_font(18, bold=True))
        draw.rounded_rectangle([20, 80, SCREEN_W - 20, 340], radius=10, fill="#1a2332", outline="#333")
        agreement = [
            "LOAN AGREEMENT",
            "Borrower: Rahul Sharma",
            "Lender: HDFC Bank Ltd.",
            "Amount: ₹3,00,000",
            "Rate: 10.99% p.a.",
            "Tenure: 36 months",
            "EMI: ₹12,450/month",
            "",
            "RBI & DPDP compliant",
        ]
        y = 95
        for line in agreement:
            draw.text((35, y), line, fill=(200, 200, 220) if y > 95 else mint, font=load_font(11 if y > 95 else 12, bold=y == 95))
            y += 22
        draw.rounded_rectangle([30, 370, 50, 390], radius=4, fill=teal)
        draw.text((58, 372), "I agree to terms", fill=(200, 200, 220), font=load_font(12))
        draw_phone_btn(draw, 30, 420, SCREEN_W - 60, "Sign Digitally →")

    elif screen_id == "submit":
        fill_screen_gradient(img, (0, 0, SCREEN_W, SCREEN_H))
        draw = ImageDraw.Draw(img)
        draw.ellipse([cx - 60, 80, cx + 60, 200], fill="#ecfdf5", outline=teal, width=3)
        draw.text((cx - 25, 120), "🎉", fill=navy, font=load_font(40))
        draw.text((30, 230), "Application Submitted!", fill=navy, font=load_font(22, bold=True))
        draw.text((30, 265), "Ref: NLR202608081234", fill=slate, font=load_font(13))
        draw.text((30, 295), "Partner lender will review your", fill=slate, font=load_font(13))
        draw.text((30, 315), "application. Disbursal in 24-48 hrs.", fill=slate, font=load_font(13))
        draw_phone_btn(draw, 30, 380, SCREEN_W - 60, "Go to Dashboard →")

    elif screen_id == "dashboard":
        for y in range(SCREEN_H):
            t = y / SCREEN_H
            c = tuple(int(hex_rgb("#0B1220")[i] * (1 - t * 0.15) + hex_rgb("#0F766E")[i] * t * 0.2) for i in range(3))
            draw.line([(0, y), (SCREEN_W, y)], fill=c)
        draw = ImageDraw.Draw(img)
        draw.text((30, 50), "Welcome back, Rahul", fill=(255, 255, 255), font=load_font(18, bold=True))
        stats = [("Active", "1"), ("Offers", "3"), ("Approved", "0")]
        for i, (label, val) in enumerate(stats):
            bx = 20 + i * 108
            draw.rounded_rectangle([bx, 90, bx + 98, 140], radius=10, fill=(255, 255, 255, 20))
            draw.text((bx + 10, 98), label, fill=(180, 180, 200), font=load_font(10))
            draw.text((bx + 10, 115), val, fill=gold, font=load_font(20, bold=True))
        draw.rounded_rectangle([20, 170, SCREEN_W - 20, 280], radius=12, fill="#fff")
        draw.text((35, 185), "HDFC Bank — ₹3,00,000", fill=navy, font=load_font(14, bold=True))
        draw.rounded_rectangle([35, 215, 130, 240], radius=6, fill="#fef3c7")
        draw.text((45, 220), "Under Review", fill="#b45309", font=load_font(11, bold=True))
        draw.text((35, 255), "Applied: Today · Track status →", fill=slate, font=load_font(11))

    elif screen_id == "close":
        for y in range(SCREEN_H):
            t = y / SCREEN_H
            c = tuple(int(hex_rgb("#DBEAFE")[i] + (hex_rgb("#F0F9FF")[i] - hex_rgb("#DBEAFE")[i]) * t) for i in range(3))
            draw.line([(0, y), (SCREEN_W, y)], fill=c)
        draw = ImageDraw.Draw(img)
        draw_mini_logo(draw, cx, 120)
        draw.text((cx - draw.textlength("dev.neercred.com", font=load_font(20, bold=True)) // 2, 200),
                  "dev.neercred.com", fill=teal, font=load_font(20, bold=True))
        draw_phone_btn(draw, 40, 300, SCREEN_W - 80, "Apply Now →")
        draw.text((cx - 100, 400), "Rates from 10.99% p.a.", fill=slate, font=load_font(12))
        draw.text((cx - 110, 425), "RBI LSP Registered Platform", fill=slate, font=load_font(11))

    return img


# ─── Split-screen scene renderer ──────────────────────────────────────────

LEFT_W = 960


def render_split_scene(scene: dict, logo_path: Path | None) -> Image.Image:
    """KreditBee style: text left, phone right."""
    img = Image.new("RGB", (W, H), BRAND["light"])
    draw = ImageDraw.Draw(img)

    # Left panel gradient
    for y in range(H):
        t = y / H
        c = tuple(int(hex_rgb("#F0F9FF")[i] + (hex_rgb("#FFFFFF")[i] - hex_rgb("#F0F9FF")[i]) * (t * 0.5)) for i in range(3))
        draw.line([(0, y), (LEFT_W, y)], fill=c)

    # Right panel subtle gradient
    for y in range(H):
        t = y / H
        c = tuple(int(hex_rgb("#E0F2FE")[i] + (hex_rgb("#F8FAFC")[i] - hex_rgb("#E0F2FE")[i]) * t) for i in range(3))
        draw.line([(LEFT_W, y), (W, y)], fill=c)

    # Divider line
    draw.line([(LEFT_W, 60), (LEFT_W, H - 60)], fill=hex_rgb(BRAND["mint"]), width=2)

    navy, teal, slate, gold = hex_rgb(BRAND["navy"]), hex_rgb(BRAND["teal"]), hex_rgb(BRAND["slate"]), hex_rgb(BRAND["gold"])

    # Logo top-left
    if logo_path and logo_path.exists():
        logo = Image.open(logo_path).convert("RGBA")
        bbox = logo.getbbox()
        if bbox:
            logo = logo.crop(bbox)
        scale = 200 / logo.width
        logo = logo.resize((int(logo.width * scale), int(logo.height * scale)), Image.Resampling.LANCZOS)
        img_rgba = img.convert("RGBA")
        img_rgba.paste(logo, (50, 40), logo)
        img = img_rgba.convert("RGB")
        draw = ImageDraw.Draw(img)

    # Step badge
    if scene.get("step"):
        badge_font = load_font(14, bold=True)
        label = f"STEP {scene['step']}"
        draw.rounded_rectangle([50, 110, 50 + draw.textlength(label, font=badge_font) + 30, 145], radius=20, fill=teal)
        draw.text((65, 118), label, fill=(255, 255, 255), font=badge_font)
    elif scene.get("badge"):
        badge_font = load_font(13, bold=True)
        bw = draw.textlength(scene["badge"], font=badge_font)
        draw.rounded_rectangle([50, 110, 50 + bw + 30, 145], radius=20, fill=gold if scene["id"] == "close" else teal)
        draw.text((65, 118), scene["badge"], fill=(255, 255, 255), font=badge_font)

    # Headline
    headline_font = load_font(52, bold=True)
    lines = scene["headline"].split("\n")
    y = 170
    for line in lines:
        draw.text((50, y), line, fill=navy, font=headline_font)
        y += 62

    # Subtitle
    sub_font = load_font(22)
    draw.text((50, y + 10), scene["sub"], fill=teal, font=sub_font)

    # Bullets
    bullet_font = load_font(18)
    y = y + 60
    for bullet in scene.get("bullets", []):
        draw.ellipse([50, y + 6, 62, y + 18], fill=teal)
        draw.text((75, y), bullet, fill=slate, font=bullet_font)
        y += 38

    # Decorative accent bar
    draw.rounded_rectangle([50, H - 80, 200, H - 74], radius=3, fill=gold)

    # Phone on right
    phone_screen = render_phone_screen(scene["screen"])
    phone_x = LEFT_W + (W - LEFT_W - PHONE_W) // 2
    phone_y = (H - PHONE_H) // 2
    screen_rect = draw_phone_frame(img, phone_x, phone_y)

    # Paste screen content
    img.paste(phone_screen, (screen_rect[0], screen_rect[1]))

    # Glow behind phone
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    cx, cy = phone_x + PHONE_W // 2, phone_y + PHONE_H // 2
    for r in range(300, 0, -8):
        a = int(12 * (1 - r / 300))
        gdraw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(*teal, a))
    img = Image.alpha_composite(img.convert("RGBA"), glow).convert("RGB")

    return img


# ─── Audio ───────────────────────────────────────────────────────────────

async def synth_vo(scene: dict, out_path: Path) -> float:
    await edge_tts.Communicate(scene["vo"], VOICE, rate=RATE, pitch=PITCH).save(str(out_path))
    polished = out_path.with_suffix(".polished.mp3")
    run([
        "ffmpeg", "-y", "-i", str(out_path),
        "-af", "highpass=f=80,equalizer=f=2500:width_type=h:width=1500:g=1.5,compand=0.3|0.7:6:-70/-60/-20/-8/-3/0:2:0:0,volume=1.1",
        str(polished),
    ])
    polished.replace(out_path)
    probe = run(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(out_path)],
                capture_output=True, text=True)
    return float(json.loads(probe.stdout)["format"]["duration"])


def generate_piano_bgm(out_path: Path, duration: float = 90.0) -> None:
    """Generate gentle piano + flute ambient BGM with ffmpeg."""
    # C major pentatonic melody notes (Hz)
    notes = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25]
    segments = []
    t = 0.0
    note_dur = 2.5
    i = 0
    while t < duration:
        freq = notes[i % len(notes)]
        seg = AUDIO_DIR / f"note_{i:03d}.wav"
        run([
            "ffmpeg", "-y", "-f", "lavfi",
            "-i", f"sine=frequency={freq}:duration={note_dur}",
            "-af", f"volume=0.08,afade=t=in:st=0:d=0.3,afade=t=out:st={note_dur - 0.5}:d=0.5",
            str(seg),
        ])
        segments.append(seg)
        t += note_dur * 0.85
        i += 1

    # Flute layer (higher octave, softer)
    flute_segments = []
    t = 1.0
    j = 0
    while t < duration:
        freq = notes[(j + 3) % len(notes)] * 2
        seg = AUDIO_DIR / f"flute_{j:03d}.wav"
        run([
            "ffmpeg", "-y", "-f", "lavfi",
            "-i", f"sine=frequency={freq}:duration={note_dur * 1.5}",
            "-af", f"volume=0.04,lowpass=f=2000,afade=t=in:st=0:d=0.5,afade=t=out:st={note_dur}:d=0.8",
            str(seg),
        ])
        flute_segments.append(seg)
        t += note_dur * 1.2
        j += 1

    # Mix all segments
    all_segs = segments + flute_segments
    inputs = []
    for s in all_segs:
        inputs += ["-i", str(s)]
    n = len(all_segs)
    filter_str = "".join(f"[{i}:a]" for i in range(n)) + f"amix=inputs={n}:duration=longest:dropout_transition=0[aout]"
    mixed = AUDIO_DIR / "bgm_mixed.wav"
    run(["ffmpeg", "-y", *inputs, "-filter_complex", filter_str, "-map", "[aout]", str(mixed)])

    run([
        "ffmpeg", "-y", "-i", str(mixed),
        "-af", f"apad=pad_dur={duration},afade=t=in:st=0:d=3,afade=t=out:st={duration - 3}:d=3,volume=0.7",
        "-t", str(duration), str(out_path),
    ])

    for s in all_segs:
        s.unlink(missing_ok=True)
    mixed.unlink(missing_ok=True)


def build_clip(frame: Path, vo: Path, vo_dur: float, idx: int) -> Path:
    clip = OUT / f"clip_{idx:02d}.mp4"
    dur = vo_dur + 0.3
    run([
        "ffmpeg", "-y", "-loop", "1", "-i", str(frame), "-i", str(vo),
        "-filter_complex", f"[0:v]scale={W}:{H},setsar=1,fps={FPS}[v]",
        "-map", "[v]", "-map", "1:a",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "17",
        "-c:a", "aac", "-b:a", "192k", "-t", f"{dur:.3f}", str(clip),
    ])
    return clip


def assemble(clips: list[Path], bgm: Path, output: Path) -> None:
    lst = OUT / "clips.txt"
    lst.write_text("\n".join(f"file '{c}'" for c in clips))
    merged = OUT / "merged.mp4"
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-c", "copy", str(merged)])

    probe = run(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(merged)],
                capture_output=True, text=True)
    dur = float(json.loads(probe.stdout)["format"]["duration"])
    print(f"Total narration: {dur:.1f}s")

    fade_out = max(dur - 3, 0)
    run([
        "ffmpeg", "-y", "-i", str(merged), "-stream_loop", "-1", "-i", str(bgm),
        "-filter_complex",
        f"[1:a]volume=0.18,afade=t=in:st=0:d=3,afade=t=out:st={fade_out:.1f}:d=3[bg];"
        "[0:a][bg]amix=inputs=2:duration=first:dropout_transition=2[aout]",
        "-map", "0:v", "-map", "[aout]",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "17",
        "-c:a", "aac", "-b:a", "192k", str(output),
    ])


def rasterize_logo() -> Path:
    logo_path = SCENES_DIR / "logo.png"
    if logo_path.exists():
        return logo_path
    svg_path = ROOT / "frontend" / "public" / "neercred-logo-header.svg"
    if svg_path.exists():
        # Use cairosvg or playwright — fallback: copy icon
        icon = ROOT / "frontend" / "public" / "neercred-icon.svg"
        if icon.exists():
            html = OUT / "logo.html"
            html.write_text(f"""<!DOCTYPE html><html><head><style>
            body{{margin:0;background:#fff;display:flex;align-items:center;justify-content:center;width:500px;height:120px}}
            </style></head><body>{svg_path.read_text()}</body></html>""")
            try:
                run(["npx", "playwright", "screenshot", "--browser", "chromium",
                     f"file://{html.resolve()}", str(logo_path), "--viewport-size=500,120"],
                    cwd=ROOT / "frontend")
                return logo_path
            except Exception:
                pass
    # Fallback: text-only logo
    img = Image.new("RGBA", (300, 60), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    font = load_font(36, bold=True)
    draw.text((0, 10), "NeerCred", fill=hex_rgb(BRAND["navy"]), font=font)
    img.save(logo_path)
    return logo_path


def make_vertical_version(horizontal: Path, output: Path) -> None:
    """Create 9:16 version from 16:9 for mobile/social."""
    run([
        "ffmpeg", "-y", "-i", str(horizontal),
        "-vf", "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=0xF0F9FF",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "17",
        "-c:a", "copy", str(output),
    ])


async def main() -> None:
    for d in (SCENES_DIR, AUDIO_DIR, FRAMES_DIR, PHONE_DIR):
        d.mkdir(parents=True, exist_ok=True)

    logo = rasterize_logo()
    vo_durations: list[float] = []

    for i, scene in enumerate(SCENES):
        vo_path = AUDIO_DIR / f"vo_{i:02d}.mp3"
        dur = await synth_vo(scene, vo_path)
        vo_durations.append(dur)
        print(f"  VO [{scene['id']}]: {dur:.2f}s — {scene['vo'][:50]}...")

        frame = FRAMES_DIR / f"scene_{i:02d}.png"
        render_split_scene(scene, logo).save(frame, quality=95)

    total_vo = sum(vo_durations) + len(SCENES) * 0.3
    print(f"\nGenerating BGM ({total_vo:.0f}s)...")
    bgm_path = AUDIO_DIR / "piano_bgm.mp3"
    generate_piano_bgm(bgm_path, duration=total_vo + 5)

    clips = []
    for i, scene in enumerate(SCENES):
        clips.append(build_clip(FRAMES_DIR / f"scene_{i:02d}.png", AUDIO_DIR / f"vo_{i:02d}.mp3", vo_durations[i], i))

    h_output = OUT / "neercred-promo-kreditbee-16x9.mp4"
    assemble(clips, bgm_path, h_output)

    v_output = OUT / "neercred-promo-30s.mp4"
    make_vertical_version(h_output, v_output)

    # Also create process journey version (same content, vertical optimized)
    journey = OUT / "neercred-process-journey.mp4"
    journey.write_bytes(v_output.read_bytes())

    # Deploy to workspace
    for name in ["neercred-promo-30s.mp4", "neercred-process-journey.mp4", "neercred-promo-kreditbee-16x9.mp4"]:
        src = OUT / name
        if src.exists():
            (Path("/workspace/artifacts") / name).write_bytes(src.read_bytes())
            pub = ROOT / "frontend" / "public" / "videos" / name
            pub.parent.mkdir(parents=True, exist_ok=True)
            pub.write_bytes(src.read_bytes())

    print(f"\n✅ Videos ready:")
    print(f"   16:9 (website): {h_output}")
    print(f"   9:16 (mobile):  {v_output}")
    print(f"   Duration: ~{total_vo:.0f}s | {len(SCENES)} scenes | Female Hindi VO | Piano+Flute BGM")


if __name__ == "__main__":
    asyncio.run(main())
