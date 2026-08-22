"""Local licensed/generated BGM from promo asset library."""

from __future__ import annotations

import subprocess
from pathlib import Path

from scripts.reel_engine.config import ASSETS_LIB, ProviderConfig
from scripts.reel_engine.providers.base import MusicProvider, ProviderResult

MOOD_FILES = {
    "silent": "silent-descent.mp3",
    "quiet": "silent-descent.mp3",
    "warm": "too_many_days_piano.mp3",
    "hope": "soft_morning_keys_piano.mp3",
    "uplift": "soft_morning_keys_piano.mp3",
}

MOOD_VOLUME = {
    "silent": 0.08,
    "quiet": 0.12,
    "warm": 0.22,
    "hope": 0.32,
    "uplift": 0.38,
}


class LocalMusicProvider(MusicProvider):
    name = "local"

    def __init__(self, cfg: ProviderConfig):
        self.cfg = cfg

    def is_configured(self) -> bool:
        return ASSETS_LIB.exists()

    def get_track(self, mood: str, duration: float, out_path: Path) -> ProviderResult:
        fname = MOOD_FILES.get(mood, MOOD_FILES["quiet"])
        src = ASSETS_LIB / fname
        if not src.exists():
            return ProviderResult(success=False, message=f"BGM file missing: {src}")
        vol = MOOD_VOLUME.get(mood, 0.2)
        subprocess.run(
            [
                "ffmpeg", "-y", "-stream_loop", "-1", "-i", str(src),
                "-t", f"{duration + 0.2:.3f}",
                "-af", f"highpass=f=70,lowpass=f=8500,volume={vol},"
                       f"afade=t=in:d=1.5,afade=t=out:st={max(0.1, duration - 1.2):.2f}:d=1.0",
                "-ar", "44100", "-ac", "2", str(out_path),
            ],
            check=True,
        )
        return ProviderResult(success=True, path=out_path, metadata={"mood": mood, "source": fname})
