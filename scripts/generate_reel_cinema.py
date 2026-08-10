#!/usr/bin/env python3
"""DEPRECATED — v1 Ken Burns slideshow reel generator.

Use scripts/generate_reel_v2.py (cinematic reel engine v2) instead.
This script produces illustrated slideshow + edge TTS output that fails
the photorealistic quality gate. Kept for reference only.
"""

from __future__ import annotations

import asyncio
import json
import subprocess
import sys
from pathlib import Path

import edge_tts

ROOT = Path(__file__).resolve().parents[1]
STORIES = ROOT / "scripts" / "reel_stories"
ASSETS_LIB = Path("/opt/cursor/artifacts/neercred-promo-video/assets")
SCREENS = Path("/opt/cursor/artifacts/neercred-promo-video/screenshots")
OUT_BASE = Path("/opt/cursor/artifacts/neercred-reel-cinema")
PUBLIC = ROOT / "frontend/public/reel-cinema"
DOWNLOAD = Path("/opt/cursor/artifacts")

W, H = 1080, 1920
FPS = 30
PHRASE_GAP = 0.22
SCENE_XFADE = 1.0


def run(cmd: list, **kw) -> subprocess.CompletedProcess:
    return subprocess.run(cmd, check=True, **kw)


def probe(path: Path) -> float:
    r = run(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", str(path)],
            capture_output=True, text=True)
    return float(json.loads(r.stdout)["format"]["duration"])


def brand_text(t: str) -> str:
    return t.replace("NeerCred", "Neer Cred")


async def synth_line(voice_cfg: dict, text: str, path: Path, mature: bool = False) -> float:
    raw = path.with_suffix(".raw.mp3")
    await edge_tts.Communicate(
        brand_text(text), voice_cfg["engine"], rate=voice_cfg.get("rate", "-8%"), pitch=voice_cfg.get("pitch", "+0Hz"),
    ).save(str(raw))
    af = (
        "highpass=f=85,lowpass=f=12200,"
        "equalizer=f=250:width_type=o:width=2:g=1.5,"
        "equalizer=f=2400:width_type=o:width=2:g=1.8,"
        "afftdn=nr=2:nf=-30,"
        "acompressor=threshold=-22dB:ratio=2.4:attack=10:release=140:makeup=2,"
    )
    if mature:
        af += "asetrate=44100*0.92,aresample=44100,"
    af += "aecho=0.82:0.86:16:0.04,loudnorm=I=-20:TP=-2:LRA=8"
    run(["ffmpeg", "-y", "-i", str(raw), "-af", af, "-ar", "44100", "-ac", "2", "-b:a", "256k", str(path)])
    raw.unlink(missing_ok=True)
    return probe(path)


def silence(sec: float, path: Path) -> None:
    run(["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-t", f"{sec:.3f}", str(path)])


def ambient_track(kind: str, dur: float, path: Path) -> None:
  filters = {
      "kitchen": "anoisesrc=d={d}:c=pink:amplitude=0.012,lowpass=f=500,highpass=f=80",
      "home": "anoisesrc=d={d}:c=pink:amplitude=0.008,lowpass=f=600",
      "night": "anoisesrc=d={d}:c=brown:amplitude=0.015,lowpass=f=350,volume=0.7",
      "morning": "anoisesrc=d={d}:c=pink:amplitude=0.01,highpass=f=100,lowpass=f=800",
  }
  base = filters.get(kind, filters["home"]).format(d=dur + 1)
  run(["ffmpeg", "-y", "-f", "lavfi", "-i", base, "-t", f"{dur:.3f}", "-ar", "44100", "-ac", "2", str(path)])


