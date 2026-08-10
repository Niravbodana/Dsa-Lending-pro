"""Provider base classes and registry."""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass
from pathlib import Path
from typing import Any

from scripts.reel_engine.config import ProviderConfig
from scripts.reel_engine.models import Character, SceneSpec, VoicePerformance


@dataclass
class ProviderResult:
    success: bool
    path: Path | None = None
    message: str = ""
    metadata: dict[str, Any] | None = None


class VideoProvider(ABC):
    name: str = "base"

    @abstractmethod
    def is_configured(self) -> bool: ...

    @abstractmethod
    def generate_shot(
        self,
        scene: SceneSpec,
        character_refs: dict[str, Path],
        out_path: Path,
        duration_sec: float,
    ) -> ProviderResult: ...


class VoiceProvider(ABC):
    name: str = "base"

    @abstractmethod
    def is_configured(self) -> bool: ...

    @abstractmethod
    def is_production_quality(self) -> bool: ...

    @abstractmethod
    async def synthesize_line(
        self,
        performance: VoicePerformance,
        voice_config: dict[str, Any],
        out_path: Path,
    ) -> ProviderResult: ...


class ImageProvider(ABC):
    name: str = "base"

    @abstractmethod
    def is_configured(self) -> bool: ...

    @abstractmethod
    def generate_character_ref(self, character: Character, out_path: Path) -> ProviderResult: ...


class LipSyncProvider(ABC):
    name: str = "base"

    @abstractmethod
    def is_configured(self) -> bool: ...

    @abstractmethod
    def sync(
        self,
        video_path: Path,
        audio_path: Path,
        out_path: Path,
    ) -> ProviderResult: ...


class MusicProvider(ABC):
    name: str = "base"

    @abstractmethod
    def is_configured(self) -> bool: ...

    @abstractmethod
    def get_track(self, mood: str, duration: float, out_path: Path) -> ProviderResult: ...


def get_video_provider(cfg: ProviderConfig) -> VideoProvider:
    from scripts.reel_engine.providers.video.unavailable import UnavailableVideoProvider
    from scripts.reel_engine.providers.video.replicate import ReplicateVideoProvider
    from scripts.reel_engine.providers.video.runway import RunwayVideoProvider
    from scripts.reel_engine.providers.video.fal import FalVideoProvider

    mapping = {
        "replicate": ReplicateVideoProvider(cfg),
        "runway": RunwayVideoProvider(cfg),
        "fal": FalVideoProvider(cfg),
    }
    p = mapping.get(cfg.video_provider)
    if p and p.is_configured():
        return p
    return UnavailableVideoProvider(cfg)


def get_voice_provider(cfg: ProviderConfig) -> VoiceProvider:
    from scripts.reel_engine.providers.voice.elevenlabs import ElevenLabsVoiceProvider
    from scripts.reel_engine.providers.voice.edge_performance import EdgePerformanceVoiceProvider
    from scripts.reel_engine.providers.voice.unavailable import UnavailableVoiceProvider

    if cfg.voice_provider == "elevenlabs":
        p = ElevenLabsVoiceProvider(cfg)
        if p.is_configured():
            return p
    if cfg.voice_provider == "edge_performance" or cfg.allow_edge_tts_preview:
        p = EdgePerformanceVoiceProvider(cfg)
        if p.is_configured():
            return p
    return UnavailableVoiceProvider(cfg)


def get_image_provider(cfg: ProviderConfig) -> ImageProvider:
    from scripts.reel_engine.providers.image.replicate import ReplicateImageProvider
    from scripts.reel_engine.providers.image.unavailable import UnavailableImageProvider

    if cfg.image_provider == "replicate":
        p = ReplicateImageProvider(cfg)
        if p.is_configured():
            return p
    return UnavailableImageProvider(cfg)


def get_lipsync_provider(cfg: ProviderConfig) -> LipSyncProvider:
    from scripts.reel_engine.providers.lipsync.unavailable import UnavailableLipSyncProvider

    return UnavailableLipSyncProvider(cfg)


def get_music_provider(cfg: ProviderConfig) -> MusicProvider:
    from scripts.reel_engine.providers.music.local import LocalMusicProvider

    return LocalMusicProvider(cfg)
