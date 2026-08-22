"""Fal.ai video provider stub."""

from __future__ import annotations

from pathlib import Path

from scripts.reel_engine.config import ProviderConfig
from scripts.reel_engine.models import SceneSpec
from scripts.reel_engine.providers.base import ProviderResult, VideoProvider


class FalVideoProvider(VideoProvider):
    name = "fal"

    def __init__(self, cfg: ProviderConfig):
        self.cfg = cfg

    def is_configured(self) -> bool:
        return bool(self.cfg.fal_api_key)

    def generate_shot(
        self,
        scene: SceneSpec,
        character_refs: dict[str, Path],
        out_path: Path,
        duration_sec: float,
    ) -> ProviderResult:
        return ProviderResult(
            success=False,
            message=(
                "Fal provider stub: set FAL_KEY and implement kling/minimax endpoint. "
                f"Scene '{scene.id}' prompt ready."
            ),
        )
