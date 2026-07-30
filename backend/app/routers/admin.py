import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import AdminSession, BugReport, Lead, LendingPartner, LoanApplication, UserConsent
from app.schemas_admin import (
    AdminLoginRequest,
    AdminLoginResponse,
    AdminStatsResponse,
    ApplicationAdminResponse,
    ApplicationStatusUpdate,
    BugReportCreate,
    BugReportResponse,
    BugReportUpdate,
    LeadAdminResponse,
    LeadStatusUpdate,
    LendingPartnerCreate,
    LendingPartnerResponse,
    LendingPartnerUpdate,
    PartnerFieldCatalogItem,
)
from app.schemas_consent import ConsentRecordResponse
from app.services.application import update_application_status
from app.services.partner_fields import FIELD_CATALOG
from app.services.partner_secrets import encrypt_api_key
from app.services.partner_store import partner_admin_dict
from app.services.rate_limit import rate_limit

router = APIRouter(prefix="/admin", tags=["admin"])


def _purge_expired_admin_sessions(db: Session) -> None:
    now = datetime.now(timezone.utc)
    db.query(AdminSession).filter(AdminSession.expires_at < now).delete()
    db.commit()


def verify_admin(
    authorization: str | None = Header(None),
    db: Session = Depends(get_db),
) -> None:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Admin authentication required")
    token = authorization.removeprefix("Bearer ").strip()
    if not token:
        raise HTTPException(status_code=401, detail="Admin authentication required")

    _purge_expired_admin_sessions(db)
    session = db.query(AdminSession).filter(AdminSession.token == token).first()
    if not session:
        raise HTTPException(status_code=401, detail="Invalid or expired admin token")

    now = datetime.now(timezone.utc)
    expires = session.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if now > expires:
        db.delete(session)
        db.commit()
        raise HTTPException(status_code=401, detail="Admin session expired")


@router.post("/login", response_model=AdminLoginResponse)
def admin_login(payload: AdminLoginRequest, request: Request, db: Session = Depends(get_db)):
    rate_limit(request, key="admin-login", max_hits=10, window_seconds=900)

    if payload.password.strip() != settings.admin_password:
        raise HTTPException(status_code=401, detail="Invalid admin password")

    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=settings.admin_session_hours)
    db.add(AdminSession(token=token, expires_at=expires_at))
    db.commit()
    return AdminLoginResponse(token=token, message="Admin login successful")


@router.post("/logout")
def admin_logout(
    authorization: str | None = Header(None),
    db: Session = Depends(get_db),
):
    if authorization and authorization.startswith("Bearer "):
        token = authorization.removeprefix("Bearer ").strip()
        db.query(AdminSession).filter(AdminSession.token == token).delete()
        db.commit()
    return {"message": "Logged out"}


@router.get("/stats", response_model=AdminStatsResponse)
def get_stats(db: Session = Depends(get_db), _: None = Depends(verify_admin)):
    total = db.query(func.count(Lead.id)).scalar() or 0
    otp_verified = db.query(func.count(Lead.id)).filter(Lead.status == "otp_verified").scalar() or 0
    details_submitted = (
        db.query(func.count(Lead.id)).filter(Lead.status == "details_submitted").scalar() or 0
    )
    offers_fetched = (
        db.query(func.count(Lead.id)).filter(Lead.status == "offers_fetched").scalar() or 0
    )
    offer_selected = (
        db.query(func.count(Lead.id)).filter(Lead.status == "offer_selected").scalar() or 0
    )
    open_bugs = (
        db.query(func.count(BugReport.id))
        .filter(BugReport.status.in_(["open", "in_progress"]))
        .scalar()
        or 0
    )
    fixed_bugs = (
        db.query(func.count(BugReport.id)).filter(BugReport.status == "fixed").scalar() or 0
    )
    total_bugs = db.query(func.count(BugReport.id)).scalar() or 0
    conversion = round((offer_selected / total * 100) if total else 0, 1)

    total_apps = db.query(func.count(LoanApplication.id)).scalar() or 0
    disbursed_count = (
        db.query(func.count(LoanApplication.id))
        .filter(LoanApplication.status == "disbursed")
        .scalar()
        or 0
    )
    total_disbursed = (
        db.query(func.sum(LoanApplication.disbursal_amount))
        .filter(LoanApplication.status == "disbursed")
        .scalar()
        or 0
    )
    total_commission = (
        db.query(func.sum(LoanApplication.commission_amount))
        .filter(LoanApplication.commission_amount.isnot(None))
        .scalar()
        or 0
    )

    return AdminStatsResponse(
        total_leads=total,
        otp_verified=otp_verified,
        details_submitted=details_submitted,
        offers_fetched=offers_fetched,
        offer_selected=offer_selected,
        open_bugs=open_bugs,
        fixed_bugs=fixed_bugs,
        total_bugs=total_bugs,
        conversion_rate=conversion,
        total_applications=total_apps,
        disbursed_count=disbursed_count,
        total_disbursed=int(total_disbursed),
        total_commission=float(total_commission),
    )


