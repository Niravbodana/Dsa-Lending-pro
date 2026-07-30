"""Smart local prompt engine — natural language edits without an external LLM."""

from __future__ import annotations

import copy
import re
from typing import Any

from app.services.cms_assistant import PRESET_IMAGES, process_cms_command
from app.services.cms_store import deep_merge
from app.services.cms_themes import THEME_PRESETS
from app.services.url_safety import is_safe_https_image_url

SPLIT_RE = re.compile(
    r"\s+(?:aur|and|also|plus|then|phir|fir|,\s*then|;\s*|\.)\s+",
    re.IGNORECASE,
)

THEME_HINTS: list[tuple[tuple[str, ...], str]] = [
    (("glass blue", "light blue", "premium glass", "blue glass", "sky glass"), "glass-blue"),
    (("white glass", "clean white", "minimal"), "glass-white"),
    (("navy", "dark theme", "premium dark"), "navy-premium"),
    (("teal", "fresh", "mint"), "teal-fresh"),
    (("premium", "luxury", "classy"), "glass-blue"),
]

PHOTO_HINTS: list[tuple[tuple[str, ...], str]] = [
    (("wedding", "shaadi", "couple", "bride", "dulhan"), "wedding"),
    (("home", "ghar", "house", "property"), "home"),
    (("business", "shop", "startup", "vyapar"), "business"),
    (("medical", "hospital", "health"), "medical"),
    (("travel", "holiday", "vacation"), "travel"),
    (("family", "parivar"), "family"),
    (("professional", "office", "corporate"), "professional"),
]


def _norm(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower().strip())


def _extract_quoted(raw: str) -> list[str]:
    return re.findall(r'["\']([^"\']+)["\']', raw)


def _extract_url(raw: str) -> str | None:
    m = re.search(r"(https?://\S+)", raw)
    if m:
        return m.group(1).rstrip(".,)")
    m = re.search(r"(/images/\S+|/hero\S*)", raw)
    return m.group(1) if m else None


def _apply_theme(config: dict, key: str) -> tuple[dict, str]:
    preset = THEME_PRESETS.get(key)
    if not preset:
        return config, ""
    updated = copy.deepcopy(config)
    updated["theme"] = {**updated.get("theme", {}), **preset}
    return updated, f"theme.{key}"


def _apply_photo_preset(config: dict, key: str) -> tuple[dict, str]:
    url = PRESET_IMAGES.get(key)
    if not url:
        return config, ""
    updated = copy.deepcopy(config)
    updated["hero"]["image_url"] = url
    return updated, "hero.image_url"


