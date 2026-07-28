"""CMS config load/save with deep merge."""

from __future__ import annotations

import copy
import json
from typing import Any

from sqlalchemy.orm import Session

from app.models import SiteConfig
from app.services.cms_defaults import DEFAULT_SITE_CONFIG

CONFIG_ROW_ID = 1


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


def get_site_config(db: Session) -> dict:
    row = db.query(SiteConfig).filter(SiteConfig.id == CONFIG_ROW_ID).first()
    if not row:
        return get_default_config()
    try:
        stored = json.loads(row.config_json)
        return deep_merge(get_default_config(), stored)
    except json.JSONDecodeError:
        return get_default_config()


def save_site_config(db: Session, config: dict) -> dict:
    merged = deep_merge(get_default_config(), config)
    row = db.query(SiteConfig).filter(SiteConfig.id == CONFIG_ROW_ID).first()
    payload = json.dumps(merged, ensure_ascii=False)
    if row:
        row.config_json = payload
    else:
        db.add(SiteConfig(id=CONFIG_ROW_ID, config_json=payload))
    db.commit()
    return merged


def apply_partial_update(db: Session, path: str, value: Any) -> tuple[dict, str]:
    """Set nested key via dot path e.g. hero.headline_highlight"""
    config = get_site_config(db)
    keys = path.split(".")
    target = config
    for k in keys[:-1]:
        if k not in target or not isinstance(target[k], dict):
            target[k] = {}
        target = target[k]
    old = target.get(keys[-1])
    target[keys[-1]] = value
    save_site_config(db, config)
    return config, f"Updated {path}: {old!r} → {value!r}"


def reset_site_config(db: Session) -> dict:
    db.query(SiteConfig).filter(SiteConfig.id == CONFIG_ROW_ID).delete()
    db.commit()
    return get_default_config()
