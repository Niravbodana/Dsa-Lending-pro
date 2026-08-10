#!/usr/bin/env python3
"""Story 3 Cinema — dialogue film with dual voices, SFX, BGM, Playwright capture."""

from __future__ import annotations

import asyncio
import json
import subprocess
import urllib.request
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parents[1]
OUT = Path("/opt/cursor/artifacts/neercred-reels-story3-cinema")
AUDIO = OUT / "audio"
PUBLIC = ROOT / "frontend/public"
TIMELINE_JSON = PUBLIC / "story3-timeline.json"
ASSETS = Path("/opt/cursor/artifacts/neercred-promo-video/assets")
SCREENS = Path("/opt/cursor/artifacts/neercred-promo-video/screenshots")
DOWNLOAD = Path("/opt/cursor/artifacts")

W, H = 1080, 1920
FPS = 30

VOICES = {
    "meera": ("en-IN-NeerjaNeural", "-6%", "-2Hz"),
    "receptionist": ("hi-IN-SwaraNeural", "-18%", "-6Hz"),
    "narrator": ("en-IN-NeerjaNeural", "-12%", "-4Hz"),
}

BGM = {
    "tension": (ASSETS / "silent-descent.mp3", 0.38),
    "transition": (ASSETS / "too_many_days_piano.mp3", 0.28),
    "hope": (ASSETS / "too_many_days_piano.mp3", 0.42),
    "uplift": (ASSETS / "soft_morning_keys_piano.mp3", 0.48),
}

# Dialogue screenplay — characters talk to each other (movie style)
FILM_SCENES = [
    {
        "id": "corridor",
        "bg": "story3-01-hospital-corridor.png",
        "mood": "tension",
        "ken": "in",
        "lines": [
            {"speaker": "narrator", "name": "Meera", "text": "Raat ke do baje... hospital ki corridor sunsaan thi."},
            {"speaker": "narrator", "name": "Meera", "text": "Papa admit hue. Counter ne bola — ek lakh assi hazaar advance."},
        ],
    },
    {
        "id": "counter",
        "bg": "story3-02-hospital-counter.png",
        "mood": "tension",
        "ken": "right",
        "lines": [
            {"speaker": "receptionist", "name": "Receptionist", "text": "Kitna amount pending hai abhi?"},
            {"speaker": "meera", "name": "Meera", "text": "Ek lakh assi hazaar... insurance ne sirf partial cover kiya."},
            {"speaker": "receptionist", "name": "Receptionist", "text": "Baaki ka arrangement ho gaya?"},
            {"speaker": "meera", "name": "Meera", "text": "Nahi... abhi tak koi solution nahi mila."},
        ],
    },
    {
        "id": "panic",
        "bg": "story3-03-worried-phone.png",
        "mood": "tension",
        "ken": "in",
        "lines": [
            {"speaker": "meera", "name": "Meera", "text": "ATM limit khatam ho chuki thi."},
            {"speaker": "meera", "name": "Meera", "text": "Is waqt kise phone karun? Sab so rahe the."},
        ],
    },
    {
        "id": "suggestion",
        "bg": "story3-04-receptionist-help.png",
        "mood": "transition",
        "ken": "left",
        "lines": [
            {"speaker": "receptionist", "name": "Receptionist", "text": "Ek minute... aap NeerCred try kijiye."},
            {"speaker": "receptionist", "name": "Receptionist", "text": "Phone se eligible offers mil jaate hain. Branch jaane ki zaroorat nahi."},
            {"speaker": "meera", "name": "Meera", "text": "Sach mein? Itni raat ko bhi?"},
            {"speaker": "receptionist", "name": "Receptionist", "text": "Haan. Compare karke apply kar sakte hain."},
        ],
    },
    {
        "id": "app",
        "type": "phone",
        "bg": "story3-04-receptionist-help.png",
        "screens": ["01-homepage.png", "09-offers.png", "12-approved.png"],
        "mood": "hope",
        "ken": "in",
        "lines": [
            {"speaker": "meera", "name": "Meera", "text": "Maine NeerCred khola... partner lenders ke offers ek screen pe."},
            {"speaker": "meera", "name": "Meera", "text": "Compare karke best option choose kiya. Fully digital."},
        ],
    },
    {
        "id": "relief",
        "bg": "story3-05-relief.png",
        "mood": "hope",
        "ken": "out",
        "lines": [
            {"speaker": "meera", "name": "Meera", "text": "Jab clarity mili... ek pal ke liye saans aayi."},
            {"speaker": "narrator", "name": "Meera", "text": "Tension kam hui. Ab decision clear tha."},
        ],
    },
]


