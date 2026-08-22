#!/usr/bin/env python3
"""NeerCred Cinematic Story — full-process narrative promo (9:16 4K)."""

from __future__ import annotations

import asyncio
import json
import math
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

import generate_premium_final as gpf  # noqa: E402
from PIL import Image, ImageDraw, ImageFilter, ImageFont  # noqa: E402

OUT = gpf.OUT
DOWNLOAD = gpf.DOWNLOAD
AUDIO = gpf.AUDIO
FRAMES = gpf.FRAMES
CLIPS = gpf.CLIPS
SCREENS = gpf.SCREENS
W_V, H_V = gpf.W_V, gpf.H_V
FPS = gpf.FPS
C = gpf.C
vsz = gpf.vsz
vfont = gpf.vfont
rgb = gpf.rgb
text_width = gpf.text_width
strip_emoji = gpf.strip_emoji
wrap_lines = gpf.wrap_lines
run = gpf.run

VOICE = "en-IN-NeerjaNeural"
VO_PREFIX = "cine"

CINEMATIC_SCENES: list[dict] = [
    {
        "id": "open",
        "layout": "cinematic_card",
        "chapter": "I",
        "title": "Every Dream\nDeserves Funding",
        "subtitle": "A NeerCred Journey",
        "vo": "Every dream deserves the right funding. This is how Neer Cred brings eligible loan offers to you — fully digital.",
        "vo_hi": "Every dream deserves funding.\nYour NeerCred journey begins.",
        "duration": 5.5,
    },
    {
        "id": "dream",
        "layout": "cinematic_card",
        "chapter": "II",
        "title": "Wedding.\nHome.\nTravel.",
        "subtitle": "Big plans — no time for bank queues.",
        "vo": "A wedding, a home upgrade, or that dream trip. You need funds quickly — without endless paperwork and branch visits.",
        "vo_hi": "Big plans ahead.\nNo bank queues.",
        "duration": 6.0,
    },
    {
        "id": "discover",
        "layout": "cinematic_card",
        "chapter": "III",
        "title": "Meet NeerCred",
        "subtitle": "Dream Big · Borrow Smart",
        "vo": "Meet Neer Cred — your digital lending marketplace. Compare eligible offers from HDFC, ICICI, Bajaj and more — all in one place.",
        "vo_hi": "NeerCred.\nDream Big · Borrow Smart.",
        "duration": 6.5,
    },
    {
        "id": "step_apply",
        "layout": "cinematic_process",
        "screen": "02-apply-email.png",
        "step_num": 1,
        "step_total": 7,
        "step_label": "APPLY",
        "title": "Start Online",
        "subtitle": "Email verification in seconds",
        "vo": "Step one — enter your email. A secure OTP arrives in your inbox. Quick, encrypted, and completely private.",
        "vo_hi": "Step 1: Enter email.\nSecure OTP to inbox.",
    },
    {
        "id": "step_otp",
        "layout": "cinematic_process",
        "screen": "03-otp-email.png",
        "step_num": 2,
        "step_total": 7,
        "step_label": "VERIFY",
        "title": "OTP Confirmed",
        "subtitle": "Instant email verification",
        "vo": "Step two — verify the OTP. Your session is protected, and you are ready to continue in under a minute.",
        "vo_hi": "Step 2: OTP verified.\nLess than a minute.",
    },
    {
        "id": "step_profile",
        "layout": "cinematic_process",
        "screen": "04-profile.png",
        "step_num": 3,
        "step_total": 7,
        "step_label": "PROFILE",
        "title": "PAN & Profile",
        "subtitle": "One guided form",
        "vo": "Step three — enter your PAN and complete your profile. One simple form with guided steps — minimal documentation.",
        "vo_hi": "Step 3: PAN & profile.\nOne simple form.",
    },
    {
        "id": "step_offers",
        "layout": "cinematic_process",
        "screen": "09-offers.png",
        "step_num": 4,
        "step_total": 7,
        "step_label": "COMPARE",
        "title": "Best Offers",
        "subtitle": "Side-by-side comparison",
        "vo": "Step four — compare eligible offers from multiple lenders on one screen. Transparent rates, fees, and indicative EMI.",
        "vo_hi": "Step 4: Compare offers.\nBest rates on one screen.",
    },
    {
        "id": "step_approved",
        "layout": "cinematic_process",
        "screen": "12-approved.png",
        "step_num": 5,
        "step_total": 7,
        "step_label": "APPROVED",
        "title": "You May Qualify",
        "subtitle": "Up to fifteen lakhs · indicative",
        "vo": "Step five — great news! You may qualify for up to fifteen lakhs. Select your loan amount and move closer to disbursal.",
        "vo_hi": "Step 5: You may qualify!\nUp to fifteen lakhs.",
    },
    {
        "id": "step_kyc",
        "layout": "cinematic_celebration",
        "animation": "ekyc",
        "step_num": 6,
        "step_total": 7,
        "step_label": "eKYC",
        "title": "Aadhaar Verified",
        "subtitle": "On lender secure platform",
        "vo": "Step six — your Aadhaar eKYC is completed on your lender's secure platform. Verified and ready to proceed.",
        "vo_hi": "Step 6: Aadhaar eKYC.\nVerified on lender platform.",
    },
    {
        "id": "step_transfer",
        "layout": "cinematic_celebration",
        "animation": "transfer",
        "step_num": 7,
        "step_total": 7,
        "step_label": "DISBURSE",
        "title": "Funds to Your Bank",
        "subtitle": "Quick same-day transfer",
        "vo": "Step seven — funds are transferring straight to your bank account. Quick, secure, and often same-day disbursal.",
        "vo_hi": "Step 7: Funds to your bank.\nQuick and secure.",
    },
    {
        "id": "close",
        "layout": "endcard_full",
        "animation": "endcard",
        "step": "",
        "title": "",
        "subtitle": "",
        "bullets": [],
        "vo": "Your dream is closer than you think. Apply now on Neer Cred dot com.",
        "vo_hi": "Apply now on NeerCred.\nwww.neercred.com",
        "duration": 8.5,
    },
]


