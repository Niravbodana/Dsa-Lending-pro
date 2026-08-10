"""Unavailable lip-sync provider."""

from __future__ import annotations

from pathlib import Path

from scripts.reel_engine.config import ProviderConfig
from scripts.reel_engine.providers.base import LipSyncProvider, ProviderResult


class UnavailableLipSyncProvider(LipSyncProvider):
    name = "unavailable"

    def __init__(self, cfg: ProviderConfig):
        self.cfg = cfg

    def is_configured(self) -> bool:
        return False

    def sync(self, video_path: Path, audio_path: Path, out_path: Path) -> ProviderResult:
        return ProviderResult(
            success=False,
            message="LIPSYNC_PROVIDER not configured. Native model lip-sync or Sync Labs required for on-camera dialogue.",
        )