async def build_story(story_path: Path) -> tuple[dict, Path, float]:
    story = json.loads(story_path.read_text())
    sid = story["id"]
    OUT = OUT_BASE / sid
    AUDIO = OUT / "audio"
    AUDIO.mkdir(parents=True, exist_ok=True)
    pub = PUBLIC / sid
    pub.mkdir(parents=True, exist_ok=True)

    voices = story["voices"]
    speakers = story["speakers"]
    timeline_scenes = []
    dialogue_parts: list[Path] = []
    bgm_specs: list[tuple[str, float, str]] = []  # mood key, duration, bgm file key
    film_cursor = 0.0

    for scene in story["scenes"]:
        if scene.get("type") == "endcard":
            timeline_scenes.append({
                "id": "endcard", "type": "endcard", "mood": "uplift",
                "duration": scene["durationTarget"], "ken": "in", "lines": [],
            })
            bgm_specs.append(("hope", scene["durationTarget"], "hope"))
            film_cursor += scene["durationTarget"] - SCENE_XFADE
            continue

        line_cursor = 0.6 if scene.get("lines") else 0.0
        timeline_lines = []

        for i, line in enumerate(scene.get("lines", [])):
            sp = line["speaker"]
            vcfg = voices[sp]
            clip = AUDIO / f"{scene['id']}_{i}.mp3"
            gap = line.get("pauseBefore", PHRASE_GAP if i > 0 else 0)
            if gap > 0:
                g = AUDIO / f"gap_{scene['id']}_{i}.wav"
                silence(gap, g)
                dialogue_parts.append(g)
                line_cursor += gap
            ldur = await synth_line(vcfg, line["text"], clip, mature=vcfg.get("mature", False))
            dialogue_parts.append(clip)
            timeline_lines.append({
                "speaker": sp,
                "name": speakers[sp]["name"],
                "text": line["text"],
                "at": round(line_cursor, 2),
                "duration": round(ldur, 2),
                "highlight": line.get("highlight", False),
            })
            line_cursor += ldur

        dur = float(scene.get("durationTarget", line_cursor + 0.5))
        entry = {
            "id": scene["id"],
            "bg": scene.get("image"),
            "duration": round(dur, 2),
            "mood": scene.get("mood", "quiet"),
            "ken": scene.get("ken", "in"),
            "timeLabel": scene.get("timeLabel", ""),
            "lines": timeline_lines,
        }
        if scene.get("type") == "phone":
            entry["type"] = "phone"
            entry["screens"] = scene.get("screens", [])
        timeline_scenes.append(entry)

        mood = scene.get("mood", "quiet")
        bgm_key = "quiet" if mood in ("quiet", "tension") else "warm" if mood == "warm" else "hope"
        bgm_specs.append((bgm_key, dur, bgm_key))
        film_cursor += dur - SCENE_XFADE

    film_dur = sum(s["duration"] for s in timeline_scenes) - SCENE_XFADE * (len(timeline_scenes) - 1)

    timeline = {
        "id": sid,
        "title": story["title"],
        "tagline": story["tagline"],
        "cta": story["cta"],
        "assetBase": story["assetBase"],
        "totalDuration": round(film_dur, 2),
        "speakers": speakers,
        "scenes": timeline_scenes,
    }
    (pub / "timeline.json").write_text(json.dumps(timeline, indent=2))

    # Dialogue track
    lst = AUDIO / "dlg_list.txt"
    lst.write_text("\n".join(f"file '{p}'" for p in dialogue_parts))
    dlg = AUDIO / "dialogue.wav"
    if dialogue_parts:
        run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-ar", "44100", "-ac", "2", str(dlg)])
        run(["ffmpeg", "-y", "-i", str(dlg), "-af", f"apad=pad_dur={max(0, film_dur - probe(dlg)):.3f}",
             "-t", f"{film_dur:.3f}", str(AUDIO / "dialogue_pad.wav")])
    else:
        silence(film_dur, AUDIO / "dialogue_pad.wav")

    # BGM stitched
    bgm_parts = []
    for i, (key, dur, _) in enumerate(bgm_specs):
        cfg = story["bgm"][key]
        src = ASSETS_LIB / cfg["file"]
        seg = AUDIO / f"bgm_{i}.wav"
        run([
            "ffmpeg", "-y", "-stream_loop", "-1", "-i", str(src),
            "-t", f"{dur + 0.3:.3f}",
            "-af", f"highpass=f=70,lowpass=f=8500,volume={cfg['volume']},"
                   f"afade=t=in:d=1,afade=t=out:st={max(0.1, dur - 0.8):.2f}:d=0.8",
            "-ar", "44100", "-ac", "2", str(seg),
        ])
        bgm_parts.append(seg)

    bgm_master = AUDIO / "bgm.wav"
    if len(bgm_parts) == 1:
        run(["ffmpeg", "-y", "-i", str(bgm_parts[0]), "-t", f"{film_dur:.3f}", str(bgm_master)])
    else:
        ins = []
        for p in bgm_parts:
            ins += ["-i", str(p)]
        fade = 1.0
        parts = [f"[0:a][1:a]acrossfade=d={fade}:c1=tri:c2=tri[a1]"]
        ap = "a1"
        for i in range(2, len(bgm_parts)):
            parts.append(f"[{ap}][{i}:a]acrossfade=d={fade}:c1=tri:c2=tri[a{i}]")
            ap = f"a{i}"
        run(["ffmpeg", "-y", *ins, "-filter_complex", ";".join(parts), "-map", f"[{ap}]",
             "-t", f"{film_dur:.3f}", str(bgm_master)])

    # Scene ambients layered lightly
    amb = AUDIO / "ambient_mix.wav"
    amb_parts = []
    t = 0.0
    for sc in story["scenes"]:
        if sc.get("type") == "endcard":
            continue
        kind = sc.get("ambient", "home")
        d = next(x["duration"] for x in timeline_scenes if x["id"] == sc["id"])
        p = AUDIO / f"amb_{sc['id']}.wav"
        ambient_track(kind, d, p)
        amb_parts.append((p, t, d))
        t += d - SCENE_XFADE

    # Mix
    mixed = AUDIO / "master.wav"
    run([
        "ffmpeg", "-y",
        "-i", str(AUDIO / "dialogue_pad.wav"),
        "-i", str(bgm_master),
        "-filter_complex",
        "[0:a]volume=1.5[vox];[1:a]volume=1.0[bg];"
        "[vox][bg]amix=inputs=2:duration=first:weights=1.2 0.7:normalize=0,"
        "loudnorm=I=-14:TP=-1.0:LRA=9,alimiter=limit=0.96[aout]",
        "-map", "[aout]", "-t", f"{film_dur:.3f}", "-ar", "44100", "-ac", "2", str(mixed),
    ])

    return timeline, mixed, film_dur