def run(cmd: list, **kw) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, check=True, **kw)


def probe(path: Path) -> float:
    r = run(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(path)],
            capture_output=True, text=True)
    return float(json.loads(r.stdout)["format"]["duration"])


def brand_text(t: str) -> str:
    t = t.replace("NeerCred", "Neer Cred")
    return t


async def synth_line(speaker: str, text: str, path: Path) -> float:
    voice, rate, pitch = VOICES[speaker]
    raw = path.with_suffix(".raw.mp3")
    await edge_tts.Communicate(brand_text(text), voice, rate=rate, pitch=pitch).save(str(raw))
    af = (
        "highpass=f=90,lowpass=f=12500,"
        "equalizer=f=280:width_type=o:width=2:g=2,"
        "equalizer=f=2600:width_type=o:width=2:g=1.5,"
        "afftdn=nr=2:nf=-30,"
        "acompressor=threshold=-22dB:ratio=2.5:attack=12:release=150:makeup=2,"
    )
    if speaker == "receptionist":
        af += "asetrate=44100*0.94,aresample=44100,"
    af += "aecho=0.8:0.85:20:0.05,loudnorm=I=-20:TP=-2:LRA=9"
    run(["ffmpeg", "-y", "-i", str(raw), "-af", af, "-ar", "44100", "-ac", "2", "-b:a", "256k", str(path)])
    raw.unlink(missing_ok=True)
    return probe(path)


def silence(sec: float, path: Path) -> None:
    run([
        "ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo",
        "-t", f"{sec:.3f}", str(path),
    ])


def make_hospital_ambient(dur: float, path: Path) -> None:
    run([
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", f"anoisesrc=d={dur + 2}:c=pink:amplitude=0.018",
        "-f", "lavfi", "-i", f"sine=f=120:duration={dur + 2}",
        "-filter_complex",
        "[0:a]lowpass=f=450,highpass=f=60[v1];"
        "[1:a]volume=0.04[v2];"
        "[v1][v2]amix=inputs=2:duration=first[vout];"
        "[vout]volume=0.55,afade=t=in:d=2,afade=t=out:st=" + f"{max(0, dur - 2):.2f}" + ":d=2",
        "-t", f"{dur:.3f}", "-ar", "44100", "-ac", "2", str(path),
    ])


def make_heartbeat_layer(dur: float, path: Path) -> None:
    run([
        "ffmpeg", "-y",
        "-f", "lavfi", "-i", f"sine=frequency=55:duration={dur}",
        "-af",
        "volume=0.08,tremolo=f=1.1:d=0.45,lowpass=f=100,"
        f"afade=t=in:d=1,afade=t=out:st={max(0, dur - 1.5):.2f}:d=1.5",
        "-t", f"{dur:.3f}", "-ar", "44100", "-ac", "2", str(path),
    ])


