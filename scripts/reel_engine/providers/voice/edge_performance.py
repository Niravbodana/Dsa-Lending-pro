"""Edge TTS with voice-performance layer — PREVIEW ONLY, fails QC for production."""

from __future__ import annotations

import subprocess
from pathlib import Path

import edge_tts

from scripts.reel_engine.config import ProviderConfig
from scripts.reel_engine.models import VoicePerformance
from scripts.reel_engine.providers.base import ProviderResult, VoiceProvider


class EdgePerformanceVoiceProvider(VoiceProvider):
    """Uses edge_tts with performance-derived rate/pitch/pauses. Not production quality."""

    name = "edge_performance"

    def __init__(self, cfg: ProviderConfig):
        self.cfg = cfg

    def is_configured(self) -> bool:
        return self.cfg.allow_edge_tts_preview

    def is_production_quality(self) -> bool:
        return False

    def _rate_pitch(self, perf: VoicePerformance, voice_config: dict) -> tuple[str, str]:
        base_rate = voice_config.get("rate", "-8%")
        base_pitch = voice_config.get("pitch", "+0Hz")
        rate_map = {"slow": "-14%", "natural": base_rate, "slightly_fast": "-2%"}
        pitch_map = {"whisper": "-8Hz", "quiet": "-4Hz", "normal": base_pitch, "emphatic": "+4Hz"}
        return rate_map.get(perf.speed, base_rate), pitch_map.get(perf.intensity, base_pitch)

    def _brand_text(self, text: str) -> str:
        return text.replace("NeerCred", "Neer Cred")

    async def synthesize_line(
        self,
        performance: VoicePerformance,
        voice_config: dict,
        out_path: Path,
    ) -> ProviderResult:
        if not self.is_configured():
            return ProviderResult(success=False, message="ALLOW_EDGE_TTS_PREVIEW not enabled")

        engine = voice_config.get("engine", "en-IN-NeerjaNeural")
        rate, pitch = self._rate_pitch(performance, voice_config)
        raw = out_path.with_suffix(".raw.mp3")

        # Insert micro-pauses via ellipsis for natural hesitation
        text = self._brand_text(performance.text)
        if performance.pauses_in_text:
            for phrase, pause in reversed(performance.pauses_in_text):
                dots = "..." if pause > 0.3 else ".."
                text = text.replace(phrase, f"{phrase}{dots}", 1)

        await edge_tts.Communicate(text, engine, rate=rate, pitch=pitch).save(str(raw))

        mature = voice_config.get("mature", False)
        af = (
            "highpass=f=85,lowpass=f=12200,"
            "equalizer=f=250:width_type=o:width=2:g=1.5,"
            "equalizer=f=2400:width_type=o:width=2:g=1.8,"
            "afftdn=nr=2:nf=-30,"
            "acompressor=threshold=-22dB:ratio=2.4:attack=10:release=140:makeup=2,"
        )
        if mature:
            af += "asetrate=44100*0.92,aresample=44100,"
        af += "aecho=0.82:0.86:16:0.04,loudnorm=I=-20:TP=-2:LRA=8"

        subprocess.run(
            ["ffmpeg", "-y", "-i", str(raw), "-af", af, "-ar", "44100", "-ac", "2", "-b:a", "256k", str(out_path)],
            check=True,
        )
        raw.unlink(missing_ok=True)
        return ProviderResult(
            success=True,
            path=out_path,
            metadata={"provider": self.name, "production_quality": False},
        )