@router.get("/leads", response_model=list[LeadAdminResponse])
def list_leads(db: Session = Depends(get_db), _: None = Depends(verify_admin)):
    return db.query(Lead).order_by(Lead.created_at.desc()).all()


@router.patch("/leads/{lead_id}", response_model=LeadAdminResponse)
def update_lead_status(
    lead_id: int,
    payload: LeadStatusUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin),
):
    lead = db.query(Lead).filter(Lead.id == lead_id).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    lead.status = payload.status
    db.commit()
    db.refresh(lead)
    return lead


@router.get("/bugs", response_model=list[BugReportResponse])
def list_bugs(db: Session = Depends(get_db), _: None = Depends(verify_admin)):
    return db.query(BugReport).order_by(BugReport.created_at.desc()).all()


@router.post("/bugs", response_model=BugReportResponse)
def create_bug(payload: BugReportCreate, request: Request, db: Session = Depends(get_db)):
    rate_limit(request, key="bug-report", max_hits=10, window_seconds=3600)
    bug = BugReport(
        title=payload.title[:200],
        description=payload.description[:5000],
        severity=payload.severity,
        page_url=payload.page_url,
        reported_by=payload.reported_by,
        status="open",
    )
    db.add(bug)
    db.commit()
    db.refresh(bug)
    return bug


@router.patch("/bugs/{bug_id}", response_model=BugReportResponse)
def update_bug(
    bug_id: int,
    payload: BugReportUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin),
):
    bug = db.query(BugReport).filter(BugReport.id == bug_id).first()
    if not bug:
        raise HTTPException(status_code=404, detail="Bug not found")

    if payload.status is not None:
        bug.status = payload.status
        if payload.status == "fixed":
            bug.fixed_at = datetime.now(timezone.utc)
    if payload.severity is not None:
        bug.severity = payload.severity
    if payload.fix_notes is not None:
        bug.fix_notes = payload.fix_notes

    db.commit()
    db.refresh(bug)
    return bug


@router.delete("/bugs/{bug_id}")
def delete_bug(
    bug_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin),
):
    bug = db.query(BugReport).filter(BugReport.id == bug_id).first()
    if not bug:
        raise HTTPException(status_code=404, detail="Bug not found")
    db.delete(bug)
    db.commit()
    return {"message": "Bug deleted"}


@router.get("/applications", response_model=list[ApplicationAdminResponse])
def list_applications(db: Session = Depends(get_db), _: None = Depends(verify_admin)):
    return db.query(LoanApplication).order_by(LoanApplication.created_at.desc()).all()


