"""Curated image search for Site Builder — maps queries to safe local/HTTPS URLs."""

from __future__ import annotations

import re

# Expandable catalog — all URLs verified safe (local or unsplash)
IMAGE_CATALOG: dict[str, list[dict[str, str]]] = {
    "wedding": [
        {"url": "/images/site/1519741497674-611481863552-600x400.jpg", "label": "Indian wedding couple"},
        {"url": "/hero-wedding-couple.png", "label": "Wedding couple with tablet"},
        {"url": "/images/site/1529156069898-49953e39b3ac-1920x600.jpg", "label": "Celebration party"},
    ],
    "home": [
        {"url": "/images/site/1560518883-ce09059eeffa-600x400.jpg", "label": "Dream home keys"},
        {"url": "/images/site/1511895426328-dc8714191300-900x600.jpg", "label": "Family at home"},
    ],
    "business": [
        {"url": "/images/site/1551836022-d5d88e9218df-600x400.jpg", "label": "Business owner"},
        {"url": "/images/site/1576091160550-2173dba999ef-600x400.jpg", "label": "Medical clinic"},
    ],
    "medical": [
        {"url": "/images/site/1576091160550-2173dba999ef-600x400.jpg", "label": "Healthcare"},
        {"url": "/images/site/1551836022-d5d88e9218df-600x400.jpg", "label": "Professional"},
    ],
    "travel": [
        {"url": "/images/site/1488646953014-85cb44e25828-600x400.jpg", "label": "Travel adventure"},
        {"url": "/images/site/1529156069898-49953e39b3ac-400x300.jpg", "label": "Friends travel"},
    ],
    "family": [
        {"url": "/images/site/1511895426328-dc8714191300-900x600.jpg", "label": "Happy family"},
        {"url": "/images/site/1511763508683-99dc7949e97f-900x600.jpg", "label": "Family moment"},
    ],
    "professional": [
        {"url": "/images/site/1463335361701-e90f4c5045d0-600x750.jpg", "label": "Professional woman"},
        {"url": "/images/site/1463335361701-e90f4c5045d0-600x400.jpg", "label": "Customer portrait"},
    ],
    "couple": [
        {"url": "/hero-wedding-couple.png", "label": "Wedding couple hero"},
        {"url": "/images/site/1519741497674-611481863552-600x400.jpg", "label": "Wedding scene"},
    ],
    "loan": [
        {"url": "/images/site/1463335361701-e90f4c5045d0-600x750.jpg", "label": "Happy borrower"},
        {"url": "/images/site/1512941937669-90a1b58e7e9c-900x600.jpg", "label": "Mobile banking"},
    ],
    "celebration": [
        {"url": "/images/site/1529156069898-49953e39b3ac-1920x600.jpg", "label": "Celebration"},
        {"url": "/images/site/1570168007204-dfb528c6958f-400x300.jpg", "label": "Festival lights"},
    ],
}

_ALIASES = {
    "shaadi": "wedding",
    "marriage": "wedding",
    "ghar": "home",
    "house": "home",
    "dukan": "business",
    "shop": "business",
    "doctor": "medical",
    "hospital": "medical",
    "trip": "travel",
    "parivar": "family",
    "customer": "professional",
    "jodi": "couple",
}


def search_images(query: str, limit: int = 6) -> list[dict[str, str]]:
    """Return ranked image options for a natural-language query."""
    q = re.sub(r"\s+", " ", query.lower().strip())
    if not q:
        return []

    for alias, key in _ALIASES.items():
        if alias in q:
            q = f"{q} {key}"

    scored: list[tuple[int, dict[str, str]]] = []
    seen_urls: set[str] = set()

    for key, items in IMAGE_CATALOG.items():
        key_score = 2 if key in q else 0
        for item in items:
            if item["url"] in seen_urls:
                continue
            label_score = 1 if any(w in item["label"].lower() for w in q.split() if len(w) > 3) else 0
            total = key_score + label_score
            if total > 0 or not q:
                scored.append((total, item))
                seen_urls.add(item["url"])

    scored.sort(key=lambda x: -x[0])
    results = [item for _, item in scored[:limit]]

    if not results:
        # fallback: return wedding + professional mix
        for key in ("wedding", "professional", "family"):
            for item in IMAGE_CATALOG.get(key, [])[:1]:
                if item["url"] not in seen_urls:
                    results.append(item)
                    seen_urls.add(item["url"])
                if len(results) >= limit:
                    break

    return results[:limit]


def image_by_index(query_results: list[dict[str, str]], index: int) -> str | None:
    if 1 <= index <= len(query_results):
        return query_results[index - 1]["url"]
    return None
