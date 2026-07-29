"""LLM-powered Site Builder — natural-language edits via OpenAI-compatible APIs."""

from __future__ import annotations

import json
import logging
import re
from typing import Any

import httpx

from app.config import settings
from app.services.cms_path_discovery import paths_for_llm_prompt
from app.services.cms_defaults import DEFAULT_SITE_CONFIG
from app.services.cms_store import deep_merge
from app.services.url_safety import is_safe_https_image_url

logger = logging.getLogger(__name__)

THEME_KEYS = ("glass-blue", "glass-white", "navy-premium", "teal-fresh")

SYSTEM_PROMPT = """You are Site Builder AI for NeerCred (Neer Loan Solutions) — an Indian personal loan marketplace.
Admin sends natural-language edit requests (English or Hinglish). You return JSON only — no markdown.

Workflow: changes go to PREVIEW draft first. Never say the site is live until admin publishes.

Site config schema (partial updates allowed):
{
  "hero": {
    "badge", "headline_line1", "headline_highlight", "headline_sub", "description",
    "bullet_points": [strings], "cta_primary", "cta_secondary", "image_url",
    "testimonial_quote", "testimonial_author", "approval_card_label", "approval_card_amount",
    "roi_badge" (e.g. "9.99%"), "roi_badge_label"
  },
  "stats": [{"value": "₹10L+", "label": "Max Loan"}, ...]  // 4 items typical
  "urgency_bar": {"enabled": bool, "text", "emoji"},
  "promo_strip": {"enabled": bool, "text", "highlight"},
  "dream_section": {"title", "subtitle", "cards": [{"title","desc","image","cta"}]},
  "trust_band": {"tagline", "features": [strings]},
  "metrics_ticker": [{"value","label"}],
  "testimonials_section": {"badge","title","title_highlight","subtitle","items":[...]},
  "faq_section": {"title","title_highlight","subtitle","items":[{"q","a"}]},
  "cta_band": {"badge","title","title_highlight","subtitle","image","cta_primary","cta_secondary"},
  "how_it_works": {"title","subtitle","steps":[{"title","desc"}]},
  "loan_products": {"title","cards":[{"title","rate","image"}]},
  "theme": {
    "background": "glass-blue"|"glass-white"|"navy-gradient"|"teal-mist",
    "accent": "teal"|"gold", "hero_overlay": "sky-glass"|"white-glass"|"navy"|"mint-glass",
    "glass_intensity": "high"|"medium"|"low", "hero_background": local path or HTTPS image
  },
  "sections": {
    "urgency_bar", "promo_strip", "dream_section", "metrics_ticker",
    "emi_calculator", "testimonials", "cta_band", "faq", "how_it_works", "loan_products": bool each
  }
}

Image rules:
- Prefer local paths: /images/site/..., /hero-wedding-couple.png
- Wedding/couple → /hero-wedding-couple.png or /images/site/1519741497674-611481863552-600x400.jpg
- HTTPS only from images.unsplash.com, images.pexels.com, cdn.pixabay.com

Theme presets:
- glass-blue: premium light blue glass (default premium look)
- glass-white: clean white glass
- navy-premium: dark navy + gold accent
- teal-fresh: teal mist

Special actions (use instead of patch when needed):
- "publish" / "discard" / "reset" / "search_images"
- search_images needs image_query string

Respond with ONLY valid JSON:
{
  "reply": "friendly Hinglish/English summary of what you changed (use 👁️ Preview prefix)",
  "patch": { } or null,
  "changes": ["hero.headline_highlight", ...],
  "action": null | "publish" | "discard" | "reset" | "search_images",
  "image_query": null | "wedding couple"
}

If user asks a question without edits, patch=null and answer in reply.
If unsure, make reasonable creative choices for a premium Indian loan site.

All editable dot-paths (auto-discovered — new CMS fields appear here automatically):
{{CMS_PATHS}}
"""


def _system_prompt(config: dict | None = None) -> str:
    base = DEFAULT_SITE_CONFIG if config is None else config
    paths = paths_for_llm_prompt(base)
    return SYSTEM_PROMPT.replace("{{CMS_PATHS}}", paths)


def is_llm_available() -> bool:
    return bool(settings.cms_llm_enabled and settings.openai_api_key)


