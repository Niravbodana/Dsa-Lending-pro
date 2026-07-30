"""Site Builder Brain — preview-first CMS with image search, themes, and smart suggestions."""

from __future__ import annotations

import copy
import re
from typing import Any

from app.services.cms_assistant import process_cms_command
from app.services.cms_image_search import image_by_index, search_images
from app.services.cms_llm import is_llm_available, process_llm_prompt
from app.services.cms_prompt_engine import process_smart_prompt
from app.services.cms_themes import THEME_PRESETS
from app.services.url_safety import is_safe_https_image_url

THEME_PRESETS = THEME_PRESETS  # re-export for backwards compatibility

# Per-session last search results (admin-only, in-memory)
_last_search: dict[str, list[dict[str, str]]] = {}


def _norm(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower().strip())


def _match(text: str, *keywords: str) -> bool:
    return any(k in text for k in keywords)


def _extract_url(raw: str) -> str | None:
    m = re.search(r"(https?://\S+)", raw)
    if m:
        return m.group(1).rstrip(".,)")
    m = re.search(r"(/images/\S+|/hero\S*)", raw)
    return m.group(1) if m else None


def generate_suggestions(config: dict) -> list[str]:
    """Proactive AI suggestions based on current site state."""
    h = config.get("hero", {})
    theme = config.get("theme", {})
    tips: list[str] = []

    if "wedding" not in (h.get("image_url") or ""):
        tips.append("search photo wedding couple")
    if theme.get("background") != "glass-blue":
        tips.append("change theme to glass blue")
    if h.get("roi_badge", "").replace("%", "") not in ("9.99", "10.99"):
        tips.append("set roi to 9.99%")
    if not config.get("sections", {}).get("testimonials", True):
        tips.append("show testimonials section")
    tips.extend(
        [
            "change headline to Dream Big. Borrow Smart.",
            "change photo to wedding",
            "publish changes",
        ]
    )
    return tips[:6]


