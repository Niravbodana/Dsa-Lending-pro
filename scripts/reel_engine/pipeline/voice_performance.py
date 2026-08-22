"""Voice performance script generation and synthesis."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from scripts.reel_engine.models import ReelProject, VoicePerformance
from scripts.reel_engine.providers.base import VoiceProvider


def build_voice_script(project: ReelProject) -> dict[str, Any]:
    lines: list[dict[str, Any]] = []
    scene_cursor = 0.0
    global_idx = 0

    for scene in project.scenes:
        line_cursor = 0.4 if scene.dialogue else 0.0
        for perf in scene.dialogue:
            entry = {
                "id": f"{scene.id}_{global_idx}",
                "scene_id": scene.id,
                "scene_start_sec": round(scene_cursor, 2),
                "at_sec": round(scene_cursor + line_cursor + perf.pause_before_sec, 2),
                "speaker": perf.speaker,
                "text": perf.text,
                "performance": perf.to_dict(),
                "on_camera": perf.on_camera,
                "requires_lipsync": perf.on_camera and scene.requires_lipsync,
            }
            lines.append(entry)
            line_cursor += perf.pause_before_sec
            global_idx += 1
        scene_cursor += scene.duration_target

    return {
        "project_id": project.id,
        "title": project.title,
        "language": "en-IN",
        "delivery": "natural conversational Indian English",
        "lines": lines,
        "performance_rules": [
            "Every line includes emotional_state, speed, intensity, and direction.",
            "Use micro-pauses and breathing — actors must NOT sound like they are reading.",
            "Mother: warm, tired, hiding concern. Son: gentle, direct, loving.",
            "No American/British announcer delivery.",
        ],
    }


def write_voice_script(project: ReelProject, paths: dict[str, Path]) -> Path:
    script = build_voice_script(project)
    out = paths["output"] / "voice_script.json"
    out.write_text(json.dumps(script, indent=2))
    return out


async def synthesize_dialogue(
    project: ReelProject,
    voice_provider: VoiceProvider,
    paths: dict[str, Path],
) -> tuple[list[Path], dict[str, Any]]:
    """Synthesize all dialogue lines. Returns clip paths and synthesis report."""
    clips: list[Path] = []
    report: dict[str, Any] = {
        "provider": voice_provider.name,
        "production_quality": voice_provider.is_production_quality(),
        "lines": [],
        "success_count": 0,
        "fail_count": 0,
    }

    idx = 0
    for scene in project.scenes:
        for perf in scene.dialogue:
            vcfg = project.voices.get(perf.speaker, {})
            out = paths["audio"] / f"line_{idx:03d}_{scene.id}.mp3"
            if perf.pause_before_sec > 0:
                gap = paths["audio"] / f"gap_{idx:03d}.wav"
                _silence(perf.pause_before_sec, gap)
                clips.append(gap)

            result = await voice_provider.synthesize_line(perf, vcfg, out)
            line_report = {
                "scene": scene.id,
                "speaker": perf.speaker,
                "text": perf.text,
                "success": result.success,
                "message": result.message,
                "path": str(result.path) if result.path else None,
            }
            report["lines"].append(line_report)
            if result.success and result.path:
                clips.append(result.path)
                report["success_count"] += 1
            else:
                report["fail_count"] += 1
            idx += 1

    return clips, report


def _silence(sec: float, path: Path) -> None:
    import subprocess
    subprocess.run(
        ["ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-t", f"{sec:.3f}", str(path)],
        check=True,
    )
