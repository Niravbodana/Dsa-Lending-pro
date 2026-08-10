"""Character reference frames extracted from stock footage."""

from __future__ import annotations

import subprocess
from pathlib import Path

from scripts.reel_engine.config import ProviderConfig
from scripts.reel_engine.models import Character
from scripts.reel_engine.providers.base import ImageProvider, ProviderResult
from scripts.reel_engine.providers.video.stock import DEFAULT_STOCK_CLIPS, StockFootageVideoProvider

# Map characters to scene IDs whose footage contains them
CHAR_SCENE_MAP = {
    "mother": ["phone-call", "night-table", "discovery", "payoff"],
    "son": ["son-notices", "discovery", "solution", "payoff"],
}


class StockFrameImageProvider(ImageProvider):
    """Extract portrait frame from stock video as character reference."""

    name = "stock"

    def __init__(self, cfg: ProviderConfig):
        self.cfg = cfg
        self.video = StockFootageVideoProvider(cfg)

    def is_configured(self) -> bool:
        return True

    def generate_character_ref(self, character: Character, out_path: Path) -> ProviderResult:
        scenes = CHAR_SCENE_MAP.get(character.id, [])
        for scene_id in scenes:
            clip = DEFAULT_STOCK_CLIPS.get(scene_id)
            if not clip:
                continue
            cached = self.video.cache_dir / f"mixkit_{clip['mixkit_id']}.mp4"
            if not cached.exists():
                if not self.video._download(clip["url"], cached):
                    continue
            try:
                subprocess.run(
                    ["ffmpeg", "-y", "-i", str(cached), "-ss", "2", "-frames:v", "1",
                     "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920",
                     str(out_path)],
                    check=True,
                    capture_output=True,
                )
                if out_path.exists() and out_path.stat().st_size > 5000:
                    return ProviderResult(success=True, path=out_path, metadata={"source": f"mixkit:{clip['mixkit_id']}"})
            except Exception:
                continue
        prompt_path = out_path.with_suffix(".prompt.txt")
        prompt_path.write_text(f"CHARACTER REF PROMPT: {character.reference_prompt}\n")
        return ProviderResult(success=False, path=prompt_path, message="Could not extract frame; prompt saved")
