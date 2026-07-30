"""CMS draft/publish workflow — preview before live."""

from __future__ import annotations

import copy
import json
from typing import Any

from sqlalchemy.orm import Session

from app.models import SiteConfig
from app.services.cms_defaults import DEFAULT_SITE_CONFIG

CONFIG_ROW_ID = 1
DRAFT_ROW_ID = 2


def deep_merge(base: dict, updates: dict) -> dict:
    result = copy.deepcopy(base)
    for key, value in updates.items():
        if key in result and isinstance(result[key], dict) and isinstance(value, dict):
            result[key] = deep_merge(result[key], value)
        else:
            result[key] = copy.deepcopy(value)
    return result


def get_default_config() -> dict:
    return copy.deepcopy(DEFAULT_SITE_CONFIG)


def _load_row(db: Session, row_id: int) -> dict | None:
    row = db.query(SiteConfig).filter(SiteConfig.id == row_id).first()
    if not row:
        return None
    try:
        return json.loads(row.config_json)
    except json.JSONDecodeError:
        return None


def _save_row(db: Session, row_id: int, config: dict) -> dict:
    merged = deep_merge(get_default_config(), config)
    payload = json.dumps(merged, ensure_ascii=False)
    row = db.query(SiteConfig).filter(SiteConfig.id == row_id).first()
    if row:
        row.config_json = payload
    else:
        db.add(SiteConfig(id=row_id, config_json=payload))
    db.commit()
    return merged


def get_site_config(db: Session) -> dict:
    stored = _load_row(db, CONFIG_ROW_ID)
    if stored is None:
        return get_default_config()
    return deep_merge(get_default_config(), stored)


def save_site_config(db: Session, config: dict) -> dict:
    return _save_row(db, CONFIG_ROW_ID, config)


def get_draft_config(db: Session) -> dict:
    stored = _load_row(db, DRAFT_ROW_ID)
    if stored is None:
        return copy.deepcopy(get_site_config(db))
    return deep_merge(get_default_config(), stored)


def save_draft_config(db: Session, config: dict) -> dict:
    return _save_row(db, DRAFT_ROW_ID, config)


def publish_draft(db: Session) -> dict:
    draft = get_draft_config(db)
    return save_site_config(db, draft)


def discard_draft(db: Session) -> dict:
    live = get_site_config(db)
    save_draft_config(db, live)
    return live


def has_unpublished_changes(db: Session) -> bool:
    return json.dumps(get_draft_config(db), sort_keys=True) != json.dumps(
        get_site_config(db), sort_keys=True
    )


def apply_partial_update(db: Session, path: str, value: Any, *, draft: bool = True) -> tuple[dict, str]:
    """Set nested key via dot path e.g. hero.headline_highlight"""
    getter = get_draft_config if draft else get_site_config
    saver = save_draft_config if draft else save_site_config
    config = getter(db)
    keys = path.split(".")
    target = config
    for k in keys[:-1]:
        if k not in target or not isinstance(target[k], dict):
            target[k] = {}
        target = target[k]
    old = target.get(keys[-1])
    target[keys[-1]] = value
    saver(db, config)
    return config, f"Updated {path}: {old!r} → {value!r}"


def reset_site_config(db: Session) -> dict:
    db.query(SiteConfig).filter(SiteConfig.id.in_([CONFIG_ROW_ID, DRAFT_ROW_ID])).delete()
    db.commit()
    return get_default_config()
