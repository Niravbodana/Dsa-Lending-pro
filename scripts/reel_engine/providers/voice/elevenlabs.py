"""ElevenLabs expressive voice provider."""

from __future__ import annotations

import json
from pathlib import Path

import httpx

from scripts.reel_engine.config import ProviderConfig
from scripts.reel_engine.models import VoicePerformance
from scripts.reel_engine.providers.base import ProviderResult, VoiceProvider

API = "https://api.elevenlabs.io/v1"


class ElevenLabsVoiceProvider(VoiceProvider):
    name = "elevenlabs"

    def __init__(self, cfg: ProviderConfig):
        self.cfg = cfg

    def is_configured(self) -> bool:
        return bool(self.cfg.elevenlabs_api_key)

    def is_production_quality(self) -> bool:
        return True

    def _voice_id(self, speaker: str, voice_config: dict) -> str:
        override = voice_config.get("elevenlabs_voice_id", "")
        if override:
            return override
        mapping = {
            "mother": self.cfg.voice_id_mother,
            "son": self.cfg.voice_id_son,
            "narrator": self.cfg.voice_id_narrator,
        }
        return mapping.get(speaker, "")

    def _build_ssml_like_text(self, perf: VoicePerformance) -> str:
        """Build text with performance hints for ElevenLabs."""
        text = perf.text
        for phrase, pause in perf.pauses_in_text:
            text = text.replace(phrase, f'{phrase}<break time="{int(pause*1000)}ms"/>', 1)
        return text

    def _stability_settings(self, perf: VoicePerformance) -> dict:
        stability = {"whisper": 0.35, "quiet": 0.45, "normal": 0.55, "emphatic": 0.65}[perf.intensity]
        style = {"slow": 0.2, "natural": 0.35, "slightly_fast": 0.5}[perf.speed]
        return {"stability": stability, "similarity_boost": 0.75, "style": style, "use_speaker_boost": True}

    async def synthesize_line(
        self,
        performance: VoicePerformance,
        voice_config: dict,
        out_path: Path,
    ) -> ProviderResult:
        voice_id = self._voice_id(performance.speaker, voice_config)
        if not voice_id:
            return ProviderResult(
                success=False,
                message=f"No ElevenLabs voice ID for speaker '{performance.speaker}'",
            )

        payload = {
            "text": self._build_ssml_like_text(performance),
            "model_id": voice_config.get("model", "eleven_multilingual_v2"),
            "voice_settings": self._stability_settings(performance),
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                r = await client.post(
                    f"{API}/text-to-speech/{voice_id}",
                    headers={
                        "xi-api-key": self.cfg.elevenlabs_api_key,
                        "Content-Type": "application/json",
                        "Accept": "audio/mpeg",
                    },
                    json=payload,
                )
                if r.status_code >= 400:
                    return ProviderResult(success=False, message=f"ElevenLabs error: {r.text[:300]}")
                out_path.write_bytes(r.content)
                return ProviderResult(success=True, path=out_path, metadata={"provider": self.name})
        except Exception as e:
            return ProviderResult(success=False, message=str(e))