async def build_timeline_and_audio() -> tuple[dict, Path, Path, float]:
    AUDIO.mkdir(parents=True, exist_ok=True)
    timeline_scenes = []
    dialogue_clips: list[Path] = []
    cursor = 0.0
    scene_specs: list[tuple[str, float, float]] = []  # mood, start, dur

    for scene in FILM_SCENES:
        scene_start = cursor
        line_cursor = 0.8  # scene intro pause
        timeline_lines = []

        for i, line in enumerate(scene["lines"]):
            clip = AUDIO / f"{scene['id']}_line_{i}.mp3"
            ldur = await synth_line(line["speaker"], line["text"], clip)
            gap_before = 0.55 if i > 0 else 0.0
            line_cursor += gap_before
            timeline_lines.append({
                "speaker": line["speaker"],
                "name": line["name"],
                "text": line["text"],
                "at": line_cursor,
                "duration": ldur,
            })
            # place in master dialogue track
            if gap_before > 0:
                gap = AUDIO / f"gap_{scene['id']}_{i}.wav"
                silence(gap_before, gap)
                dialogue_clips.append(gap)
            dialogue_clips.append(clip)
            line_cursor += ldur

        scene_dur = line_cursor + 1.2
        scene_specs.append((scene["mood"], scene_start, scene_dur))

        entry = {
            "id": scene["id"],
            "bg": scene["bg"],
            "duration": round(scene_dur, 2),
            "mood": scene["mood"],
            "ken": scene.get("ken", "in"),
            "lines": timeline_lines,
        }
        if scene.get("type") == "phone":
            entry["type"] = "phone"
            entry["screens"] = scene.get("screens", [])
        timeline_scenes.append(entry)
        cursor += scene_dur - 1.4  # overlap for crossfade

    film_dur = sum(s["duration"] for s in timeline_scenes) - 1.4 * (len(timeline_scenes) - 1)

    # Endcard duration
    endcard_dur = 9.0
    endcard_vo = AUDIO / "endcard.mp3"
    await edge_tts.Communicate(
        brand_text("Apply now on neercred.com. Neer Cred. Dream Big. Borrow Smart."),
        "en-IN-NeerjaNeural", rate="-8%", pitch="-2Hz",
    ).save(str(endcard_vo.with_suffix(".raw.mp3")))
    run([
        "ffmpeg", "-y", "-i", str(endcard_vo.with_suffix(".raw.mp3")),
        "-af", "highpass=f=90,lowpass=f=12000,acompressor=threshold=-20dB:ratio=2.5:attack=10:release=120:makeup=2,"
               "loudnorm=I=-18:TP=-2:LRA=9",
        "-ar", "44100", "-ac", "2", "-b:a", "256k", str(endcard_vo),
    ])
    endcard_vo.with_suffix(".raw.mp3").unlink(missing_ok=True)
    evo = probe(endcard_vo)
    if evo < endcard_dur:
        silence(endcard_dur - evo, AUDIO / "endpad.wav")
        lst = AUDIO / "endlist.txt"
        lst.write_text(f"file '{endcard_vo}'\nfile '{AUDIO / 'endpad.wav'}'")
        run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(lst),
             "-ar", "44100", "-ac", "2", str(endcard_vo)])

    total_dur = film_dur + endcard_dur - 1.0

    timeline = {
        "totalDuration": round(film_dur, 2),
        "scenes": timeline_scenes,
        "endcardDuration": endcard_dur,
    }
    TIMELINE_JSON.write_text(json.dumps(timeline, indent=2))

    # Dialogue master
    dlg_list = AUDIO / "dialogue_list.txt"
    dlg_list.write_text("\n".join(f"file '{p}'" for p in dialogue_clips))
    dialogue_master = AUDIO / "dialogue_master.wav"
    run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(dlg_list),
         "-ar", "44100", "-ac", "2", str(dialogue_master)])
    # pad dialogue to film_dur
    run([
        "ffmpeg", "-y", "-i", str(dialogue_master),
        "-af", f"apad=pad_dur={max(0, film_dur - probe(dialogue_master)):.3f}",
        "-t", f"{film_dur:.3f}", str(AUDIO / "dialogue_padded.wav"),
    ])

    # BGM per scene stitched
    bgm_parts = []
    for mood, start, dur in scene_specs:
        src, vol = BGM[mood]
        seg = AUDIO / f"bgm_{mood}_{start:.0f}.wav"
        run([
            "ffmpeg", "-y", "-stream_loop", "-1", "-i", str(src),
            "-t", f"{dur + 0.5:.3f}",
            "-af", f"highpass=f=70,lowpass=f=9000,volume={vol},"
                   f"afade=t=in:d=1.2,afade=t=out:st={max(0.1, dur - 1):.2f}:d=1",
            "-ar", "44100", "-ac", "2", str(seg),
        ])
        bgm_parts.append(seg)

    bgm_list = AUDIO / "bgm_list.txt"
    bgm_list.write_text("\n".join(f"file '{p}'" for p in bgm_parts))
    bgm_master = AUDIO / "bgm_master.wav"
    if len(bgm_parts) == 1:
        run(["ffmpeg", "-y", "-i", str(bgm_parts[0]), "-t", f"{film_dur:.3f}", str(bgm_master)])
    else:
        # crossfade chain
        inputs = []
        for p in bgm_parts:
            inputs += ["-i", str(p)]
        durs = [probe(p) for p in bgm_parts]
        fade = 1.2
        parts = [f"[0:a][1:a]acrossfade=d={fade}:c1=tri:c2=tri[a1]"]
        aprev = "a1"
        for i in range(2, len(bgm_parts)):
            parts.append(f"[{aprev}][{i}:a]acrossfade=d={fade}:c1=tri:c2=tri[a{i}]")
            aprev = f"a{i}"
        run(["ffmpeg", "-y", *inputs, "-filter_complex", ";".join(parts),
             "-map", f"[{aprev}]", "-t", f"{film_dur:.3f}", str(bgm_master)])

    # Ambient + heartbeat for full film portion
    ambient = AUDIO / "ambient.wav"
    make_hospital_ambient(film_dur, ambient)
    heartbeat = AUDIO / "heartbeat.wav"
    make_heartbeat_layer(film_dur, heartbeat)

    # Mix all audio
    mixed = AUDIO / "film_audio.wav"
    run([
        "ffmpeg", "-y",
        "-i", str(AUDIO / "dialogue_padded.wav"),
        "-i", str(bgm_master),
        "-i", str(ambient),
        "-i", str(heartbeat),
        "-filter_complex",
        "[0:a]volume=1.45[vox];"
        "[1:a]volume=0.62[bg];"
        "[2:a]volume=0.72[amb];"
        "[3:a]volume=0.38[hb];"
        "[bg][amb][hb][vox]amix=inputs=4:duration=first:weights=0.65 0.4 0.25 1.25:normalize=0,"
        "loudnorm=I=-14:TP=-1.0:LRA=9,alimiter=limit=0.96[aout]",
        "-map", "[aout]", "-t", f"{film_dur:.3f}",
        "-ar", "44100", "-ac", "2", str(mixed),
    ])

    timeline = {
        "totalDuration": round(film_dur, 2),
        "scenes": timeline_scenes,
        "endcardDuration": endcard_dur,
    }
    return timeline, mixed, endcard_vo, total_dur


