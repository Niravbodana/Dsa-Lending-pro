"""Runway Gen-3 Alpha image-to-video provider."""

from __future__ import annotations

from pathlib import Path

from scripts.reel_engine.config import ProviderConfig
from scripts.reel_engine.models import SceneSpec
from scripts.reel_engine.providers.base import ProviderResult, VideoProvider


class RunwayVideoProvider(VideoProvider):
    name = "runway"

    def __init__(self, cfg: ProviderConfig):
        self.cfg = cfg

    def is_configured(self) -> bool:
        return bool(self.cfg.runway_api_key)

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
                "Runway provider stub: set RUNWAY_API_KEY and implement gen3/image_to_video. "
                f"Scene '{scene.id}' prompt ready for generation."
            ),
        )
