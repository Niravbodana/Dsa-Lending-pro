"""Local Piper neural TTS — free, offline, no API key."""

from __future__ import annotations

import subprocess
import wave
from pathlib import Path

from piper import PiperVoice
from piper.config import SynthesisConfig

from scripts.reel_engine.config import ProviderConfig
from scripts.reel_engine.models import VoicePerformance
from scripts.reel_engine.providers.base import ProviderResult, VoiceProvider

VOICES_DIR = Path(__file__).resolve().parents[2] / ".voices"

# Mother: softer female voice with post-processing
# Son: male British voice
# Narrator: slower female
VOICE_MAP = {
    "mother": ("en_US-lessac-medium", {"length_scale": 1.08, "noise_scale": 0.667, "noise_w_scale": 0.8}),
    "son": ("en_GB-alan-medium", {"length_scale": 1.0, "noise_scale": 0.667, "noise_w_scale": 0.8}),
    "narrator": ("en_US-lessac-medium", {"length_scale": 1.18, "noise_scale": 0.5, "noise_w_scale": 0.7}),
}


class PiperVoiceProvider(VoiceProvider):
    """Local neural TTS via Piper. Production-quality for no-API workflow."""

    name = "piper"

    def __init__(self, cfg: ProviderConfig):
        self.cfg = cfg
        self._cache: dict[str, PiperVoice] = {}

    def is_configured(self) -> bool:
        return VOICES_DIR.exists() and any(VOICES_DIR.glob("*.onnx"))

    def is_production_quality(self) -> bool:
        return True  # Local neural TTS — acceptable for no-API production tier

    def _get_voice(self, speaker: str) -> tuple[PiperVoice, SynthesisConfig]:
        model_name, syn_params = VOICE_MAP.get(speaker, VOICE_MAP["son"])
        if model_name not in self._cache:
            model_path = VOICES_DIR / f"{model_name}.onnx"
            config_path = VOICES_DIR / f"{model_name}.onnx.json"
            self._cache[model_name] = PiperVoice.load(str(model_path), config_path=str(config_path))
        perf = VoicePerformance(speaker=speaker, text="", emotional_state="neutral")
        # Adjust length_scale by performance speed
        return self._cache[model_name], SynthesisConfig(**syn_params)

    def _performance_scale(self, perf: VoicePerformance, base: SynthesisConfig) -> SynthesisConfig:
        scale = base.length_scale
        if perf.speed == "slow":
            scale *= 1.12
        elif perf.speed == "slightly_fast":
            scale *= 0.92
        if perf.intensity == "whisper":
            scale *= 1.05
        return SynthesisConfig(
            length_scale=scale,
            noise_scale=base.noise_scale,
            noise_w_scale=base.noise_w_scale,
        )

    def _insert_pauses(self, text: str, perf: VoicePerformance) -> str:
        for phrase, pause in reversed(perf.pauses_in_text):
            dots = "..." if pause > 0.35 else ".."
            text = text.replace(phrase, f"{phrase}{dots}", 1)
        return text.replace("NeerCred", "Neer Cred")

    async def synthesize_line(
        self,
        performance: VoicePerformance,
        voice_config: dict,
        out_path: Path,
    ) -> ProviderResult:
        if not self.is_configured():
            return ProviderResult(
                success=False,
                message="Piper voices not installed. Run: python -m piper.download_voices --download-dir scripts/reel_engine/.voices en_US-lessac-medium en_GB-alan-medium",
            )

        voice, base_syn = self._get_voice(performance.speaker)
        syn = self._performance_scale(performance, base_syn)
        text = self._insert_pauses(performance.text, performance)

        raw_wav = out_path.with_suffix(".raw.wav")
        try:
            with wave.open(str(raw_wav), "wb") as wf:
                voice.synthesize_wav(text, wf, syn_config=syn)

            # Post-process: EQ, compression, mature tone for mother
            af = "highpass=f=90,lowpass=f=12000,acompressor=threshold=-20dB:ratio=2.5:attack=8:release=120:makeup=2"
            if performance.speaker == "mother":
                af += ",asetrate=44100*0.94,aresample=44100,equalizer=f=300:width_type=o:width=2:g=2"
            elif performance.speaker == "son":
                af += ",equalizer=f=2000:width_type=o:width=2:g=1.5"
            af += ",loudnorm=I=-20:TP=-2:LRA=8"

            subprocess.run(
                ["ffmpeg", "-y", "-i", str(raw_wav), "-af", af, "-ar", "44100", "-ac", "2", str(out_path.with_suffix(".wav"))],
                check=True,
                capture_output=True,
            )
            # Convert to mp3 for pipeline compatibility
            subprocess.run(
                ["ffmpeg", "-y", "-i", str(out_path.with_suffix(".wav")), "-b:a", "256k", str(out_path)],
                check=True,
                capture_output=True,
            )
            raw_wav.unlink(missing_ok=True)
            out_path.with_suffix(".wav").unlink(missing_ok=True)
            return ProviderResult(success=True, path=out_path, metadata={"provider": self.name})
        except Exception as e:
            return ProviderResult(success=False, message=str(e))
