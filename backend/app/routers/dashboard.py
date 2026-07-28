import math

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ApplicationStatusHistory, Lead, LoanApplication
from app.schemas_application import (
    ApplicationDetailResponse,
    ApplicationResponse,
    DashboardProfile,
    EmiScheduleItem,
    StatusTimelineItem,
)
from app.services.otp import get_lead_by_mobile, get_mobile_from_token

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def _auth(db: Session, token: str) -> str:
    mobile = get_mobile_from_token(db, token)
    if not mobile:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    return mobile


@router.get("/profile", response_model=DashboardProfile)
def get_profile(session_token: str, db: Session = Depends(get_db)):
    mobile = _auth(db, session_token)
    lead = get_lead_by_mobile(db, mobile)
    apps = (
        db.query(LoanApplication)
        .join(Lead, LoanApplication.lead_id == Lead.id)
        .filter(Lead.mobile == mobile)
        .all()
    )
    active = [a for a in apps if a.status not in ("disbursed", "rejected")]
    disbursed = sum(a.disbursal_amount or 0 for a in apps if a.status == "disbursed")

    return DashboardProfile(
        mobile=mobile,
        full_name=lead.full_name if lead else None,
        city=lead.city if lead else None,
        total_applications=len(apps),
        active_applications=len(active),
        disbursed_amount=disbursed,
    )


@router.get("/applications", response_model=list[ApplicationResponse])
def list_applications(session_token: str, db: Session = Depends(get_db)):
    mobile = _auth(db, session_token)
    lead = get_lead_by_mobile(db, mobile)
    if not lead:
        return []
    apps = (
        db.query(LoanApplication)
        .filter(LoanApplication.lead_id == lead.id)
        .order_by(LoanApplication.created_at.desc())
        .all()
    )
    return apps


@router.get("/applications/{app_id}", response_model=ApplicationDetailResponse)
def get_application(app_id: int, session_token: str, db: Session = Depends(get_db)):
    mobile = _auth(db, session_token)
    lead = get_lead_by_mobile(db, mobile)
    app = db.query(LoanApplication).filter(LoanApplication.id == app_id).first()
    if not app or not lead or app.lead_id != lead.id:
        raise HTTPException(status_code=404, detail="Application not found")

    timeline = (
        db.query(ApplicationStatusHistory)
        .filter(ApplicationStatusHistory.application_id == app_id)
        .order_by(ApplicationStatusHistory.created_at.asc())
        .all()
    )

    return ApplicationDetailResponse(
        application=ApplicationResponse.model_validate(app),
        timeline=[StatusTimelineItem.model_validate(t) for t in timeline],
        lead_name=lead.full_name,
        lead_mobile=lead.mobile,
    )


@router.get("/applications/{app_id}/emi-schedule", response_model=list[EmiScheduleItem])
def get_emi_schedule(app_id: int, session_token: str, db: Session = Depends(get_db)):
    mobile = _auth(db, session_token)
    lead = get_lead_by_mobile(db, mobile)
    app = db.query(LoanApplication).filter(LoanApplication.id == app_id).first()
    if not app or not lead or app.lead_id != lead.id:
        raise HTTPException(status_code=404, detail="Application not found")

    principal = app.loan_amount
    rate = app.interest_rate / 12 / 100
    tenure = app.tenure_months
    emi = app.emi
    balance = principal
    schedule: list[EmiScheduleItem] = []

    for month in range(1, tenure + 1):
        interest = math.ceil(balance * rate)
        principal_part = emi - interest
        balance = max(0, balance - principal_part)
        schedule.append(
            EmiScheduleItem(
                month=month,
                emi=emi,
                principal=principal_part,
                interest=interest,
                balance=balance,
            )
        )

    return schedule


@router.get("/track/{application_ref}", response_model=ApplicationDetailResponse)
def track_by_ref(application_ref: str, mobile: str, db: Session = Depends(get_db)):
    """Public track — mobile + application ref, no session needed."""
    app = db.query(LoanApplication).filter(LoanApplication.application_ref == application_ref.upper()).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    lead = db.query(Lead).filter(Lead.id == app.lead_id).first()
    if not lead or lead.mobile != mobile:
        raise HTTPException(status_code=403, detail="Mobile number does not match")

    timeline = (
        db.query(ApplicationStatusHistory)
        .filter(ApplicationStatusHistory.application_id == app.id)
        .order_by(ApplicationStatusHistory.created_at.asc())
        .all()
    )

    return ApplicationDetailResponse(
        application=ApplicationResponse.model_validate(app),
        timeline=[StatusTimelineItem.model_validate(t) for t in timeline],
        lead_name=lead.full_name,
        lead_mobile=lead.mobile,
    )