def record_film_web(timeline: dict) -> Path:
    from playwright.sync_api import sync_playwright

    OUT.mkdir(parents=True, exist_ok=True)
    video_dir = OUT / "capture"
    video_dir.mkdir(exist_ok=True)
    for f in video_dir.glob("*.webm"):
        f.unlink()

    dur_ms = int(timeline["totalDuration"] * 1000) + 800
    print(f"  Recording cinema page ({timeline['totalDuration']:.1f}s)...")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(
            viewport={"width": 540, "height": 960},
            device_scale_factor=2,
            record_video_dir=str(video_dir),
            record_video_size={"width": 1080, "height": 1920},
        )
        ctx.add_init_script(
            "localStorage.setItem('neer_cookie_consent_v1', JSON.stringify({essential:true,analytics:false}));"
        )
        page = ctx.new_page()
        page.goto("http://localhost:3000/promo-story3-film?autoplay=1", wait_until="domcontentloaded", timeout=60000)
        page.wait_for_function("document.fonts.ready", timeout=15000)
        page.wait_for_function("() => document.getElementById('story3-film-root')?.dataset.started === '1'", timeout=10000)
        page.wait_for_timeout(dur_ms)
        video_path = Path(page.video.path())
        ctx.close()
        browser.close()

    webm = sorted(video_dir.glob("*.webm"))[-1]
    mp4 = OUT / "film_capture.mp4"
    run([
        "ffmpeg", "-y", "-i", str(webm),
        "-vf", f"fps={FPS},scale={W}:{H}:flags=lanczos",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "17", "-preset", "medium",
        "-an", str(mp4),
    ])
    return mp4


