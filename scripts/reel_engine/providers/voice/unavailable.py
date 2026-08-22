"""Unavailable voice provider."""

from __future__ import annotations

from pathlib import Path

from scripts.reel_engine.config import ProviderConfig
from scripts.reel_engine.models import VoicePerformance
from scripts.reel_engine.providers.base import ProviderResult, VoiceProvider


class UnavailableVoiceProvider(VoiceProvider):
    name = "unavailable"

    def __init__(self, cfg: ProviderConfig):
        self.cfg = cfg

    def is_configured(self) -> bool:
        return False

    def is_production_quality(self) -> bool:
        return False

    async def synthesize_line(
        self,
        performance: VoicePerformance,
        voice_config: dict,
        out_path: Path,
    ) -> ProviderResult:
        return ProviderResult(
            success=False,
            message=(
                "No production voice provider configured. "
                "Set VOICE_PROVIDER=elevenlabs + ELEVENLABS_API_KEY. "
                "Edge TTS preview requires ALLOW_EDGE_TTS_PREVIEW=true (fails QC)."
            ),
        )
