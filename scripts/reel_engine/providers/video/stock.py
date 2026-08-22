"""Free photorealistic stock footage from Mixkit (no API key required)."""

from __future__ import annotations

import subprocess
from pathlib import Path

import httpx

from scripts.reel_engine.config import ProviderConfig, H, W, FPS
from scripts.reel_engine.models import SceneSpec
from scripts.reel_engine.providers.base import ProviderResult, VideoProvider

# Curated Mixkit clips — royalty-free, photorealistic, direct CDN URLs
# Format: https://assets.mixkit.co/videos/{id}/{id}-720.mp4
DEFAULT_STOCK_CLIPS: dict[str, dict] = {
    "phone-call": {
        "mixkit_id": 21297,
        "url": "https://assets.mixkit.co/videos/21297/21297-720.mp4",
        "note": "Woman on phone in kitchen, morning",
    },
    "son-notices": {
        "mixkit_id": 1081,
        "url": "https://assets.mixkit.co/videos/1081/1081-720.mp4",
        "note": "Young man fixing tie, getting ready",
    },
    "night-table": {
        "mixkit_id": 23075,
        "url": "https://assets.mixkit.co/videos/23075/23075-720.mp4",
        "note": "Couple worrying about bills at table",
    },
    "discovery": {
        "mixkit_id": 33608,
        "url": "https://assets.mixkit.co/videos/33608/33608-720.mp4",
        "note": "Mother and adult son, intimate moment",
    },
    "solution": {
        "mixkit_id": 4908,
        "url": "https://assets.mixkit.co/videos/4908/4908-720.mp4",
        "note": "Hands on phone at table — NeerCred overlay applied",
    },
    "payoff": {
        "mixkit_id": 52374,
        "url": "https://assets.mixkit.co/videos/52374/52374-720.mp4",
        "note": "Mother brings food to table, warm domestic",
    },
}

CACHE_DIR_NAME = "stock_cache"


class StockFootageVideoProvider(VideoProvider):
    """Downloads and processes royalty-free stock video. Photoreal, no generative API."""

    name = "stock"

    def __init__(self, cfg: ProviderConfig):
        self.cfg = cfg
        self.cache_dir = Path(__file__).resolve().parents[2] / ".work" / CACHE_DIR_NAME
        self.cache_dir.mkdir(parents=True, exist_ok=True)

    def is_configured(self) -> bool:
        return True  # Always available — uses free Mixkit CDN

    def is_photoreal(self) -> bool:
        return True

    def _download(self, url: str, dest: Path) -> bool:
        if dest.exists() and dest.stat().st_size > 10000:
            return True
        try:
            with httpx.Client(timeout=120.0, follow_redirects=True) as client:
                r = client.get(url)
                if r.status_code >= 400:
                    return False
                dest.write_bytes(r.content)
                return dest.stat().st_size > 10000
        except Exception:
            return False

    def _to_vertical_cinematic(self, src: Path, dest: Path, duration: float, mood: str) -> None:
        """Crop to 9:16, apply cinematic grade, trim/loop to exact duration."""
        grade = {
            "quiet": "eq=brightness=0.92:saturation=0.88:contrast=1.06",
            "warm": "eq=brightness=0.88:saturation=0.92:contrast=1.08",
            "hope": "eq=brightness=0.95:saturation=1.02:contrast=1.04",
            "uplift": "eq=brightness=1.0:saturation=1.05:contrast=1.02",
        }.get(mood, "eq=brightness=0.94:saturation=0.95:contrast=1.05")

        frames = int(duration * FPS)
        vf = (
            f"scale={W}:{H}:force_original_aspect_ratio=increase,"
            f"crop={W}:{H},"
            f"zoompan=z='min(zoom+0.0003,1.06)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':"
            f"d={frames}:s={W}x{H}:fps={FPS},"
            f"{grade},"
            f"unsharp=5:5:0.3:5:5:0.0"
        )
        subprocess.run(
            ["ffmpeg", "-y", "-stream_loop", "-1", "-i", str(src), "-vf", vf,
             "-t", f"{duration:.3f}",
             "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-an", str(dest)],
            check=True,
            capture_output=True,
        )

    def generate_shot(
        self,
        scene: SceneSpec,
        character_refs: dict[str, Path],
        out_path: Path,
        duration_sec: float,
    ) -> ProviderResult:
        clip_info = DEFAULT_STOCK_CLIPS.get(scene.id)
        if not clip_info:
            return ProviderResult(success=False, message=f"No stock clip mapped for scene '{scene.id}'")

        url = clip_info["url"]
        cached = self.cache_dir / f"mixkit_{clip_info['mixkit_id']}.mp4"
        if not self._download(url, cached):
            return ProviderResult(success=False, message=f"Failed to download stock footage: {url}")

        try:
            self._to_vertical_cinematic(cached, out_path, duration_sec, scene.mood)
            return ProviderResult(
                success=True,
                path=out_path,
                metadata={"provider": self.name, "source": "mixkit", "clip_id": clip_info["mixkit_id"]},
            )
        except Exception as e:
            return ProviderResult(success=False, message=str(e))