def process_brain_command(
    message: str,
    config: dict,
    *,
    session_id: str = "default",
    history: list[dict[str, str]] | None = None,
) -> tuple[dict, str, list[str], list[str], list[dict[str, str]], str]:
    """
    Returns (updated_config, reply, changes, suggestions, image_options, ai_mode).
    Never auto-publishes — caller saves to draft only.
    ai_mode: llm | smart | rules | none
    """
    raw = message.strip()
    text = _norm(raw)
    changes: list[str] = []
    updated = copy.deepcopy(config)
    image_options: list[dict[str, str]] = []

    if not text:
        suggestions = generate_suggestions(updated)
        mode = "llm" if is_llm_available() else "smart"
        return updated, "Namaste! Main **Site Builder Brain** hoon. Kuch bhi bolo — photo, theme, headline, background. Pehle **preview**, phir **publish**.", changes, suggestions, image_options, mode

    # --- Publish / discard (draft workflow) ---
    if _match(text, "publish", "go live", "apply changes", "done publish", "live karo", "save website"):
        return (
            updated,
            "✅ Ready to **publish**! Click the green **Publish to Live** button above — ya type **confirm publish**.",
            [],
            ["confirm publish"],
            image_options,
            "rules",
        )

    if text in ("confirm publish", "yes publish", "confirm live", "haan publish"):
        changes.append("__publish__")
        return updated, "🚀 **Publishing to live site...** Homepage will update in seconds.", changes, [], image_options, "rules"

    if _match(text, "discard", "undo all", "cancel changes", "draft hatao", "revert draft"):
        changes.append("__discard__")
        return updated, "↩️ Draft discarded — reverted to live site.", changes, generate_suggestions(updated), image_options, "rules"

    # --- Image search (web-style catalog) ---
    if _match(text, "search photo", "search image", "find photo", "find image", "photo dhundo", "image search"):
        query = re.sub(
            r"^(search|find)\s+(photo|image|picture)s?\s*(for|of)?\s*",
            "",
            text,
            flags=re.I,
        ).strip() or "loan"
        image_options = search_images(query)
        _last_search[session_id] = image_options
        lines = ["🔍 **Photo options** (preview ke liye pick karo):\n"]
        from app.services.cms_image_search import image_search_status

        api = image_search_status()
        if api.get("unsplash") or api.get("pexels"):
            sources = [k for k, v in api.items() if v and k != "catalog"]
            lines.append(f"_Live search: {', '.join(sources)} + local catalog_\n")
        for i, img in enumerate(image_options, 1):
            lines.append(f"{i}. **{img['label']}** — `{img['url']}`")
        lines.append('\nBolo: **use photo 1** ya **set hero image https://...**')
        return updated, "\n".join(lines), changes, [f"use photo {i}" for i in range(1, min(4, len(image_options) + 1))], image_options, "rules"

    m = re.search(r"use\s+photo\s+(\d+)", text)
    if m:
        idx = int(m.group(1))
        options = _last_search.get(session_id) or search_images("wedding")
        url = image_by_index(options, idx)
        if url:
            updated["hero"]["image_url"] = url
            changes.append("hero.image_url")
            return (
                updated,
                f"👁️ **Preview updated** — hero photo set to option {idx}.\n\nDekho preview panel → accha lage to **Publish to Live**.",
                changes,
                generate_suggestions(updated),
                options,
                "rules",
            )
        return updated, f"❌ Option {idx} not found. Pehle **search photo wedding** karo.", changes, ["search photo wedding"], image_options, "rules"

    def _handle_action(
        action: str | None,
        reply: str,
        sub_changes: list[str],
        mode: str,
        query: str | None = None,
    ) -> tuple | None:
        nonlocal updated, changes, image_options
        if action == "publish":
            changes.append("__publish__")
            return updated, reply or "🚀 Publishing...", changes, [], image_options, mode
        if action == "discard":
            changes.append("__discard__")
            return updated, reply or "↩️ Draft discarded.", changes, generate_suggestions(updated), image_options, mode
        if action == "reset":
            changes.append("__reset__")
            return updated, reply or "✅ Reset to default.", changes, generate_suggestions(updated), image_options, mode
        if action == "search_images":
            q = query or "loan"
            image_options = search_images(q)
            _last_search[session_id] = image_options
            lines = [f"🔍 **Photo options** for “{q}”:\n"]
            for i, img in enumerate(image_options, 1):
                lines.append(f"{i}. **{img['label']}**")
            lines.append('\nBolo: **use photo 1**')
            return updated, "\n".join(lines), changes, [f"use photo {i}" for i in range(1, min(4, len(image_options) + 1))], image_options, mode
        return None

    # --- LLM prompt editing (OpenAI / compatible) ---
    if is_llm_available() and not _match(text, "help", "commands", "kya kar sakte"):
        llm_result = process_llm_prompt(message, updated, history=history)
        if llm_result:
            updated, reply, sub_changes, action, image_query = llm_result
            handled = _handle_action(action, reply, sub_changes, "llm", image_query)
            if handled:
                return handled
            if sub_changes:
                changes.extend(sub_changes)
            return updated, reply, changes, generate_suggestions(updated), image_options, "llm"

    # --- Smart local prompt (no API key) ---
    smart_result = process_smart_prompt(message, updated)
    if smart_result[2] or smart_result[3]:
        updated, reply, sub_changes, action, image_query = smart_result
        handled = _handle_action(action, reply, sub_changes, "smart", image_query)
        if handled:
            return handled
        if sub_changes:
            changes.extend(sub_changes)
            return updated, reply, changes, generate_suggestions(updated), image_options, "smart"

    # --- Direct image URL ---
    if _match(text, "image", "photo", "background", "hero") and ("http" in raw or "/images/" in raw or "/hero" in raw):
        url = _extract_url(raw)
        if url:
            if not is_safe_https_image_url(url):
                return updated, "❌ Image URL not allowed. Use `/images/...`, `/hero-...`, or HTTPS from Unsplash/Pexels.", changes, ["search photo wedding"], image_options, "rules"
            if _match(text, "background", "bg"):
                updated["theme"]["hero_background"] = url
                changes.append("theme.hero_background")
                target = "background"
            else:
                updated["hero"]["image_url"] = url
                changes.append("hero.image_url")
                target = "hero"
            return (
                updated,
                f"👁️ **Preview** — {target} image updated.\n\nPreview panel check karo → **Publish** when ready.",
                changes,
                generate_suggestions(updated),
                image_options,
                "rules",
            )

    # --- Theme / background ---
    if _match(text, "theme", "background", "glass", "premium feel", "look"):
        for key, preset in THEME_PRESETS.items():
            if key.replace("-", " ") in text or preset["label"].lower() in text:
                updated["theme"] = {**updated.get("theme", {}), **preset}
                changes.append(f"theme.{key}")
                return (
                    updated,
                    f"👁️ **Preview** — theme set to **{preset['label']}**.\n\nGlass background + overlay updated in preview.",
                    changes,
                    generate_suggestions(updated),
                    image_options,
                    "rules",
                )
        if "blue" in text or "glass" in text:
            preset = THEME_PRESETS["glass-blue"]
            updated["theme"] = {**updated.get("theme", {}), **preset}
            changes.append("theme.glass-blue")
            return updated, "👁️ **Preview** — Light blue glass theme applied.", changes, generate_suggestions(updated), image_options, "rules"
        if "navy" in text or "dark" in text:
            preset = THEME_PRESETS["navy-premium"]
            updated["theme"] = {**updated.get("theme", {}), **preset}
            changes.append("theme.navy-premium")
            return updated, "👁️ **Preview** — Navy premium theme applied.", changes, generate_suggestions(updated), image_options, "rules"

    # --- Show sections ---
    for section, keywords in [
        ("testimonials", ("show testimonial", "testimonial on")),
        ("emi_calculator", ("show emi", "calculator on")),
        ("dream_section", ("show dream", "dream section on")),
        ("urgency_bar", ("show urgency",)),
    ]:
        if any(k in text for k in keywords):
            updated["sections"][section] = True
            if section == "urgency_bar":
                updated["urgency_bar"]["enabled"] = True
            changes.append(f"sections.{section}=true")
            return updated, f"👁️ **Preview** — **{section}** section visible.", changes, generate_suggestions(updated), image_options, "rules"

    # --- Dream section edits ---
    val = re.search(r"dream title\s*(?:to\s+)?(.+)$", raw, re.I)
    if val:
        updated["dream_section"]["title"] = val.group(1).strip()
        changes.append("dream_section.title")
        return updated, f"👁️ Dream section title: **{val.group(1).strip()}**", changes, generate_suggestions(updated), image_options, "rules"

    # --- Rule engine fallback ---
    updated, reply, sub_changes = process_cms_command(message, updated)
    if sub_changes:
        if "reset" in sub_changes[0].lower():
            changes.append("__reset__")
        else:
            changes.extend(sub_changes)
        if not reply.startswith("👁️"):
            reply = f"👁️ **Preview updated** — {reply}\n\nAccha lage to **Publish to Live** karo."
        return updated, reply, changes, generate_suggestions(updated), image_options, "rules"

    suggestions = generate_suggestions(updated)
    hint = "Natural language bhi chalega — jaise: \"wedding couple photo lagao aur roi 9.99% kar do\""
    if is_llm_available():
        hint = "🤖 **AI Prompt mode** on — kuch bhi likho, main samajh ke preview update karunga."
    reply = f"{reply}\n\n💡 {hint}"
    return updated, reply, changes, suggestions, image_options, "none"
