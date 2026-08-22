"""Character reference generation workflow."""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any

from scripts.reel_engine.models import ReelProject
from scripts.reel_engine.providers.base import ImageProvider


def generate_character_refs(
    project: ReelProject,
    image_provider: ImageProvider,
    paths: dict[str, Path],
) -> tuple[dict[str, Path], dict[str, Any]]:
    refs: dict[str, Path] = {}
    report: dict[str, Any] = {"characters": []}

    for cid, character in project.characters.items():
        out = paths["characters"] / f"{cid}_ref.png"
        result = image_provider.generate_character_ref(character, out)
        entry = {
            "id": cid,
            "name": character.name,
            "success": result.success,
            "path": str(result.path) if result.path else None,
            "message": result.message,
        }
        report["characters"].append(entry)
        if result.success and result.path and result.path.suffix == ".png":
            refs[cid] = result.path

    manifest = paths["output"] / "character_refs.json"
    manifest.write_text(json.dumps(report, indent=2))
    return refs, report
