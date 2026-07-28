from fastapi import APIRouter, Depends, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas_consent import (
    ConsentVersionsResponse,
    CookieConsentRequest,
    CookieConsentResponse,
)
from app.services.consent import CONSENT_VERSIONS, client_meta, record_consent

router = APIRouter(prefix="/consent", tags=["consent"])


@router.get("/versions", response_model=ConsentVersionsResponse)
def get_consent_versions():
    return ConsentVersionsResponse(versions=CONSENT_VERSIONS)


@router.post("/cookies", response_model=CookieConsentResponse)
def record_cookie_consent(payload: CookieConsentRequest, request: Request, db: Session = Depends(get_db)):
    ip, ua = client_meta(request)
    recorded: list[str] = []

    record_consent(
        db,
        consent_type="cookie_essential",
        accepted=payload.essential,
        page_url=payload.page_url,
        ip_address=ip,
        user_agent=ua,
    )
    recorded.append("cookie_essential")

    record_consent(
        db,
        consent_type="cookie_analytics",
        accepted=payload.analytics,
        page_url=payload.page_url,
        ip_address=ip,
        user_agent=ua,
    )
    recorded.append("cookie_analytics")

    db.commit()
    return CookieConsentResponse(message="Cookie preferences saved", recorded=recorded)
