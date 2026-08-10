"""Environment-driven provider configuration for the cinematic reel engine."""

from __future__ import annotations

import os
from dataclasses import dataclass, field
from pathlib import Path

from dotenv import load_dotenv

ROOT = Path(__file__).resolve().parents[2]
OUTPUT_DIR = ROOT / "output"
WORK_DIR = ROOT / "scripts" / "reel_engine" / ".work"
ASSETS_LIB = Path("/opt/cursor/artifacts/neercred-promo-video/assets")
BRAND_DIR = ROOT / "frontend" / "public" / "brand"
SCREENS_DIR = Path("/opt/cursor/artifacts/neercred-promo-video/screenshots")

# Load backend .env and optional reel-specific overrides
load_dotenv(ROOT / "backend" / ".env")
load_dotenv(ROOT / "scripts" / "reel_engine" / ".env", override=False)

W, H = 1080, 1920
FPS = 30
TARGET_DURATION = (40, 45)


@dataclass
class ProviderConfig:
    video_provider: str = field(default_factory=lambda: os.getenv("VIDEO_PROVIDER", "stock").strip().lower())
    voice_provider: str = field(default_factory=lambda: os.getenv("VOICE_PROVIDER", "piper").strip().lower())
    lipsync_provider: str = field(default_factory=lambda: os.getenv("LIPSYNC_PROVIDER", "").strip().lower())
    image_provider: str = field(default_factory=lambda: os.getenv("IMAGE_PROVIDER", "stock").strip().lower())
    music_provider: str = field(default_factory=lambda: os.getenv("MUSIC_PROVIDER", "local").strip().lower())

    # API keys / endpoints
    replicate_api_token: str = field(default_factory=lambda: os.getenv("REPLICATE_API_TOKEN", "").strip())
    runway_api_key: str = field(default_factory=lambda: os.getenv("RUNWAY_API_KEY", "").strip())
    fal_api_key: str = field(default_factory=lambda: os.getenv("FAL_KEY", os.getenv("FAL_API_KEY", "")).strip())
    elevenlabs_api_key: str = field(default_factory=lambda: os.getenv("ELEVENLABS_API_KEY", "").strip())
    sync_labs_api_key: str = field(default_factory=lambda: os.getenv("SYNC_LABS_API_KEY", "").strip())

    # Model overrides
    video_model: str = field(default_factory=lambda: os.getenv("VIDEO_MODEL", "").strip())
    image_model: str = field(default_factory=lambda: os.getenv("IMAGE_MODEL", "").strip())

    # Voice IDs (ElevenLabs)
    voice_id_mother: str = field(default_factory=lambda: os.getenv("VOICE_ID_MOTHER", "").strip())
    voice_id_son: str = field(default_factory=lambda: os.getenv("VOICE_ID_SON", "").strip())
    voice_id_narrator: str = field(default_factory=lambda: os.getenv("VOICE_ID_NARRATOR", "").strip())

    allow_edge_tts_preview: bool = field(
        default_factory=lambda: os.getenv("ALLOW_EDGE_TTS_PREVIEW", "false").lower() in ("1", "true", "yes")
    )

    def configured_providers(self) -> dict[str, bool]:
        return {
            "video": self._video_ready(),
            "voice": self._voice_ready(),
            "lipsync": bool(self.lipsync_provider and self.sync_labs_api_key),
            "image": self._image_ready(),
            "music": self.music_provider == "local" or bool(self.music_provider),
        }

    def _video_ready(self) -> bool:
        if not self.video_provider:
            return False
        if self.video_provider == "stock":
            return True
        if self.video_provider == "replicate":
            return bool(self.replicate_api_token)
        if self.video_provider == "runway":
            return bool(self.runway_api_key)
        if self.video_provider == "fal":
            return bool(self.fal_api_key)
        return False

    def _voice_ready(self) -> bool:
        if self.voice_provider == "piper":
            return True
        if self.voice_provider == "elevenlabs":
            return bool(self.elevenlabs_api_key)
        if self.voice_provider == "edge_performance":
            return self.allow_edge_tts_preview
        return False

    def _image_ready(self) -> bool:
        if not self.image_provider:
            return False
        if self.image_provider == "stock":
            return True
        if self.image_provider == "replicate":
            return bool(self.replicate_api_token)
        if self.image_provider == "fal":
            return bool(self.fal_api_key)
        return False

    def is_stock_mode(self) -> bool:
        return self.video_provider == "stock"

    def missing_for_photoreal(self) -> list[str]:
        """Returns gaps only when neither stock nor paid generative providers are ready."""
        if self.is_stock_mode() and self._voice_ready():
            return []  # Stock + Piper is the no-API production path
        missing: list[str] = []
        if not self._video_ready():
            missing.append(
                "VIDEO_PROVIDER (stock|replicate|runway|fal). "
                "Default 'stock' uses free Mixkit footage. Ken Burns is disabled."
            )
        if not self._voice_ready():
            missing.append(
                "VOICE_PROVIDER (piper|elevenlabs). Default 'piper' is local neural TTS."
            )
        if not self._image_ready():
            missing.append("IMAGE_PROVIDER (stock|replicate|fal).")
        return missing


def ensure_dirs(project_id: str) -> dict[str, Path]:
    base = WORK_DIR / project_id
    paths = {
        "work": base,
        "characters": base / "characters",
        "scenes": base / "scenes",
        "audio": base / "audio",
        "video": base / "video",
        "subs": base / "subtitles",
        "qc": base / "qc",
        "output": OUTPUT_DIR,
    }
    for p in paths.values():
        p.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    return paths
