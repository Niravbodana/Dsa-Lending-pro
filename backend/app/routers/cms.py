from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import SiteConfig
from app.routers.admin import verify_admin
from app.schemas_cms import CmsChatRequest, CmsChatResponse, SiteConfigResponse
from app.services.cms_brain import generate_suggestions, process_brain_command
from app.services.cms_llm import is_llm_available
from app.services.cms_store import (
    CONFIG_ROW_ID,
    DRAFT_ROW_ID,
    discard_draft,
    get_draft_config,
    get_site_config,
    has_unpublished_changes,
    publish_draft,
    reset_site_config,
    save_draft_config,
)

router = APIRouter(prefix="/cms", tags=["cms"])


def _updated_at(db: Session, row_id: int) -> str | None:
    row = db.query(SiteConfig).filter(SiteConfig.id == row_id).first()
    return row.updated_at.isoformat() if row and row.updated_at else None


@router.get("/config", response_model=SiteConfigResponse)
def public_site_config(db: Session = Depends(get_db)):
    return SiteConfigResponse(config=get_site_config(db), updated_at=_updated_at(db, CONFIG_ROW_ID))


@router.get("/preview", response_model=SiteConfigResponse)
def preview_site_config(
    token: str,
    db: Session = Depends(get_db),
):
    """Draft config for admin preview iframe (?token=admin_session)."""
    verify_admin(authorization=f"Bearer {token}", db=db)
    return SiteConfigResponse(
        config=get_draft_config(db),
        updated_at=_updated_at(db, DRAFT_ROW_ID),
        is_draft=True,
    )


@router.get("/admin/status", response_model=SiteConfigResponse)
def admin_cms_status(db: Session = Depends(get_db), _: None = Depends(verify_admin)):
    draft = get_draft_config(db)
    return SiteConfigResponse(
        config=draft,
        updated_at=_updated_at(db, DRAFT_ROW_ID),
        is_draft=True,
    )


@router.post("/admin/chat", response_model=CmsChatResponse)
def admin_cms_chat(
    payload: CmsChatRequest,
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin),
):
    current = get_draft_config(db)
    history = [{"role": h.role, "content": h.content} for h in payload.history]
    updated, reply, changes, suggestions, image_options, ai_mode = process_brain_command(
        payload.message, current, session_id=payload.session_id, history=history
    )

    published = False
    if "__publish__" in changes:
        save_draft_config(db, updated)
        publish_draft(db)
        changes = [c for c in changes if not c.startswith("__")]
        published = True
        reply = "🚀 **Published!** Live website updated. Customers ab naya design dekhenge."
    elif "__discard__" in changes:
        updated = discard_draft(db)
        changes = []
        reply = "↩️ Draft discarded — live site unchanged."
    elif "__reset__" in changes:
        updated = reset_site_config(db)
        save_draft_config(db, updated)
        changes = [c for c in changes if not c.startswith("__")]
    elif changes:
        save_draft_config(db, updated)

    return CmsChatResponse(
        reply=reply,
        changes=[c for c in changes if not c.startswith("__")],
        config=updated,
        suggestions=suggestions or generate_suggestions(updated),
        image_options=image_options,
        has_draft_changes=has_unpublished_changes(db),
        published=published,
        ai_mode=ai_mode,
        llm_enabled=is_llm_available(),
    )


@router.post("/admin/publish", response_model=SiteConfigResponse)
def admin_cms_publish(db: Session = Depends(get_db), _: None = Depends(verify_admin)):
    config = publish_draft(db)
    return SiteConfigResponse(config=config, updated_at=_updated_at(db, CONFIG_ROW_ID))


@router.post("/admin/discard", response_model=SiteConfigResponse)
def admin_cms_discard(db: Session = Depends(get_db), _: None = Depends(verify_admin)):
    config = discard_draft(db)
    return SiteConfigResponse(config=config, updated_at=_updated_at(db, DRAFT_ROW_ID), is_draft=True)


@router.post("/admin/reset", response_model=SiteConfigResponse)
def admin_cms_reset(db: Session = Depends(get_db), _: None = Depends(verify_admin)):
    config = reset_site_config(db)
    save_draft_config(db, config)
    return SiteConfigResponse(config=config, updated_at=datetime.now(timezone.utc).isoformat())
