"""Resolve legacy local CMS image paths to live HTTPS URLs."""

from __future__ import annotations

import re
from typing import Any

SITE_IMAGE_RE = re.compile(
    r"^/images/site/(\d+)-([a-f0-9]+)(?:-(\d+)x(\d+))?\.(?:jpg|jpeg|webp)$",
    re.IGNORECASE,
)

HERO_WEDDING_FALLBACK = (
    "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&w=2400&q=95&fit=crop"
)


def resolve_image_url(url: str | None) -> str:
    """Map `/images/site/...` and other legacy paths to Unsplash CDN URLs."""
    if not url or not isinstance(url, str):
        return url or ""
    trimmed = url.strip()
    if not trimmed:
        return ""
    if trimmed.startswith("http://") or trimmed.startswith("https://"):
        return trimmed

    match = SITE_IMAGE_RE.match(trimmed)
    if match:
        ts, hash_part, width, height = match.groups()
        w = width or "600"
        h = height or "400"
        return f"https://images.unsplash.com/photo-{ts}-{hash_part}?w={w}&h={h}&fit=crop"

    if "hero-wedding-couple" in trimmed:
        return HERO_WEDDING_FALLBACK

    return trimmed


def resolve_config_images(config: dict[str, Any]) -> dict[str, Any]:
    """Walk CMS config and resolve image-like string values."""

    def walk(value: Any, key: str | None = None) -> Any:
        if isinstance(value, str):
            if key in {"image", "image_url", "hero_background"} or key == "images" or "/images/" in value:
                return resolve_image_url(value)
            return value
        if isinstance(value, list):
            if key == "images":
                return [resolve_image_url(item) if isinstance(item, str) else walk(item) for item in value]
            return [walk(item) for item in value]
        if isinstance(value, dict):
            return {k: walk(v, k) for k, v in value.items()}
        return value

    return walk(config)
