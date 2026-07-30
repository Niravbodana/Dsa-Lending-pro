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
RATE = "+6%"
PITCH = "+0Hz"

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
        "vo": "Neer Cred par apna mobile number daalo, OTP se verify karo.",
        "accent": "teal",
        "photo": "scene-mobile.png",
    },
    {
        "id": "profile",
        "step": "2",
        "headline": "Profile Complete",
        "sub": "Safe · Secure · Digital",
        "vo": "Profile complete karo, safe aur digital.",
        "accent": "mint",
        "photo": "scene-profile.png",
    },
    {
        "id": "offers",
        "step": "3",
        "headline": "15+ Lenders",
        "sub": "Best rate · Best EMI",
        "vo": "15+ lenders ke offers compare karo, best EMI yahin.",
        "accent": "gold",
        "photo": "scene-offers.png",
    },
    {
        "id": "kyc",
        "step": "4",
        "headline": "KYC → Bank → eSign",
        "sub": "Sab phone se, ghar baithe",
        "vo": "KYC, bank aur eSign, sab phone se.",
        "accent": "teal",
        "photo": "scene-kyc.png",
    },
    {
        "id": "disbursal",
        "step": "5",
        "headline": "Turant Disbursal",
        "sub": "Jaldi · Transparent · Zero jhanjhat",
        "vo": "Approval ke baad turant disbursal, zero jhanjhat.",
        "accent": "mint",
        "photo": "scene-disbursal.png",
    },
    {
        "id": "close",
        "step": None,
        "headline": "",
        "sub": "neerloansolutions.com",
        "vo": "Neer Cred. Dream Big, Borrow Smart.",
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


def paste_photo_card(
    base: Image.Image,
    photo_path: Path,
    accent: str,
    card_box: tuple[int, int, int, int],
) -> None:
    x1, y1, x2, y2 = card_box
    cw, ch = x2 - x1, y2 - y1
    accent_rgb = hex_to_rgb(BRAND[accent])

    # Outer glow
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    for pad, alpha in [(28, 18), (16, 28), (8, 42)]:
        gdraw.rounded_rectangle(
            [x1 - pad, y1 - pad, x2 + pad, y2 + pad],
            radius=52 + pad,
            fill=(*accent_rgb, alpha),
        )
    base.paste(Image.alpha_composite(base.convert("RGBA"), glow).convert("RGB"))

    photo = cover_crop(Image.open(photo_path), cw, ch)
    # Bottom vignette on photo
    vignette = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    vdraw = ImageDraw.Draw(vignette)
    for i in range(220):
        a = int(180 * (i / 220) ** 1.6)
        vdraw.rectangle([0, ch - 220 + i, cw, ch - 220 + i + 1], fill=(0, 0, 0, a))
    photo = Image.alpha_composite(photo.convert("RGBA"), vignette).convert("RGB")

    mask = Image.new("L", (cw, ch), 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, cw, ch], radius=44, fill=255)
    rounded = Image.new("RGBA", (cw, ch), (0, 0, 0, 0))
    rounded.paste(photo, (0, 0))
    rounded.putalpha(mask)

    base_rgba = base.convert("RGBA")
    base_rgba.paste(rounded, (x1, y1), rounded)
    base.paste(base_rgba.convert("RGB"))

    draw = ImageDraw.Draw(base)
    draw.rounded_rectangle([x1, y1, x2, y2], radius=44, outline=accent_rgb, width=3)
    draw.rounded_rectangle([x1 + 6, y1 + 6, x2 - 6, y2 - 6], radius=40, outline=(*hex_to_rgb(BRAND["gold"]), 80), width=1)


