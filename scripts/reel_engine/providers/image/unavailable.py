"""Unavailable image provider — writes prompt files only."""

from __future__ import annotations

from pathlib import Path

from scripts.reel_engine.config import ProviderConfig
from scripts.reel_engine.models import Character
from scripts.reel_engine.providers.base import ImageProvider, ProviderResult


class UnavailableImageProvider(ImageProvider):
    name = "unavailable"

    def __init__(self, cfg: ProviderConfig):
        self.cfg = cfg

    def is_configured(self) -> bool:
        return False

    def generate_character_ref(self, character: Character, out_path: Path) -> ProviderResult:
        prompt_path = out_path.with_suffix(".prompt.txt")
        prompt_path.write_text(
            f"CHARACTER: {character.name}\n"
            f"AGE: {character.age_range}\n"
            f"PROMPT: {character.reference_prompt}\n"
            f"WARDROBE: {character.wardrobe}\n"
            f"NEGATIVE: {character.negative_prompt}\n"
        )
        return ProviderResult(
            success=False,
            path=prompt_path,
            message=f"IMAGE_PROVIDER not configured. Prompt saved to {prompt_path}",
        )
