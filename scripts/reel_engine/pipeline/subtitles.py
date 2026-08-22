"""Subtitle generation (SRT)."""

from __future__ import annotations

from pathlib import Path

from scripts.reel_engine.models import ReelProject


def _fmt_time(sec: float) -> str:
    h = int(sec // 3600)
    m = int((sec % 3600) // 60)
    s = int(sec % 60)
    ms = int((sec % 1) * 1000)
    return f"{h:02d}:{m:02d}:{s:02d},{ms:03d}"


def build_srt(project: ReelProject, line_durations: dict[str, float] | None = None) -> str:
    """Build SRT from voice script timing. line_durations maps line id -> actual audio duration."""
    lines_srt = []
    idx = 1
    scene_cursor = 0.0
    line_idx = 0

    for scene in project.scenes:
        line_cursor = 0.4 if scene.dialogue else 0.0
        for perf in scene.dialogue:
            lid = f"{scene.id}_{line_idx}"
            start = scene_cursor + line_cursor + perf.pause_before_sec
            dur = (line_durations or {}).get(lid, max(1.5, len(perf.text) * 0.07))
            end = start + dur
            speaker = project.speakers.get(perf.speaker, {}).get("name", perf.speaker)
            text = perf.text
            if speaker:
                text = f"{speaker}: {perf.text}"
            lines_srt.append(f"{idx}\n{_fmt_time(start)} --> {_fmt_time(end)}\n{text}\n")
            line_cursor += perf.pause_before_sec + dur
            idx += 1
            line_idx += 1
        scene_cursor += scene.duration_target

    return "\n".join(lines_srt)


def write_subtitles(project: ReelProject, paths: dict[str, Path], line_durations: dict[str, float] | None = None) -> Path:
    srt = build_srt(project, line_durations)
    out = paths["output"] / "subtitles.srt"
    out.write_text(srt)
    return out
