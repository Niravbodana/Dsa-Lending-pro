"""Admin Site Builder — natural language CMS commands (English + Hinglish)."""

from __future__ import annotations

import copy
import re
from typing import Any

from app.services.cms_defaults import DEFAULT_SITE_CONFIG
from app.services.cms_store import deep_merge, get_default_config

PRESET_IMAGES = {
    "wedding": "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=750&fit=crop",
    "home": "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=600&h=750&fit=crop",
    "business": "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&h=750&fit=crop",
    "medical": "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&h=750&fit=crop",
    "travel": "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=600&h=750&fit=crop",
    "family": "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&h=750&fit=crop",
    "professional": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=750&fit=crop&crop=faces",
    "happy": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=750&fit=crop",
}

HELP_TEXT = """**Site Builder Commands** (type in English or Hinglish):

• **Headline:** `change headline to Dream Big. Borrow Smart.`
• **Highlight word:** `change highlight to Your Dreams`
• **Sub headline:** `change sub headline to Up to 15 lakh in 3 minutes`
• **ROI:** `set roi to 9.99%` or `roi 9.5 percent karo`
• **Max loan:** `change max loan to 15 lakh`
• **CTA button:** `change button text to Apply Karo Abhi`
• **Hero photo:** `change photo to wedding` (wedding/home/business/medical/travel/family)
• **Urgency bar:** `show urgency bar` / `hide urgency bar`
• **Urgency text:** `urgency text: 500 people applied today`
• **Promo:** `show promo strip` / `hide promo strip`
• **Badge:** `change badge to RBI Approved Marketplace`
• **Description:** `change description to Your trusted loan partner`
• **Reset:** `reset website to default`
• **Preview:** `show current headline` / `kya headline hai`

Changes apply **live** on the homepage within seconds."""


def _norm(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower().strip())


def _extract_after(text: str, patterns: list[str]) -> str | None:
    for pat in patterns:
        m = re.search(pat, text, re.IGNORECASE)
        if m:
            return m.group(1).strip().strip("\"'")
    return None


