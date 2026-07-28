"""Legal consent recording — DPDP Act 2023 & RBI LSP compliance."""

from __future__ import annotations

from fastapi import Request
from sqlalchemy.orm import Session

from app.models import ApplicationLog, UserConsent

# Bump version when policy text changes; stored on each consent record.
CONSENT_VERSIONS: dict[str, str] = {
    "privacy_policy": "2026.1",
    "terms_of_service": "2026.1",
    "dpdp_data_processing": "2026.1",
    "credit_bureau_check": "2026.1",
    "marketing_communications": "2026.1",
    "sms_otp": "2026.1",
    "lender_data_sharing": "2026.1",
    "loan_agreement_esign": "2026.1",
    "cookie_essential": "2026.1",
    "cookie_analytics": "2026.1",
}


def client_meta(request: Request | None) -> tuple[str | None, str | None]:
    if not request:
        return None, None
    ip = request.client.host if request.client else None
    ua = request.headers.get("user-agent")
    if ua and len(ua) > 500:
        ua = ua[:500]
    return ip, ua


def record_consent(
    db: Session,
    *,
    consent_type: str,
    accepted: bool,
    consent_version: str | None = None,
    lead_id: int | None = None,
    application_id: int | None = None,
    mobile: str | None = None,
    page_url: str | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
    metadata: str | None = None,
) -> UserConsent:
    version = consent_version or CONSENT_VERSIONS.get(consent_type, "2026.1")
    row = UserConsent(
        lead_id=lead_id,
        application_id=application_id,
        mobile=mobile,
        consent_type=consent_type,
        consent_version=version,
        accepted=accepted,
        page_url=page_url,
        ip_address=ip_address,
        user_agent=user_agent,
        metadata_json=metadata,
    )
    db.add(row)
    return row


def record_consent_bundle(
    db: Session,
    *,
    mobile: str,
    lead_id: int | None,
    application_id: int | None,
    consents: dict[str, bool],
    page_url: str | None,
    request: Request | None = None,
    metadata: str | None = None,
) -> list[UserConsent]:
    ip, ua = client_meta(request)
    rows: list[UserConsent] = []
    for consent_type, accepted in consents.items():
        if consent_type not in CONSENT_VERSIONS:
            continue
        rows.append(
            record_consent(
                db,
                consent_type=consent_type,
                accepted=accepted,
                lead_id=lead_id,
                application_id=application_id,
                mobile=mobile,
                page_url=page_url,
                ip_address=ip,
                user_agent=ua,
                metadata=metadata,
            )
        )
    return rows


def log_consent_event(db: Session, lead_id: int, event: str, details: str) -> None:
    db.add(ApplicationLog(lead_id=lead_id, event=event, details=details))