def cinematic_bg() -> Image.Image:
    """Deep cinematic gradient with subtle vignette."""
    c = Image.new("RGB", (W_V, H_V), (5, 8, 14))
    d = ImageDraw.Draw(c)
    c0, c1 = (5, 8, 14), (15, 50, 48)
    for y in range(H_V):
        t = y / H_V
        col = tuple(int(c0[i] + (c1[i] - c0[i]) * (t * 0.7)) for i in range(3))
        d.line([(0, y), (W_V, y)], fill=col)
    vig = Image.new("RGBA", (W_V, H_V), (0, 0, 0, 0))
    vd = ImageDraw.Draw(vig)
    vd.ellipse([-W_V * 0.15, -H_V * 0.05, W_V * 1.15, H_V * 1.08], fill=(0, 0, 0, 110))
    c = c.convert("RGBA")
    c.paste(vig, (0, 0), vig)
    return c.convert("RGB")


def draw_letterbox(rgba: Image.Image) -> None:
    """Cinematic black bars."""
    bar = vsz(72)
    d = ImageDraw.Draw(rgba)
    d.rectangle([0, 0, W_V, bar], fill=(0, 0, 0, 235))
    d.rectangle([0, H_V - bar, W_V, H_V], fill=(0, 0, 0, 235))


def paste_logo_corner(rgba: Image.Image, logo: Image.Image, logo_hires: Image.Image | None) -> None:
    src = logo_hires if logo_hires is not None else logo
    lg = src.copy()
    target_w, target_h = vsz(300), vsz(58)
    scale = min(target_w / lg.width, target_h / lg.height)
    nw, nh = int(lg.width * scale), int(lg.height * scale)
    lg = lg.resize((nw, nh), Image.Resampling.LANCZOS)
    rgba.paste(lg, (vsz(44), vsz(44)), lg)


