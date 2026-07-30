"""Auto-discover editable CMS paths from config JSON — keeps LLM + editor in sync."""

from __future__ import annotations

from typing import Any

SKIP_TOP_KEYS = frozenset({"element_styles", "custom_blocks", "sections"})


def discover_editable_paths(config: dict[str, Any], prefix: str = "") -> list[dict[str, str]]:
    """Return all leaf string/number paths in site config."""
    paths: list[dict[str, str]] = []

    def walk(value: Any, path: str) -> None:
        if value is None:
            return
        if isinstance(value, (str, int, float)) and not isinstance(value, bool):
            key = path.split(".")[-1] if path else ""
            field_type = "image" if "image" in path.lower() else "text"
            paths.append(
                {
                    "path": path,
                    "label": key.replace("_", " ").title(),
                    "group": path.split(".")[0] if path else "root",
                    "type": field_type,
                }
            )
            return
        if isinstance(value, list):
            for i, item in enumerate(value):
                walk(item, f"{path}.{i}" if path else str(i))
            return
        if isinstance(value, dict):
            top = path.split(".")[0] if path else ""
            if top in SKIP_TOP_KEYS or path in SKIP_TOP_KEYS:
                return
            for k, v in value.items():
                child = f"{path}.{k}" if path else k
                walk(v, child)

    walk(config, prefix)
    return paths


def paths_for_llm_prompt(config: dict[str, Any], limit: int = 80) -> str:
    """Compact path list for LLM system prompt."""
    items = discover_editable_paths(config)[:limit]
    lines = [f"- {p['path']} ({p['type']})" for p in items]
    return "\n".join(lines) if lines else "(see DEFAULT_SITE_CONFIG)"