def _interpret_segment(raw: str, config: dict) -> tuple[dict, str, list[str]]:
    """Try rule engine + extended heuristics on one instruction segment."""
    updated, reply, changes = process_cms_command(raw, config)
    if changes:
        return updated, reply, changes

    text = _norm(raw)
    local_changes: list[str] = []

    # Quoted text → headline or description based on context
    quotes = _extract_quoted(raw)
    if quotes:
        val = quotes[0]
        if any(k in text for k in ("description", "desc", "about", "paragraph")):
            updated = copy.deepcopy(config)
            updated["hero"]["description"] = val
            return updated, f"Description set to: {val}", ["hero.description"]
        if any(k in text for k in ("button", "cta", "apply")):
            updated = copy.deepcopy(config)
            updated["hero"]["cta_primary"] = val
            return updated, f"Button text: {val}", ["hero.cta_primary"]
        if any(k in text for k in ("badge", "tag")):
            updated = copy.deepcopy(config)
            updated["hero"]["badge"] = val
            return updated, f"Badge: {val}", ["hero.badge"]
        if any(k in text for k in ("urgency", "banner", "strip")):
            updated = copy.deepcopy(config)
            updated["urgency_bar"]["text"] = val
            updated["urgency_bar"]["enabled"] = True
            updated["sections"]["urgency_bar"] = True
            return updated, f"Urgency: {val}", ["urgency_bar.text"]

        updated = copy.deepcopy(config)
        if "." in val and len(val.split(".")) >= 2:
            parts = val.split(".", 1)
            updated["hero"]["headline_line1"] = parts[0].strip() + "."
            updated["hero"]["headline_highlight"] = parts[1].strip().rstrip(".")
        else:
            updated["hero"]["headline_highlight"] = val
        return updated, f"Headline: {val}", ["hero.headline"]

    # Theme from natural language
    for keywords, theme_key in THEME_HINTS:
        if any(k in text for k in keywords):
            updated, ch = _apply_theme(config, theme_key)
            if ch:
                label = THEME_PRESETS[theme_key]["label"]
                return updated, f"Theme → {label}", [ch]

    # Photo from natural language
    for keywords, photo_key in PHOTO_HINTS:
        if any(k in text for k in keywords) and any(
            k in text for k in ("photo", "image", "picture", "hero", "background", "lagao", "lagana", "use", "set")
        ):
            updated, ch = _apply_photo_preset(config, photo_key)
            if ch:
                return updated, f"Hero photo → {photo_key}", [ch]

    # Bare photo keywords without "photo" word
    if any(k in text for k in ("wedding feel", "shaadi wala", "couple photo", "wedding look")):
        updated, ch = _apply_photo_preset(config, "wedding")
        if ch:
            return updated, "Wedding couple hero photo applied", [ch]

    # ROI anywhere in segment
    m = re.search(r"(\d+(?:\.\d+)?)\s*%", raw)
    if m or any(k in text for k in ("roi", "rate", "interest")):
        rate_m = re.search(r"(\d+(?:\.\d+)?)", raw)
        if rate_m:
            roi = f"{rate_m.group(1)}%"
            updated = copy.deepcopy(config)
            updated["hero"]["roi_badge"] = roi
            if updated.get("stats") and len(updated["stats"]) > 1:
                updated["stats"][1]["value"] = roi
            return updated, f"ROI → {roi}", ["hero.roi_badge"]

    # Show/hide sections
    for section, show_kw, hide_kw in [
        ("testimonials", ("show testimonial", "testimonials on", "reviews dikhao"), ("hide testimonial", "testimonial off")),
        ("emi_calculator", ("show emi", "calculator on"), ("hide emi", "calculator off")),
        ("dream_section", ("show dream", "dream section on"), ("hide dream", "dream off")),
        ("urgency_bar", ("show urgency", "urgency on"), ("hide urgency", "urgency off")),
        ("promo_strip", ("show promo", "promo on"), ("hide promo", "promo off")),
    ]:
        if any(k in text for k in show_kw):
            updated = copy.deepcopy(config)
            updated["sections"][section] = True
            if section == "urgency_bar":
                updated["urgency_bar"]["enabled"] = True
            if section == "promo_strip":
                updated["promo_strip"]["enabled"] = True
            return updated, f"Section {section} visible", [f"sections.{section}=true"]
        if any(k in text for k in hide_kw):
            updated = copy.deepcopy(config)
            updated["sections"][section] = False
            if section == "urgency_bar":
                updated["urgency_bar"]["enabled"] = False
            if section == "promo_strip":
                updated["promo_strip"]["enabled"] = False
            return updated, f"Section {section} hidden", [f"sections.{section}=false"]

    # "make it more X" style
    if "premium" in text or "professional" in text or "trust" in text:
        updated = copy.deepcopy(config)
        updated["hero"]["badge"] = "RBI LSP Registered · Premium Marketplace"
        updated, ch = _apply_theme(updated, "glass-blue")
        local_changes.extend([ch, "hero.badge"])
        return updated, "Premium glass look + trust badge applied", local_changes

    # Direct image URL in segment
    url = _extract_url(raw)
    if url and is_safe_https_image_url(url):
        updated = copy.deepcopy(config)
        if "background" in text or "bg" in text:
            updated["theme"]["hero_background"] = url
            return updated, "Background image updated", ["theme.hero_background"]
        updated["hero"]["image_url"] = url
        return updated, "Hero image updated", ["hero.image_url"]

    # Free-form headline: "headline should say ..." / "title ..."
    m = re.search(
        r"(?:headline|title|heading|tagline)\s+(?:should\s+)?(?:be|say|is|ko\s+)?(?:change\s+)?(?:to\s+)?(.+)$",
        raw,
        re.I,
    )
    if m:
        val = m.group(1).strip().strip("\"'")
        updated = copy.deepcopy(config)
        if "." in val:
            p = val.split(".", 1)
            updated["hero"]["headline_line1"] = p[0].strip() + "."
            updated["hero"]["headline_highlight"] = p[1].strip().rstrip(".")
        else:
            updated["hero"]["headline_highlight"] = val
        return updated, f"Headline → {val}", ["hero.headline"]

    # Button natural language
    m = re.search(r"(?:button|cta|apply)\s+(?:text\s+)?(?:ko\s+)?(?:change\s+)?(?:to\s+)?(.+)$", raw, re.I)
    if m:
        val = m.group(1).strip().strip("\"'")
        updated = copy.deepcopy(config)
        updated["hero"]["cta_primary"] = val
        return updated, f"CTA → {val}", ["hero.cta_primary"]

    return config, "", []


def process_smart_prompt(
    message: str,
    config: dict,
) -> tuple[dict, str, list[str], str | None, str | None]:
    """
    Parse natural-language prompt locally (no API).
    Returns (config, reply, changes, action, image_query).
    """
    raw = message.strip()
    if not raw:
        return config, "", [], None, None

    text = _norm(raw)

    if any(k in text for k in ("search photo", "search image", "find photo", "photo dhundo")):
        query = re.sub(r"^(search|find)\s+(photo|image)s?\s*(for|of)?\s*", "", text).strip() or "loan"
        return config, "", [], "search_images", query

    segments = [s.strip() for s in SPLIT_RE.split(raw) if s.strip()]
    if len(segments) <= 1:
        segments = [raw]

    working = copy.deepcopy(config)
    all_changes: list[str] = []
    summaries: list[str] = []

    for segment in segments:
        seg_cfg = working
        seg_changes: list[str] = []
        seg_summaries: list[str] = []
        for _ in range(4):
            updated, summary, changes = _interpret_segment(segment, seg_cfg)
            if not changes:
                break
            new_changes = [c for c in changes if c not in seg_changes]
            if not new_changes:
                break
            seg_cfg = updated
            seg_changes.extend(new_changes)
            if summary:
                seg_summaries.append(summary.replace("✅ ", "").replace("👁️ ", ""))
        if seg_changes:
            working = seg_cfg
            all_changes.extend(seg_changes)
            summaries.extend(seg_summaries)

    if all_changes:
        reply = "👁️ **Preview updated** — " + "; ".join(summaries[:4])
        if len(summaries) > 4:
            reply += f" (+{len(summaries) - 4} more)"
        reply += "\n\nPreview panel check karo → **Publish to Live** when ready."
        return working, reply, all_changes, None, None

    return config, "", [], None, None
