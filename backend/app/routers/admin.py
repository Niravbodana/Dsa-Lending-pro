import hashlib
import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import BugReport, Lead, LoanApplication, UserConsent
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
)
from app.schemas_consent import ConsentRecordResponse

from app.services.application import update_application_status

router = APIRouter(prefix="/admin", tags=["admin"])

_admin_tokens: set[str] = set()


def _admin_token(password: str) -> str:
    return hashlib.sha256(f"admin:{password}:{settings.secret_key}".encode()).hexdigest()


def verify_admin(authorization: str | None = Header(None)) -> None:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Admin authentication required")
    token = authorization.removeprefix("Bearer ")
    if token not in _admin_tokens:
        raise HTTPException(status_code=401, detail="Invalid admin token")


@router.post("/login", response_model=AdminLoginResponse)
def admin_login(payload: AdminLoginRequest):
    if payload.password != settings.admin_password:
        raise HTTPException(status_code=401, detail="Invalid admin password")
    token = secrets.token_urlsafe(32)
    _admin_tokens.add(token)
    return AdminLoginResponse(token=token, message="Admin login successful")


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
def create_bug(payload: BugReportCreate, db: Session = Depends(get_db)):
    bug = BugReport(
        title=payload.title,
        description=payload.description,
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