def render_scene(scene: dict, logo_path: Path | None, photo_path: Path | None) -> Image.Image:
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

    card = (90, 360, 990, 1380)

    if scene.get("brand_close") and logo_path and logo_path.exists():
        # Close: original horizontal logo on white card — no duplicate brand text
        logo = Image.open(logo_path).convert("RGBA")
        bbox = logo.getbbox()
        if bbox:
            logo = logo.crop(bbox)

        card_w, card_h = 920, 340
        card_x = (W - card_w) // 2
        card_y = 620
        card = Image.new("RGBA", (card_w, card_h), (0, 0, 0, 0))
        cdraw = ImageDraw.Draw(card)
        cdraw.rounded_rectangle([0, 0, card_w - 1, card_h - 1], radius=32, fill=(255, 255, 255, 255))
        # soft shadow
        shadow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
        sdraw = ImageDraw.Draw(shadow)
        for i in range(18, 0, -1):
            sdraw.rounded_rectangle(
                [card_x - i, card_y + i, card_x + card_w + i, card_y + card_h + i],
                radius=32 + i, fill=(0, 0, 0, 12),
            )
        img = Image.alpha_composite(img.convert("RGBA"), shadow).convert("RGB")

        target_w = card_w - 120
        scale = target_w / logo.width
        nw, nh = int(logo.width * scale), int(logo.height * scale)
        logo = logo.resize((nw, nh), Image.Resampling.LANCZOS)
        lx = card_x + (card_w - nw) // 2
        ly = card_y + (card_h - nh) // 2

        img_rgba = img.convert("RGBA")
        img_rgba.paste(card, (card_x, card_y), card)
        img_rgba.paste(logo, (lx, ly), logo)
        img = img_rgba.convert("RGB")
        draw = ImageDraw.Draw(img)

        sub_font = load_font(36)
        sub = scene["sub"]
        sw = draw.textlength(sub, font=sub_font)
        draw.text(((W - sw) / 2, 1040), sub, fill=hex_to_rgb(BRAND["slate"]), font=sub_font)

        rbi_font = load_font(30)
        rbi = "RBI LSP Registered Platform"
        rw = draw.textlength(rbi, font=rbi_font)
        draw.text(((W - rw) / 2, 1110), rbi, fill=hex_to_rgb(BRAND["gold"]), font=rbi_font)
    elif photo_path and photo_path.exists():
        paste_photo_card(img, photo_path, accent, card)
        draw = ImageDraw.Draw(img)

        title_font = load_font(68, bold=True)
        sub_font = load_font(38)
        headline = scene["headline"]
        tw = draw.textlength(headline, font=title_font)
        draw.text(((W - tw) / 2, 1440), headline, fill=hex_to_rgb(BRAND["white"]), font=title_font)

        sub = scene["sub"]
        sw = draw.textlength(sub, font=sub_font)
        draw.text(((W - sw) / 2, 1530), sub, fill=hex_to_rgb(BRAND[accent]), font=sub_font)

    # Premium footer bar
    draw.rounded_rectangle([70, 1760, W - 70, 1850], radius=28, fill="#0F766E33", outline=hex_to_rgb(BRAND["teal"]), width=1)
    bar_font = load_font(28, bold=True)
    bar = "Rates from 10.99%   ·   100% Digital   ·   Compare 15+ Lenders"
    bw = draw.textlength(bar, font=bar_font)
    draw.text(((W - bw) / 2, 1788), bar, fill=hex_to_rgb(BRAND["white"]), font=bar_font)

    return img


async def synth_vo(scene: dict, out_path: Path) -> float:
    communicate = edge_tts.Communicate(scene["vo"], VOICE, rate=RATE, pitch=PITCH)
    await communicate.save(str(out_path))

    # Polish voice: clearer diction, brighter presence
    polished = out_path.with_suffix(".polished.mp3")
    run([
        "ffmpeg", "-y", "-i", str(out_path),
        "-af",
        "highpass=f=110,"
        "equalizer=f=1800:width_type=h:width=1200:g=2.5,"
        "equalizer=f=3200:width_type=h:width=1800:g=3.5,"
        "compand=0.2|0.9:6:-70/-55/-20/-10/-3/0:2:0:0,"
        "volume=1.18",
        str(polished),
    ])
    polished.replace(out_path)

    probe = run(
        ["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(out_path)],
        capture_output=True,
        text=True,
    )
    return float(json.loads(probe.stdout)["format"]["duration"])


def ensure_logo() -> Path:
    logo = SCENES_DIR / "neercred-logo-original.png"
    svg_path = ROOT / "frontend/public/neercred-logo-header.svg"
    svg_content = svg_path.read_text(encoding="utf-8", errors="replace")
    html = OUT / "render-logo.html"
    html.write_text(
        f"""<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
*{{margin:0;padding:0}}body{{
  width:1400px;height:500px;background:#FFFFFF;
  display:flex;align-items:center;justify-content:center;padding:40px}}
svg{{width:1100px;height:auto}}
</style></head><body>{svg_content}</body></html>"""
    )
    run([
        "npx", "playwright", "screenshot", "--browser", "chromium",
        f"file://{html}", str(logo), "--viewport-size=1400,500",
    ], cwd=ROOT / "frontend")
    return logo


def build_scene_clip(scene_img: Path, vo_path: Path, vo_duration: float, idx: int) -> Path:
    clip = OUT / f"clip_{idx:02d}.mp4"
    dur = vo_duration + 0.2
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

    logo = ensure_logo()

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

        frame_path = FRAMES_DIR / f"scene_{i:02d}.png"
        render_scene(scene, logo, photo).save(frame_path, quality=96)

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
