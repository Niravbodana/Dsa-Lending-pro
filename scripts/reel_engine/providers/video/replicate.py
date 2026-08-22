"""Replicate image-to-video provider (Kling / Minimax / configurable model)."""

from __future__ import annotations

import json
import time
from pathlib import Path

import httpx

from scripts.reel_engine.config import ProviderConfig
from scripts.reel_engine.models import SceneSpec
from scripts.reel_engine.providers.base import ProviderResult, VideoProvider

DEFAULT_MODEL = "minimax/video-01"
API = "https://api.replicate.com/v1"


class ReplicateVideoProvider(VideoProvider):
    name = "replicate"

    def __init__(self, cfg: ProviderConfig):
        self.cfg = cfg
        self.model = cfg.video_model or DEFAULT_MODEL

    def is_configured(self) -> bool:
        return bool(self.cfg.replicate_api_token)

    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.cfg.replicate_api_token}",
            "Content-Type": "application/json",
        }

    def generate_shot(
        self,
        scene: SceneSpec,
        character_refs: dict[str, Path],
        out_path: Path,
        duration_sec: float,
    ) -> ProviderResult:
        if not self.is_configured():
            return ProviderResult(success=False, message="REPLICATE_API_TOKEN not configured")

        # Use first character ref as start frame if available
        image_url = None
        for cid in scene.characters:
            ref = character_refs.get(cid)
            if ref and ref.exists():
                # Replicate accepts data URLs or hosted URLs; upload via prediction input file
                image_url = str(ref)
                break

        prompt = (
            f"{scene.visual_prompt} "
            f"Shot on {scene.cinematography.lens} lens, {scene.cinematography.shot_type}, "
            f"{scene.cinematography.camera_movement}. "
            f"Vertical 9:16 composition, photorealistic Indian short film, natural skin, "
            f"cinematic lighting, no cartoon, no illustration."
        )

        payload: dict = {
            "input": {
                "prompt": prompt,
                "duration": min(10, max(3, int(duration_sec))),
                "aspect_ratio": "9:16",
            }
        }
        if image_url:
            payload["input"]["first_frame_image"] = open(image_url, "rb")  # noqa: SIM115

        try:
            with httpx.Client(timeout=120.0) as client:
                # Create prediction via models endpoint
                r = client.post(
                    f"{API}/models/{self.model}/predictions",
                    headers=self._headers(),
                    json={"input": {
                        "prompt": prompt,
                        "duration": min(10, max(3, int(duration_sec))),
                        "aspect_ratio": "9:16",
                        **({"image": image_url} if image_url else {}),
                    }},
                )
                if r.status_code >= 400:
                    return ProviderResult(success=False, message=f"Replicate error: {r.text[:500]}")
                pred = r.json()
                pred_id = pred["id"]
                status = pred.get("status")
                for _ in range(180):
                    if status in ("succeeded", "failed", "canceled"):
                        break
                    time.sleep(5)
                    pr = client.get(f"{API}/predictions/{pred_id}", headers=self._headers())
                    pred = pr.json()
                    status = pred.get("status")

                if status != "succeeded":
                    return ProviderResult(success=False, message=f"Replicate prediction {status}: {pred.get('error')}")

                output = pred.get("output")
                url = output if isinstance(output, str) else (output[0] if output else None)
                if not url:
                    return ProviderResult(success=False, message="No output URL from Replicate")

                vid = client.get(url)
                out_path.write_bytes(vid.content)
                return ProviderResult(success=True, path=out_path, metadata={"provider": self.name, "model": self.model})
        except Exception as e:
            return ProviderResult(success=False, message=str(e))