def _extract_json(text: str) -> dict | None:
    text = text.strip()
    if text.startswith("```"):
        text = re.sub(r"^```(?:json)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        m = re.search(r"\{[\s\S]*\}", text)
        if m:
            try:
                return json.loads(m.group(0))
            except json.JSONDecodeError:
                return None
    return None


def _sanitize_patch(patch: dict[str, Any]) -> tuple[dict[str, Any], list[str]]:
    """Strip unsafe URLs and invalid values from LLM patch."""
    changes: list[str] = []
    cleaned = json.loads(json.dumps(patch))

    def walk(obj: Any, path: str) -> Any:
        if isinstance(obj, dict):
            return {k: walk(v, f"{path}.{k}" if path else k) for k, v in obj.items()}
        if isinstance(obj, list):
            return [walk(item, f"{path}[]") for item in obj]
        if isinstance(obj, str) and (
            path.endswith("image_url") or path.endswith("image") or path.endswith("hero_background")
        ):
            if obj.startswith("http") and not is_safe_https_image_url(obj):
                changes.append(f"skipped unsafe URL at {path}")
                return None
            if obj.startswith("/") or obj.startswith("http"):
                changes.append(path)
        return obj

    result = walk(cleaned, "")
    if isinstance(result, dict):
        return result, changes
    return {}, changes


def _sync_roi_stats(config: dict) -> None:
    roi = config.get("hero", {}).get("roi_badge")
    stats = config.get("stats")
    if roi and isinstance(stats, list) and len(stats) > 1:
        stats[1]["value"] = roi


def process_llm_prompt(
    message: str,
    config: dict,
    *,
    history: list[dict[str, str]] | None = None,
) -> tuple[dict, str, list[str], str | None, str | None] | None:
    """
    Returns (updated_config, reply, changes, action, image_query) or None if LLM unavailable/failed.
    action: publish | discard | reset | search_images
    """
    if not is_llm_available():
        return None

    messages: list[dict[str, str]] = [{"role": "system", "content": _system_prompt(config)}]
    if history:
        for item in history[-8:]:
            role = item.get("role", "user")
            if role not in ("user", "assistant"):
                continue
            content = (item.get("content") or item.get("text") or "").strip()
            if content:
                messages.append({"role": role, "content": content[:2000]})

    snapshot = {
        "hero": config.get("hero", {}),
        "stats": config.get("stats", []),
        "theme": config.get("theme", {}),
        "sections": config.get("sections", {}),
        "urgency_bar": config.get("urgency_bar", {}),
        "promo_strip": config.get("promo_strip", {}),
        "dream_section": {
            "title": config.get("dream_section", {}).get("title"),
            "subtitle": config.get("dream_section", {}).get("subtitle"),
        },
    }
    messages.append(
        {
            "role": "user",
            "content": f"Current site snapshot:\n{json.dumps(snapshot, ensure_ascii=False)}\n\nAdmin request: {message}",
        }
    )

    base_url = settings.openai_base_url.rstrip("/")
    url = f"{base_url}/chat/completions"
    headers = {
        "Authorization": f"Bearer {settings.openai_api_key}",
        "Content-Type": "application/json",
    }
    body = {
        "model": settings.cms_llm_model,
        "messages": messages,
        "temperature": 0.35,
        "response_format": {"type": "json_object"},
    }

    try:
        with httpx.Client(timeout=45.0) as client:
            res = client.post(url, headers=headers, json=body)
            res.raise_for_status()
            data = res.json()
        content = data["choices"][0]["message"]["content"]
        parsed = _extract_json(content)
        if not parsed:
            logger.warning("CMS LLM returned non-JSON: %s", content[:200])
            return None
    except Exception as exc:
        logger.warning("CMS LLM call failed: %s", exc)
        return None

    reply = str(parsed.get("reply") or "👁️ Preview updated.")
    action = parsed.get("action")
    image_query = parsed.get("image_query")
    llm_changes = [str(c) for c in (parsed.get("changes") or []) if c]

    if action in ("publish", "discard", "reset", "search_images"):
        return config, reply, llm_changes, action, image_query

    patch = parsed.get("patch")
    if not patch or not isinstance(patch, dict):
        return config, reply, llm_changes, None, None

    safe_patch, url_changes = _sanitize_patch(patch)
    updated = deep_merge(config, safe_patch)
    _sync_roi_stats(updated)

    changes = llm_changes or url_changes
    if not changes and safe_patch:
        changes = ["config updated via AI prompt"]

    if not reply.startswith("👁️") and changes:
        reply = f"👁️ **Preview** — {reply}"

    return updated, reply, changes, None, image_query