def draw_process_timeline(d: ImageDraw.ImageDraw, step_num: int, step_total: int, y: int) -> None:
    """Gold progress dots across top."""
    label = f"STEP {step_num:02d} / {step_total:02d}"
    lf = vfont(20, bold=True)
    d.text((vsz(44), y), label, fill=rgb(C["gold_light"]), font=lf)
    cx = W_V // 2
    dot_y = y + vsz(38)
    gap = vsz(36)
    start_x = cx - (step_total - 1) * gap // 2
    for i in range(step_total):
        x = start_x + i * gap
        r = vsz(7) if i + 1 == step_num else vsz(5)
        fill = rgb(C["gold"]) if i + 1 <= step_num else (60, 70, 80)
        d.ellipse([x - r, dot_y - r, x + r, dot_y + r], fill=fill)
        if i < step_total - 1:
            d.line([(x + r + 2, dot_y), (x + gap - r - 2, dot_y)], fill=(50, 60, 70), width=vsz(2))


def draw_caption_strip(rgba: Image.Image, lines: list[str]) -> int:
    cap_f = vfont(24, bold=True)
    line_h = vsz(34)
    pad_top, pad_bottom = vsz(16), vsz(22)
    bar_h = pad_top + len(lines) * line_h + pad_bottom
    bar_y = H_V - bar_h - vsz(52)
    bar = Image.new("RGBA", (W_V, bar_h), (4, 8, 16, 235))
    bd = ImageDraw.Draw(bar)
    bd.line([(vsz(48), 0), (W_V - vsz(48), 0)], fill=rgb(C["gold"]) + (180,), width=vsz(2))
    cy = pad_top
    for line in lines:
        tw = text_width(line, cap_f)
        bd.text(((W_V - tw) // 2, cy), line, fill=rgb(C["white"]), font=cap_f)
        cy += line_h
    rgba.paste(bar, (0, bar_y), bar)
    return bar_y


def render_cinematic_card(scene: dict, logo: Image.Image, logo_hires: Image.Image | None) -> Image.Image:
    rgba = cinematic_bg().convert("RGBA")
    draw_letterbox(rgba)
    d = ImageDraw.Draw(rgba)

    chapter = scene.get("chapter", "")
    if chapter:
        cf = vfont(22, bold=True)
        ct = f"CHAPTER {chapter}"
        tw = text_width(ct, cf)
        d.text(((W_V - tw) // 2, vsz(200)), ct, fill=rgb(C["gold"]), font=cf)

    title_f = vfont(62, bold=True)
    y = vsz(320)
    for line in scene.get("title", "").split("\n"):
        if not line.strip():
            continue
        clean = strip_emoji(line)
        tw = text_width(clean, title_f)
        d.text(((W_V - tw) // 2, y), clean, fill=rgb(C["white"]), font=title_f)
        y += vsz(72)

    sub = scene.get("subtitle", "")
    if sub:
        sf = vfont(26)
        tw = text_width(sub, sf)
        d.text(((W_V - tw) // 2, y + vsz(20)), sub, fill=rgb(C["muted"]), font=sf)

    src = logo_hires if logo_hires is not None else logo
    lg = src.copy()
    lg.thumbnail((vsz(400), vsz(80)), Image.Resampling.LANCZOS)
    rgba.paste(lg, ((W_V - lg.width) // 2, H_V - vsz(280)), lg)

    lines = gpf.caption_lines_from_vo(scene.get("vo_hi", ""), vfont(22, bold=True), W_V - vsz(80))
    if lines:
        draw_caption_strip(rgba, lines)
    return rgba.convert("RGB")


def render_cinematic_process(
    scene: dict,
    logo: Image.Image,
    logo_hires: Image.Image | None,
    anim_frames: dict[str, list[Path]] | None = None,
    frame_t: float = 0.0,
) -> Image.Image:
    rgba = cinematic_bg().convert("RGBA")
    d = ImageDraw.Draw(rgba)
    paste_logo_corner(rgba, logo, logo_hires)

    step_num = scene.get("step_num", 1)
    step_total = scene.get("step_total", 7)
    draw_process_timeline(d, step_num, step_total, vsz(120))

    x = vsz(44)
    y = vsz(200)
    label = scene.get("step_label", "")
    if label:
        lf = vfont(20, bold=True)
        d.text((x, y), label, fill=rgb(C["teal"]), font=lf)
        d.line([(x, y + vsz(34)), (x + vsz(80), y + vsz(34))], fill=rgb(C["mint"]), width=vsz(3))
        y += vsz(44)

    tf = vfont(44, bold=True)
    for line in scene.get("title", "").split("\n"):
        if line.strip():
            d.text((x, y), strip_emoji(line), fill=rgb(C["white"]), font=tf)
            y += vsz(50)
    sub = scene.get("subtitle", "")
    if sub:
        d.text((x, y), sub, fill=rgb(C["muted"]), font=vfont(22))
        y += vsz(36)

    lines = gpf.caption_lines_from_vo(scene.get("vo_hi", ""), vfont(22, bold=True), W_V - vsz(80))
    bar_top = draw_caption_strip(rgba, lines) if lines else H_V - vsz(200)

    phone_top = y + vsz(12)
    phone_max_h = bar_top - phone_top - vsz(16)
    phone_max_w = W_V - vsz(16)

    if scene.get("layout") == "cinematic_celebration":
        key = scene.get("animation", "ekyc")
        frames = (anim_frames or {}).get(key, [])
        panel = gpf.celebration_panel_at(frames, frame_t)
        scale = min(phone_max_w / panel.width, phone_max_h / panel.height)
        nw, nh = int(panel.width * scale), int(panel.height * scale)
        panel = panel.resize((nw, nh), Image.Resampling.LANCZOS)
        phone_like = Image.new("RGBA", (nw, nh), (0, 0, 0, 0))
        phone_like.paste(panel, (0, 0), panel)
    else:
        sf = SCREENS / scene["screen"]
        if not sf.exists():
            sf = SCREENS / "01-homepage.png"
        old_w, old_h = gpf.PHONE_W, gpf.PHONE_H
        gpf.PHONE_W, gpf.PHONE_H = gpf.PHONE_W_V, gpf.PHONE_H_V
        phone = gpf.draw_phone(gpf.fit_screen(sf))
        gpf.PHONE_W, gpf.PHONE_H = old_w, old_h
        scale = min(phone_max_w / phone.width, phone_max_h / phone.height)
        nw, nh = int(phone.width * scale), int(phone.height * scale)
        phone_like = phone.resize((nw, nh), Image.Resampling.LANCZOS)

    px = (W_V - nw) // 2
    py = phone_top + max(0, (phone_max_h - nh) // 2)
    sh = Image.new("RGBA", (nw + vsz(50), nh + vsz(50)), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle([vsz(16), vsz(16), nw + vsz(34), nh + vsz(34)], radius=vsz(40), fill=(0, 0, 0, 100))
    sh = sh.filter(ImageFilter.GaussianBlur(vsz(20)))
    rgba.paste(sh, (px - vsz(12), py + vsz(8)), sh)
    rgba.paste(phone_like, (px, py), phone_like)
    return rgba.convert("RGB")


def render_cinematic_frame(
    scene: dict,
    logo: Image.Image,
    logo_hires: Image.Image | None,
    anim_frames: dict[str, list[Path]] | None = None,
    frame_t: float = 0.0,
) -> Image.Image:
    layout = scene.get("layout", "")
    if layout == "cinematic_card":
        return render_cinematic_card(scene, logo, logo_hires)
    if layout in ("cinematic_process", "cinematic_celebration"):
        return render_cinematic_process(scene, logo, logo_hires, anim_frames, frame_t)
    if layout == "endcard_full":
        return gpf.render_endcard_frame_vertical(anim_frames or {}, frame_t)
    return cinematic_bg()


def render_cinematic_clip(
    scene: dict,
    logo: Image.Image,
    logo_hires: Image.Image | None,
    vo: Path,
    dur: float,
    idx: int,
    anim_frames: dict[str, list[Path]],
) -> Path:
    CLIPS.mkdir(parents=True, exist_ok=True)
    out = CLIPS / f"cine_{idx:02d}.mp4"
    total = dur + 0.6
    animated = scene.get("layout") in ("cinematic_celebration", "endcard_full")
    n_frames = max(int(total * FPS), 36)

    if animated:
        seq_dir = CLIPS / f"cine_seq_{idx}"
        seq_dir.mkdir(parents=True, exist_ok=True)
        for f in range(n_frames):
            t = f / n_frames
            img = render_cinematic_frame(scene, logo, logo_hires, anim_frames, t)
            img.save(seq_dir / f"frame_{f:04d}.png", quality=92)
        inp = str(seq_dir / "frame_%04d.png")
        vf = (
            f"fade=t=in:st=0:d=0.45,fade=t=out:st={total - 0.5:.3f}:d=0.5"
        )
        run([
            "ffmpeg", "-y", "-framerate", str(FPS), "-i", inp, "-i", str(vo),
            "-vf", vf, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "11", "-preset", "medium",
            "-c:a", "aac", "-b:a", "256k", "-ar", "44100", "-ac", "2",
            "-shortest", "-t", f"{total:.3f}", str(out),
        ])
        for fp in seq_dir.glob("*.png"):
            fp.unlink(missing_ok=True)
        seq_dir.rmdir()
    else:
        fr = FRAMES / f"cine_{idx:02d}.png"
        render_cinematic_frame(scene, logo, logo_hires, anim_frames).save(fr, quality=95)
        n = max(int(total * FPS), 1)
        vf = (
            f"scale={int(W_V * 1.06)}:{int(H_V * 1.06)},"
            f"zoompan=z='min(1.0+0.00035*on,1.06)':x='(iw-ow)/2':y='(ih-oh)/2':"
            f"d={n}:s={W_V}x{H_V}:fps={FPS},"
            f"fade=t=in:st=0:d=0.45,fade=t=out:st={total - 0.5:.3f}:d=0.5"
        )
        run([
            "ffmpeg", "-y", "-loop", "1", "-i", str(fr), "-i", str(vo),
            "-vf", vf, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "11", "-preset", "medium",
            "-c:a", "aac", "-b:a", "256k", "-ar", "44100", "-ac", "2",
            "-shortest", "-t", f"{total:.3f}", str(out),
        ])
    return out


async def make_cine_vo(text: str, path: Path) -> float:
    import edge_tts

    path.parent.mkdir(parents=True, exist_ok=True)
    comm = edge_tts.Communicate(text, VOICE, rate="-3%", pitch="+1Hz")
    await comm.save(str(path))
    boosted = path.with_suffix(".boost.mp3")
    run([
        "ffmpeg", "-y", "-i", str(path),
        "-af", "highpass=f=90,lowpass=f=12000,volume=2.2,alimiter=limit=0.95",
        str(boosted),
    ])
    boosted.replace(path)
    r = run(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(path)], capture_output=True, text=True)
    return float(json.loads(r.stdout)["format"]["duration"])


async def prepare_vo(scenes: list[dict]) -> list[tuple[dict, float, Path]]:
    rows: list[tuple[dict, float, Path]] = []
    for scene in scenes:
        vo = AUDIO / f"{VO_PREFIX}_vo_{scene['id']}.mp3"
        if scene.get("vo_silent") or not scene.get("vo", "").strip():
            dur = float(scene.get("duration", 8.0))
            gpf.make_silent_audio(dur, vo)
        elif vo.exists():
            r = run(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(vo)], capture_output=True, text=True)
            dur = float(json.loads(r.stdout)["format"]["duration"])
        else:
            dur = await make_cine_vo(scene["vo"], vo)
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
        rows.append((scene, dur, vo))
        print(f"  {scene['id']}: {dur:.1f}s")
    return rows


async def build_cinematic_video() -> Path:
    print("=== NeerCred Cinematic Story — 4K 9:16 ===\n")
    for d in (AUDIO, FRAMES, CLIPS):
        d.mkdir(parents=True, exist_ok=True)

    ekyc = gpf.ensure_celebration_frames()
    transfer = gpf.ensure_transfer_frames()
    endcard_v = gpf.ensure_endcard_frames_vertical()
    anim_frames = {"ekyc": ekyc, "transfer": transfer, "endcard": endcard_v}

    logo = gpf.load_logo()
    logo_hires = gpf.load_logo_hires()
    scene_durations = await prepare_vo(CINEMATIC_SCENES)

    clips: list[Path] = []
    for i, (scene, dur, vo) in enumerate(scene_durations):
        clip = render_cinematic_clip(scene, logo, logo_hires, vo, dur, i, anim_frames)
        clips.append(clip)
        print(f"  clip {scene['id']}: {dur:.1f}s")

    merged = OUT / "cinematic_merged.mp4"
    gpf.concat_clips(clips, merged)

    r = run(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(merged)], capture_output=True, text=True)
    vid_dur = float(json.loads(r.stdout)["format"]["duration"])
    bgm = AUDIO / "bgm_cinematic.mp3"
    gpf.make_bgm(vid_dur, bgm)

    v_raw = DOWNLOAD / "NeerCred-Cinematic-RAW.mp4"
    v_out = DOWNLOAD / "NeerCred-Cinematic-Story.mp4"
    run([
        "ffmpeg", "-y", "-i", str(merged), "-i", str(bgm),
        "-filter_complex",
        "[0:a]highpass=f=100,lowpass=f=13000,volume=2.4[sp1];"
        "[sp1]asplit=2[sc][mx];"
        "[1:a]volume=0.68,aloop=loop=-1:size=2e+09[pi1];"
        "[pi1][sc]sidechaincompress=threshold=0.03:ratio=5:attack=40:release=450:makeup=2.5[du1];"
        "[mx][du1]amix=inputs=2:duration=first:weights=1 0.88:normalize=0,"
        "loudnorm=I=-16:TP=-1.0:LRA=11,alimiter=limit=0.96[aout]",
        "-map", "0:v:0", "-map", "[aout]",
        "-c:v", "copy", "-c:a", "aac", "-b:a", "320k", "-ar", "44100", "-ac", "2",
        str(v_raw),
    ])
    print("  Finalizing cinematic export...")
    gpf.finalize_mobile_mp4(v_raw, v_out)
    v_raw.unlink(missing_ok=True)

    ig = DOWNLOAD / "NeerCred-Cinematic-Instagram.mp4"
    ig.write_bytes(v_out.read_bytes())

    audit = gpf.audit_instagram_video(v_out)
    audit_path = OUT / "cinematic_916_audit.json"
    audit_path.write_text(json.dumps(audit, indent=2))
    print("\n=== Cinematic QC ===")
    for k, v in audit["checks"].items():
        print(f"  {'✅' if v else '❌'} {k}: {v}")

    ws = Path("/workspace/artifacts")
    ws.mkdir(parents=True, exist_ok=True)
    for src, name in [(v_out, "NeerCred-Cinematic-Story.mp4"), (ig, "NeerCred-Cinematic-Instagram.mp4"), (audit_path, "cinematic_916_audit.json")]:
        if Path(src).exists():
            (ws / name).write_bytes(Path(src).read_bytes())

    print(f"\n✅ CINEMATIC VIDEO:\n   {v_out}\n   {ig}")
    return v_out


if __name__ == "__main__":
    asyncio.run(build_cinematic_video())
