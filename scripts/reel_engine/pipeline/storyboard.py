"""Storyboard and scene manifest generation."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from scripts.reel_engine.models import ReelProject, SceneSpec


def build_storyboard(project: ReelProject) -> dict[str, Any]:
    shots = []
    cursor = 0.0
    for scene in project.scenes:
        shots.append({
            "id": scene.id,
            "title": scene.title,
            "start_sec": round(cursor, 2),
            "duration_sec": scene.duration_target,
            "end_sec": round(cursor + scene.duration_target, 2),
            "time_range": scene.time_range,
            "type": scene.type,
            "mood": scene.mood,
            "characters": scene.characters,
            "location": project.locations[scene.location_id].name if scene.location_id in project.locations else "",
            "cinematography": scene.cinematography.to_dict(),
            "visual_prompt": scene.visual_prompt,
            "negative_prompt": scene.negative_prompt,
            "requires_lipsync": scene.requires_lipsync,
            "sound_design": scene.sound_design,
            "music_note": scene.music_note,
        })
        cursor += scene.duration_target

    return {
        "project_id": project.id,
        "title": project.title,
        "target_duration": project.target_duration,
        "total_duration": round(cursor, 2),
        "aspect_ratio": "9:16",
        "resolution": "1080x1920",
        "shot_count": len(shots),
        "shots": shots,
        "characters": {
            cid: {
                "name": c.name,
                "age_range": c.age_range,
                "description": c.description,
                "wardrobe": c.wardrobe,
                "reference_prompt": c.reference_prompt,
            }
            for cid, c in project.characters.items()
        },
        "pipeline_notes": [
            "Generate character reference portraits BEFORE scene video generation.",
            "Each shot is 3-9 seconds of photorealistic video, not Ken Burns on stills.",
            "Compose every shot natively for vertical 9:16 — no letterboxing.",
        ],
    }


def build_scenes_manifest(project: ReelProject, paths: dict[str, Path]) -> dict[str, Any]:
    scenes_out = []
    for scene in project.scenes:
        scenes_out.append({
            **scene.to_dict(),
            "output_video": str(paths["video"] / f"{scene.id}.mp4"),
            "output_audio": str(paths["audio"] / f"{scene.id}_dialogue.wav"),
            "status": "pending",
        })
    return {
        "project_id": project.id,
        "scenes": scenes_out,
        "assembly": {
            "method": "ffmpeg_concat",
            "crossfade_sec": 0,
            "output_resolution": "1080x1920",
            "output_fps": 30,
        },
    }


def write_storyboard(project: ReelProject, paths: dict[str, Path]) -> Path:
    board = build_storyboard(project)
    out = paths["output"] / "storyboard.json"
    out.write_text(json.dumps(board, indent=2))
    return out


def write_scenes_json(project: ReelProject, paths: dict[str, Path]) -> Path:
    manifest = build_scenes_manifest(project, paths)
    out = paths["output"] / "scenes.json"
    out.write_text(json.dumps(manifest, indent=2))
    return out
