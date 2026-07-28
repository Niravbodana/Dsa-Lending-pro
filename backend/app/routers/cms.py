from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import SiteConfig
from app.routers.admin import verify_admin
from app.schemas_cms import CmsChatRequest, CmsChatResponse, SiteConfigResponse
from app.services.cms_assistant import process_cms_command
from app.services.cms_store import CONFIG_ROW_ID, get_site_config, reset_site_config, save_site_config

router = APIRouter(prefix="/cms", tags=["cms"])


@router.get("/config", response_model=SiteConfigResponse)
def public_site_config(db: Session = Depends(get_db)):
    row = db.query(SiteConfig).filter(SiteConfig.id == CONFIG_ROW_ID).first()
    updated = row.updated_at.isoformat() if row and row.updated_at else None
    return SiteConfigResponse(config=get_site_config(db), updated_at=updated)


@router.post("/admin/chat", response_model=CmsChatResponse)
def admin_cms_chat(
    payload: CmsChatRequest,
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin),
):
    current = get_site_config(db)
    updated, reply, changes = process_cms_command(payload.message, current)
    if changes:
        save_site_config(db, updated)
    return CmsChatResponse(reply=reply, changes=changes, config=updated)


@router.post("/admin/reset", response_model=SiteConfigResponse)
def admin_cms_reset(db: Session = Depends(get_db), _: None = Depends(verify_admin)):
    config = reset_site_config(db)
    return SiteConfigResponse(config=config, updated_at=datetime.now(timezone.utc).isoformat())
