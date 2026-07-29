"""In-memory sliding-window rate limiter (per-process). Use Redis in multi-instance prod."""

from __future__ import annotations

from collections import defaultdict
from datetime import datetime, timedelta, timezone
from threading import Lock

from fastapi import HTTPException, Request

_lock = Lock()
_hits: dict[str, list[datetime]] = defaultdict(list)


def _client_ip(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"


def rate_limit(request: Request, *, key: str, max_hits: int, window_seconds: int) -> None:
    """Raise HTTP 429 if key exceeds max_hits within window_seconds."""
    ip = _client_ip(request)
    bucket = f"{key}:{ip}"
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(seconds=window_seconds)

    with _lock:
        _hits[bucket] = [t for t in _hits[bucket] if t > cutoff]
        if len(_hits[bucket]) >= max_hits:
            raise HTTPException(
                status_code=429,
                detail="Too many requests. Please wait and try again.",
            )
        _hits[bucket].append(now)


def rate_limit_key(key: str, *, max_hits: int, window_seconds: int) -> None:
    """Rate limit without Request (e.g. mobile-only keys)."""
    now = datetime.now(timezone.utc)
    cutoff = now - timedelta(seconds=window_seconds)

    with _lock:
        _hits[key] = [t for t in _hits[key] if t > cutoff]
        if len(_hits[key]) >= max_hits:
            raise HTTPException(
                status_code=429,
                detail="Too many requests. Please wait and try again.",
            )
        _hits[key].append(now)