@router.patch("/applications/{app_id}", response_model=ApplicationAdminResponse)
def update_application(
    app_id: int,
    payload: ApplicationStatusUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin),
):
    app = db.query(LoanApplication).filter(LoanApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    update_application_status(db, app, payload.status, payload.message, source="admin")
    return app


@router.get("/consents", response_model=list[ConsentRecordResponse])
def list_consents(
    lead_id: int | None = None,
    mobile: str | None = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin),
):
    q = db.query(UserConsent).order_by(UserConsent.created_at.desc())
    if lead_id is not None:
        q = q.filter(UserConsent.lead_id == lead_id)
    if mobile:
        q = q.filter(UserConsent.mobile == mobile)
    return q.limit(min(limit, 500)).all()


@router.get("/partners/field-catalog", response_model=list[PartnerFieldCatalogItem])
def partner_field_catalog(_: None = Depends(verify_admin)):
    return [
        PartnerFieldCatalogItem(key=key, label=meta["label"], step=meta["step"], type=meta["type"])
        for key, meta in FIELD_CATALOG.items()
    ]


@router.get("/partners", response_model=list[LendingPartnerResponse])
def list_partners(db: Session = Depends(get_db), _: None = Depends(verify_admin)):
    rows = db.query(LendingPartner).order_by(LendingPartner.sort_order.asc()).all()
    return [LendingPartnerResponse(**partner_admin_dict(row)) for row in rows]


@router.post("/partners", response_model=LendingPartnerResponse)
def create_partner(
    payload: LendingPartnerCreate,
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin),
):
    import json

    if db.query(LendingPartner).filter(LendingPartner.partner_id == payload.partner_id).first():
        raise HTTPException(status_code=400, detail="Partner ID already exists")

    row = LendingPartner(
        partner_id=payload.partner_id,
        lender_name=payload.lender_name,
        lender_logo=payload.lender_logo.upper(),
        api_url=payload.api_url,
        api_key_encrypted=encrypt_api_key(payload.api_key) if payload.api_key else None,
        webhook_url=payload.webhook_url,
        enabled=payload.enabled,
        sort_order=payload.sort_order,
        required_fields_json=json.dumps(payload.required_fields),
        mock_interest_rate=payload.mock_interest_rate,
        mock_tenure_months=payload.mock_tenure_months,
        mock_processing_fee=payload.mock_processing_fee,
        mock_features_json=json.dumps(payload.mock_features),
        mock_amount_offset=payload.mock_amount_offset,
        page_slug=payload.page_slug or payload.partner_id,
        page_title=payload.page_title or f"{payload.lender_name} Personal Loans",
        page_description=payload.page_description,
        offers_endpoint_path=payload.offers_endpoint_path,
        auth_header_name=payload.auth_header_name,
        auth_type=payload.auth_type,
        timeout_seconds=payload.timeout_seconds,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return LendingPartnerResponse(**partner_admin_dict(row))


@router.patch("/partners/{partner_db_id}", response_model=LendingPartnerResponse)
def update_partner(
    partner_db_id: int,
    payload: LendingPartnerUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin),
):
    import json

    row = db.query(LendingPartner).filter(LendingPartner.id == partner_db_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Partner not found")

    data = payload.model_dump(exclude_unset=True)
    if "api_key" in data:
        api_key = data.pop("api_key")
        if api_key:
            row.api_key_encrypted = encrypt_api_key(api_key)
    if "required_fields" in data:
        row.required_fields_json = json.dumps(data.pop("required_fields"))
    if "mock_features" in data:
        row.mock_features_json = json.dumps(data.pop("mock_features"))

    for key, value in data.items():
        if key == "lender_logo" and value:
            setattr(row, key, value.upper())
        else:
            setattr(row, key, value)

    db.commit()
    db.refresh(row)
    return LendingPartnerResponse(**partner_admin_dict(row))


@router.delete("/partners/{partner_db_id}")
def delete_partner(
    partner_db_id: int,
    db: Session = Depends(get_db),
    _: None = Depends(verify_admin),
):
    row = db.query(LendingPartner).filter(LendingPartner.id == partner_db_id).first()
    if not row:
        raise HTTPException(status_code=404, detail="Partner not found")
    db.delete(row)
    db.commit()
    return {"message": "Partner deleted"}