def process_cms_command(message: str, config: dict) -> tuple[dict, str, list[str]]:
    """
    Returns (updated_config, reply_message, list_of_changes).
    Does not save to DB — caller saves.
    """
    raw = message.strip()
    text = _norm(raw)
    changes: list[str] = []
    updated = copy.deepcopy(config)

    if not text:
        return updated, "Please type a command. Say **help** for examples.", changes

    if _match(text, "help", "commands", "kya kar sakte", "kaise use", "guide"):
        return updated, HELP_TEXT, changes

    if _match(text, "reset", "default", "wapas", "original"):
        updated = get_default_config()
        changes.append("Reset entire site to default configuration")
        return updated, "✅ Website reset to default settings. Refresh homepage to see changes.", changes

    if _match(text, "show headline", "current headline", "kya headline", "headline kya"):
        h = updated.get("hero", {})
        return (
            updated,
            f"**Current headline:**\n• Line 1: {h.get('headline_line1')}\n• Highlight: {h.get('headline_highlight')}\n• Sub: {h.get('headline_sub')}",
            changes,
        )

    if _match(text, "show config", "current settings", "status"):
        h = updated.get("hero", {})
        return (
            updated,
            f"**Live site snapshot:**\n• ROI: {h.get('roi_badge')}\n• CTA: {h.get('cta_primary')}\n• Urgency: {'ON' if updated.get('urgency_bar', {}).get('enabled') else 'OFF'}\n• Promo: {'ON' if updated.get('promo_strip', {}).get('enabled') else 'OFF'}",
            changes,
        )

    # Headline patterns
    val = _extract_after(
        raw,
        [
            r"(?:change|set|update)\s+(?:the\s+)?headline\s+(?:to\s+)(.+)$",
            r"headline\s+(?:ko\s+)?(?:change|badlo|karo)\s+(?:to\s+|karke\s+)?(.+)$",
            r"headline\s*:\s*(.+)$",
        ],
    )
    if val:
        parts = re.split(r"[.|!]\s*", val, maxsplit=1)
        if len(parts) == 2:
            updated["hero"]["headline_line1"] = parts[0].strip() + "."
            updated["hero"]["headline_highlight"] = parts[1].strip().rstrip(".")
        else:
            updated["hero"]["headline_highlight"] = val
        changes.append(f"Headline updated")
        return updated, f"✅ Headline updated! Refresh homepage.\n\n**New:** {val}", changes

    val = _extract_after(
        raw,
        [
            r"(?:change|set)\s+highlight\s+(?:to\s+)(.+)$",
            r"highlight\s+(?:ko\s+)?(.+)$",
        ],
    )
    if val and "headline" not in text:
        updated["hero"]["headline_highlight"] = val
        changes.append("hero.headline_highlight")
        return updated, f"✅ Highlight text set to: **{val}**", changes

    val = _extract_after(
        raw,
        [
            r"(?:change|set)\s+sub\s*headline\s+(?:to\s+)(.+)$",
            r"sub headline\s*:\s*(.+)$",
        ],
    )
    if val:
        updated["hero"]["headline_sub"] = val
        changes.append("hero.headline_sub")
        return updated, f"✅ Sub-headline updated: {val}", changes

    # ROI
    m = re.search(r"(?:roi|rate|interest)\s*(?:to\s+|ko\s+|=\s*)?(\d+(?:\.\d+)?)\s*%?", text)
    if m or ("roi" in text and "%" in raw):
        rate = m.group(1) if m else re.search(r"(\d+(?:\.\d+)?)\s*%", raw).group(1)
        roi = f"{rate}%"
        updated["hero"]["roi_badge"] = roi
        if updated.get("stats") and len(updated["stats"]) > 1:
            updated["stats"][1]["value"] = roi
        changes.append("hero.roi_badge")
        return updated, f"✅ Starting ROI updated to **{roi}** on hero & stats.", changes

    # Max loan
    m = re.search(r"(?:max\s*loan|loan\s*amount|upto|up to)\s*(?:to\s+|ko\s+)?(?:₹|rs\.?|inr\s*)?(\d+(?:\.\d+)?)\s*(lakh|lac|l|crore|cr)?", text)
    if m:
        num = float(m.group(1))
        unit = (m.group(2) or "").lower()
        if unit in ("lakh", "lac", "l"):
            display = f"₹{int(num)}L+" if num == int(num) else f"₹{num}L+"
            sub = f"Up to ₹{int(num * 100000):,} — approved in 5 minutes." if num < 100 else f"Up to ₹{int(num)} lakh — in minutes."
        elif unit in ("crore", "cr"):
            display = f"₹{num}Cr+"
            sub = f"Up to ₹{num} crore — premium loans."
        else:
            display = f"₹{int(num):,}+"
            sub = f"Up to ₹{int(num):,} — in minutes."
        updated["stats"][0]["value"] = display
        updated["hero"]["headline_sub"] = sub
        changes.append("stats.max_loan")
        return updated, f"✅ Max loan updated to **{display}**", changes

    # CTA
    val = _extract_after(
        raw,
        [
            r"(?:change|set)\s+(?:cta|button|apply button)\s+(?:text\s+)?(?:to\s+)(.+)$",
            r"button\s+(?:text\s+)?(?:ko\s+)?(.+)$",
        ],
    )
    if val:
        updated["hero"]["cta_primary"] = val
        changes.append("hero.cta_primary")
        return updated, f"✅ Primary button text: **{val}**", changes

    # Badge
    val = _extract_after(raw, [r"(?:change|set)\s+badge\s+(?:to\s+)(.+)$", r"badge\s*:\s*(.+)$"])
    if val:
        updated["hero"]["badge"] = val
        changes.append("hero.badge")
        return updated, f"✅ Hero badge updated.", changes

    # Description
    val = _extract_after(
        raw,
        [r"(?:change|set)\s+description\s+(?:to\s+)(.+)$", r"description\s*:\s*(.+)$"]
    )
    if val:
        updated["hero"]["description"] = val
        changes.append("hero.description")
        return updated, f"✅ Hero description updated.", changes

    # Photo presets
    if _match(text, "photo", "image", "picture", "hero image"):
        for key, url in PRESET_IMAGES.items():
            if key in text:
                updated["hero"]["image_url"] = url
                changes.append("hero.image_url")
                return updated, f"✅ Hero photo changed to **{key}** theme.", changes
        val = _extract_after(raw, [r"(?:photo|image)\s+(?:url\s+)?(?:to\s+)?(https?://\S+)$"])
        if val:
            updated["hero"]["image_url"] = val
            changes.append("hero.image_url")
            return updated, "✅ Hero image URL updated.", changes

    # Urgency bar
    if _match(text, "hide urgency", "urgency band", "urgency bar off", "urgency hata"):
        updated["urgency_bar"]["enabled"] = False
        updated["sections"]["urgency_bar"] = False
        changes.append("urgency_bar.disabled")
        return updated, "✅ Urgency bar hidden.", changes

    if _match(text, "show urgency", "urgency bar on", "urgency dikhao"):
        updated["urgency_bar"]["enabled"] = True
        updated["sections"]["urgency_bar"] = True
        changes.append("urgency_bar.enabled")
        return updated, "✅ Urgency bar is now visible.", changes

    val = _extract_after(raw, [r"urgency\s*(?:text|bar|message)\s*:\s*(.+)$", r"urgency\s+(?:text\s+)?(?:to\s+)(.+)$"])
    if val:
        updated["urgency_bar"]["text"] = val
        updated["urgency_bar"]["enabled"] = True
        changes.append("urgency_bar.text")
        return updated, f"✅ Urgency message: {val}", changes

    # Promo strip
    if _match(text, "hide promo", "promo band off"):
        updated["promo_strip"]["enabled"] = False
        changes.append("promo_strip.disabled")
        return updated, "✅ Promo strip hidden.", changes

    if _match(text, "show promo", "promo on"):
        updated["promo_strip"]["enabled"] = True
        changes.append("promo_strip.enabled")
        return updated, "✅ Promo strip visible.", changes

    val = _extract_after(raw, [r"promo\s*(?:text|message)\s*:\s*(.+)$", r"promo\s+(?:to\s+)(.+)$"])
    if val:
        updated["promo_strip"]["text"] = val
        updated["promo_strip"]["enabled"] = True
        changes.append("promo_strip.text")
        return updated, f"✅ Promo text updated.", changes

    # Approval card amount
    m = re.search(r"approval\s*(?:card|amount)\s*(?:to\s+)?₹?([\d,]+)", text)
    if m:
        amt = f"₹{m.group(1)}"
        updated["hero"]["approval_card_amount"] = amt
        changes.append("hero.approval_card_amount")
        return updated, f"✅ Floating approval card: **{amt}**", changes

    # Testimonial
    val = _extract_after(raw, [r"testimonial\s*:\s*(.+)$", r"quote\s*:\s*(.+)$"])
    if val:
        updated["hero"]["testimonial_quote"] = val
        changes.append("hero.testimonial_quote")
        return updated, "✅ Customer quote updated on hero.", changes

    # Toggle sections
    for section, keywords in [
        ("testimonials", ("hide testimonial", "testimonial off")),
        ("emi_calculator", ("hide emi", "calculator off")),
        ("dream_section", ("hide dream", "dream section off")),
    ]:
        if any(k in text for k in keywords):
            updated["sections"][section] = False
            changes.append(f"sections.{section}=false")
            return updated, f"✅ Section **{section}** hidden.", changes

    return (
        updated,
        "I didn't understand that command. Type **help** to see what you can change — headline, ROI, photos, urgency bar, buttons, and more.",
        changes,
    )


def _match(text: str, *keywords: str) -> bool:
    return any(k in text for k in keywords)
