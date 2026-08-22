"""Audio mixing: dialogue, ambience, SFX, music."""

from __future__ import annotations

import json
import subprocess
from pathlib import Path
from typing import Any

from scripts.reel_engine.config import ASSETS_LIB
from scripts.reel_engine.models import ReelProject
from scripts.reel_engine.providers.base import MusicProvider
from scripts.reel_engine.providers.rendering.ffmpeg import probe_duration


def _ambient(kind: str, dur: float, path: Path) -> None:
    filters = {
        "kitchen": "anoisesrc=d={d}:c=pink:amplitude=0.012,lowpass=f=500,highpass=f=80",
        "home": "anoisesrc=d={d}:c=pink:amplitude=0.008,lowpass=f=600",
        "night": "anoisesrc=d={d}:c=brown:amplitude=0.015,lowpass=f=350,volume=0.7",
        "morning": "anoisesrc=d={d}:c=pink:amplitude=0.01,highpass=f=100,lowpass=f=800",
    }
    base = filters.get(kind, filters["home"]).format(d=dur + 1)
    subprocess.run(
        ["ffmpeg", "-y", "-f", "lavfi", "-i", base, "-t", f"{dur:.3f}", "-ar", "44100", "-ac", "2", str(path)],
        check=True,
    )


def build_dialogue_track(dialogue_clips: list[Path], total_duration: float, out: Path) -> None:
    if not dialogue_clips:
        subprocess.run(
            ["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-t", f"{total_duration:.3f}", str(out)],
            check=True,
        )
        return
    lst = out.with_suffix(".list.txt")
    lst.write_text("\n".join(f"file '{p}'" for p in dialogue_clips))
    raw = out.with_suffix(".raw.wav")
    subprocess.run(["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-ar", "44100", "-ac", "2", str(raw)], check=True)
    dlg_dur = probe_duration(raw)
    subprocess.run(
        [
            "ffmpeg", "-y", "-i", str(raw),
            "-af", f"apad=pad_dur={max(0, total_duration - dlg_dur):.3f}",
            "-t", f"{total_duration:.3f}", str(out),
        ],
        check=True,
    )


def build_bgm_track(project: ReelProject, music: MusicProvider, total_duration: float, out: Path) -> dict[str, Any]:
    segments = []
    cursor = 0.0
    for scene in project.scenes:
        seg_out = out.parent / f"bgm_{scene.id}.wav"
        res = music.get_track(scene.mood, scene.duration_target, seg_out)
        segments.append({"scene": scene.id, "success": res.success, "path": str(seg_out)})
        cursor += scene.duration_target

    if not segments:
        subprocess.run(
            ["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-t", f"{total_duration:.3f}", str(out)],
            check=True,
        )
        return {"segments": segments}

    lst = out.with_suffix(".list.txt")
    lst.write_text("\n".join(f"file '{Path(s['path'])}'" for s in segments if s["success"]))
    subprocess.run(
        ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(lst), "-t", f"{total_duration:.3f}", str(out)],
        check=True,
    )
    return {"segments": segments}


def mix_master(dialogue: Path, bgm: Path, ambients: list[Path], total_duration: float, out: Path) -> None:
    inputs = ["-i", str(dialogue), "-i", str(bgm)]
    for a in ambients:
        inputs += ["-i", str(a)]

    if len(ambients) == 0:
        fc = "[0:a]volume=1.4[vox];[1:a]volume=0.85[bg];[vox][bg]amix=inputs=2:duration=first:weights=1.2 0.65:normalize=0,loudnorm=I=-14:TP=-1.0:LRA=9[aout]"
    else:
        amb_mix = "".join(f"[{i+2}:a]" for i in range(len(ambients)))
        fc = (
            f"[0:a]volume=1.4[vox];[1:a]volume=0.85[bg];"
            f"{amb_mix}amix=inputs={len(ambients)}:duration=longest:weights={' '.join('0.3' for _ in ambients)}[amb];"
            f"[vox][bg][amb]amix=inputs=3:duration=first:weights=1.2 0.6 0.25:normalize=0,loudnorm=I=-14:TP=-1.0:LRA=9[aout]"
        )

    subprocess.run(
        ["ffmpeg", "-y", *inputs, "-filter_complex", fc, "-map", "[aout]", "-t", f"{total_duration:.3f}", str(out)],
        check=True,
    )


def build_scene_ambients(project: ReelProject, paths: dict[str, Path]) -> list[Path]:
    ambients = []
    for scene in project.scenes:
        if scene.type == "endcard":
            continue
        p = paths["audio"] / f"amb_{scene.id}.wav"
        _ambient(scene.ambient, scene.duration_target, p)
        ambients.append(p)
    return ambients