def capture_endcard(dur: float) -> Path:
    cache = OUT / "endcard_clip.mp4"
    from playwright.sync_api import sync_playwright

    frames_dir = OUT / "endcard_frames"
    frames_dir.mkdir(exist_ok=True)
    n = int(dur * FPS)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(viewport={"width": 540, "height": 960}, device_scale_factor=2)
        page = ctx.new_page()
        page.goto("http://localhost:3000/promo-endcard", wait_until="domcontentloaded", timeout=30000)
        page.wait_for_function("document.fonts.ready", timeout=15000)
        page.wait_for_timeout(600)
        for i in range(n):
            page.screenshot(path=str(frames_dir / f"f_{i:04d}.png"), type="png", animations="allow")
            page.wait_for_timeout(int(1000 / FPS))
        browser.close()
    run([
        "ffmpeg", "-y", "-framerate", str(FPS), "-i", str(frames_dir / "f_%04d.png"),
        "-vf", "fade=t=in:st=0:d=0.4",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "17", str(cache),
    ])
    for f in frames_dir.glob("*.png"):
        f.unlink()
    return cache


def finalize(film_v: Path, film_a: Path, endcard_v: Path, endcard_a: Path, out: Path) -> None:
    # trim film video to audio length
    fa_dur = probe(film_a)
    trimmed = OUT / "film_trim.mp4"
    run(["ffmpeg", "-y", "-i", str(film_v), "-t", f"{fa_dur:.3f}", "-c:v", "copy", str(trimmed)])

    film_mux = OUT / "film_mux.mp4"
    run([
        "ffmpeg", "-y", "-i", str(trimmed), "-i", str(film_a),
        "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "320k",
        "-shortest", str(film_mux),
    ])

    ec_mux = OUT / "endcard_mux.mp4"
    run([
        "ffmpeg", "-y", "-i", str(endcard_v), "-i", str(endcard_a),
        "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "320k",
        "-shortest", str(ec_mux),
    ])

    concat = OUT / "concat.txt"
    concat.write_text(f"file '{film_mux}'\nfile '{ec_mux}'")
    merged = OUT / "merged.mp4"
    run([
        "ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(concat),
        "-c", "copy", str(merged),
    ])

    with_disclaimer = OUT / "with_disclaimer.mp4"
    run([
        "ffmpeg", "-y", "-i", str(merged),
        "-vf",
        "drawtext=fontfile=/opt/cursor/artifacts/neercred-promo-video/assets/Poppins-Regular.ttf:"
        "text='Eligible offers from partner lenders. Approval subject to lender terms.':"
        "fontsize=18:fontcolor=white@0.75:x=(w-text_w)/2:y=h-52:"
        "box=1:boxcolor=0x0B1220@0.55:boxborderw=8",
        "-c:a", "copy", "-c:v", "libx264", "-crf", "19", "-pix_fmt", "yuv420p",
        str(with_disclaimer),
    ])

    run([
        "ffmpeg", "-y", "-i", str(with_disclaimer),
        "-c:v", "libx264", "-profile:v", "main", "-level", "4.0",
        "-pix_fmt", "yuv420p", "-crf", "19", "-preset", "medium",
        "-movflags", "+faststart", "-tag:v", "avc1",
        "-c:a", "aac", "-b:a", "128k", "-ar", "44100", "-ac", "2",
        "-brand", "mp42", str(out),
    ])


async def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    print("=== Story 3 CINEMA — Dialogue Film ===")

    print("  1/4 Building dialogue + situational audio...")
    timeline, film_audio, endcard_vo, total_dur = await build_timeline_and_audio()
    print(f"      Film: {timeline['totalDuration']:.1f}s | Total with endcard: {total_dur:.1f}s")

    print("  2/4 Recording cinematic web film...")
    film_video = record_film_web(timeline)

    print("  3/4 Capturing end card...")
    endcard_video = capture_endcard(probe(endcard_vo))

    print("  4/4 Final mux...")
    final = DOWNLOAD / "NeerCred-Reels-Story3-Medical.mp4"
    finalize(film_video, film_audio, endcard_video, endcard_vo, final)

    ws = Path("/workspace/artifacts")
    ws.mkdir(exist_ok=True)
    (ws / "NeerCred-Reels-Story3-Medical.mp4").write_bytes(final.read_bytes())
    (ws / "story3-timeline.json").write_bytes(TIMELINE_JSON.read_bytes())

    r = run(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", str(final)],
            capture_output=True, text=True)
    meta = json.loads(r.stdout)
    print(f"\n✅ CINEMA FILM READY: {final}")
    print(f"   Duration: {float(meta['format']['duration']):.1f}s")
    print(f"   Size: {int(meta['format']['size'])/1e6:.1f} MB")


if __name__ == "__main__":
    asyncio.run(main())
