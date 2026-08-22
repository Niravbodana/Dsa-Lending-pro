"""Explicit unavailable video provider — never falls back to Ken Burns."""

from __future__ import annotations

from pathlib import Path

from scripts.reel_engine.config import ProviderConfig
from scripts.reel_engine.models import SceneSpec
from scripts.reel_engine.providers.base import ProviderResult, VideoProvider


class UnavailableVideoProvider(VideoProvider):
    name = "unavailable"

    def __init__(self, cfg: ProviderConfig):
        self.cfg = cfg

    def is_configured(self) -> bool:
        return False

    def generate_shot(
        self,
        scene: SceneSpec,
        character_refs: dict[str, Path],
        out_path: Path,
        duration_sec: float,
    ) -> ProviderResult:
        missing = self.cfg.missing_for_photoreal()[0] if self.cfg.missing_for_photoreal() else "VIDEO_PROVIDER not set"
        return ProviderResult(
            success=False,
            message=(
                f"Photorealistic video generation unavailable for scene '{scene.id}'. "
                f"{missing}. "
                "Configure VIDEO_PROVIDER=replicate|runway|fal with API credentials. "
                "Ken Burns / slideshow fallback is disabled by design."
            ),
        )