def record_film(story_id: str, duration: float) -> Path:
    from playwright.sync_api import sync_playwright

    OUT = OUT_BASE / story_id
    vdir = OUT / "capture"
    vdir.mkdir(parents=True, exist_ok=True)
    for f in vdir.glob("*.webm"):
        f.unlink()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        ctx = browser.new_context(
            viewport={"width": 540, "height": 960}, device_scale_factor=2,
            record_video_dir=str(vdir), record_video_size={"width": 1080, "height": 1920},
        )
        ctx.add_init_script(
            "localStorage.setItem('neer_cookie_consent_v1', JSON.stringify({essential:true,analytics:false,savedAt:new Date().toISOString()}));"
        )
        page = ctx.new_page()
        page.goto(f"http://localhost:3000/promo-reel-cinema?story={story_id}&autoplay=1",
                  wait_until="domcontentloaded", timeout=60000)
        page.wait_for_function("document.fonts.ready", timeout=15000)
        page.wait_for_function("() => document.getElementById('reel-cinema-root')?.dataset.started === '1'", timeout=12000)
        page.wait_for_timeout(int(duration * 1000) + 500)
        ctx.close()
        browser.close()

    webm = sorted(vdir.glob("*.webm"))[-1]
    mp4 = OUT / "film.mp4"
    run([
        "ffmpeg", "-y", "-i", str(webm), "-vf", f"fps={FPS},scale={W}:{H}:flags=lanczos",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "17", "-an", str(mp4),
    ])
    return mp4


def finalize(video: Path, audio: Path, out: Path) -> None:
    mux = video.parent / "muxed.mp4"
    run([
        "ffmpeg", "-y", "-i", str(video), "-i", str(audio),
        "-map", "0:v:0", "-map", "1:a:0", "-c:v", "copy", "-c:a", "aac", "-b:a", "320k",
        "-shortest", str(mux),
    ])
    run([
        "ffmpeg", "-y", "-i", str(mux),
        "-vf",
        "drawtext=fontfile=/opt/cursor/artifacts/neercred-promo-video/assets/Poppins-Regular.ttf:"
        "text='Eligible offers from partner lenders. Approval subject to lender terms.':"
        "fontsize=16:fontcolor=white@0.7:x=(w-text_w)/2:y=h-48:"
        "box=1:boxcolor=0x0B1220@0.5:boxborderw=6",
        "-c:a", "copy", "-c:v", "libx264", "-crf", "19", "-pix_fmt", "yuv420p",
        str(out.parent / "disc.mp4"),
    ])
    run([
        "ffmpeg", "-y", "-i", str(out.parent / "disc.mp4"),
        "-c:v", "libx264", "-profile:v", "main", "-level", "4.0",
        "-pix_fmt", "yuv420p", "-crf", "19", "-movflags", "+faststart", "-tag:v", "avc1",
        "-c:a", "aac", "-b:a", "128k", "-brand", "mp42", str(out),
    ])


async def build_audio_only(story_file: Path) -> tuple[str, float]:
    story = json.loads(story_file.read_text())
    sid = story["id"]
    print(f"=== Reel Cinema: {story['title']} ===")
    print("  Audio + timeline...")
    timeline, audio, dur = await build_story(story_file)
    print(f"  Duration: {dur:.1f}s")
    return sid, timeline["totalDuration"]


def finish_export(sid: str, story_file: Path) -> None:
    story = json.loads(story_file.read_text())
    audio = OUT_BASE / sid / "audio" / "master.wav"
    print("  Recording film...")
    video = record_film(sid, json.loads((PUBLIC / sid / "timeline.json").read_text())["totalDuration"])
    out_name = f"NeerCred-Reel-{sid}.mp4"
    final = DOWNLOAD / out_name
    finalize(video, audio, final)
    ws = ROOT / "artifacts"
    ws.mkdir(exist_ok=True)
    (ws / out_name).write_bytes(final.read_bytes())
    audit = {
        "story": sid,
        "title": story["title"],
        "duration_sec": probe(final),
        "target": story.get("targetDuration", 45),
    }
    (OUT_BASE / sid / "audit.json").write_text(json.dumps(audit, indent=2))
    print(f"\n✅ {final}\n   {audit['duration_sec']:.1f}s (target {audit['target']}s)")


if __name__ == "__main__":
    story_file = Path(sys.argv[1]) if len(sys.argv) > 1 else STORIES / "mom_doesnt_ask.json"
    sid, _ = asyncio.run(build_audio_only(story_file))
    finish_export(sid, story_file)
