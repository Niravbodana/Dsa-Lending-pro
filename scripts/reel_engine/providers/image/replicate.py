"""Replicate Flux character reference generator."""

from __future__ import annotations

import time
from pathlib import Path

import httpx

from scripts.reel_engine.config import ProviderConfig
from scripts.reel_engine.models import Character
from scripts.reel_engine.providers.base import ImageProvider, ProviderResult

DEFAULT_MODEL = "black-forest-labs/flux-1.1-pro"
API = "https://api.replicate.com/v1"


class ReplicateImageProvider(ImageProvider):
    name = "replicate"

    def __init__(self, cfg: ProviderConfig):
        self.cfg = cfg
        self.model = cfg.image_model or DEFAULT_MODEL

    def is_configured(self) -> bool:
        return bool(self.cfg.replicate_api_token)

    def _headers(self) -> dict[str, str]:
        return {"Authorization": f"Bearer {self.cfg.replicate_api_token}", "Content-Type": "application/json"}

    def generate_character_ref(self, character: Character, out_path: Path) -> ProviderResult:
        prompt = (
            f"Photorealistic character reference portrait, {character.reference_prompt}. "
            f"Wardrobe: {character.wardrobe}. "
            "Vertical 9:16 head-and-shoulders, neutral background, natural Indian skin texture, "
            "real photography, 85mm lens, soft natural light, no cartoon, no illustration."
        )
        try:
            with httpx.Client(timeout=120.0) as client:
                r = client.post(
                    f"{API}/models/{self.model}/predictions",
                    headers=self._headers(),
                    json={
                        "input": {
                            "prompt": prompt,
                            "aspect_ratio": "9:16",
                            "output_format": "png",
                            "negative_prompt": character.negative_prompt,
                        }
                    },
                )
                if r.status_code >= 400:
                    return ProviderResult(success=False, message=f"Replicate image error: {r.text[:400]}")
                pred = r.json()
                pred_id = pred["id"]
                status = pred.get("status")
                for _ in range(120):
                    if status in ("succeeded", "failed", "canceled"):
                        break
                    time.sleep(3)
                    pr = client.get(f"{API}/predictions/{pred_id}", headers=self._headers())
                    pred = pr.json()
                    status = pred.get("status")
                if status != "succeeded":
                    return ProviderResult(success=False, message=f"Image prediction {status}")
                output = pred.get("output")
                url = output if isinstance(output, str) else (output[0] if output else None)
                if not url:
                    return ProviderResult(success=False, message="No image URL")
                img = client.get(url)
                out_path.write_bytes(img.content)
                return ProviderResult(success=True, path=out_path, metadata={"character": character.id})
        except Exception as e:
            return ProviderResult(success=False, message=str(e))
