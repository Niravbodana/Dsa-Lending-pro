"""DPDP data subject rights — export and erasure requests."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.models import ApplicationLog, Lead, LoanApplication, UserConsent


def export_customer_data(db: Session, mobile: str) -> dict:
    lead = db.query(Lead).filter(Lead.mobile == mobile).order_by(Lead.created_at.desc()).first()
    if not lead:
        return {"mobile": mobile, "lead": None, "applications": [], "consents": []}

    apps = db.query(LoanApplication).filter(LoanApplication.lead_id == lead.id).all()
    consents = (
        db.query(UserConsent)
        .filter((UserConsent.lead_id == lead.id) | (UserConsent.mobile == mobile))
        .order_by(UserConsent.created_at.desc())
        .limit(200)
        .all()
    )

    return {
        "mobile": mobile,
        "exported_at": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
        "lead": {
            "id": lead.id,
            "full_name": lead.full_name,
            "city": lead.city,
            "status": lead.status,
            "eligibility_score": lead.eligibility_score,
            "max_loan_amount": lead.max_loan_amount,
            "created_at": lead.created_at.isoformat() if lead.created_at else None,
        },
        "applications": [
            {
                "application_ref": a.application_ref,
                "lender_name": a.lender_name,
                "loan_amount": a.loan_amount,
                "status": a.status,
                "workflow_mode": getattr(a, "workflow_mode", "internal"),
                "created_at": a.created_at.isoformat() if a.created_at else None,
            }
            for a in apps
        ],
        "consents": [
            {
                "consent_type": c.consent_type,
                "consent_version": c.consent_version,
                "accepted": c.accepted,
                "created_at": c.created_at.isoformat() if c.created_at else None,
            }
            for c in consents
        ],
    }


def request_data_deletion(db: Session, mobile: str) -> dict:
    lead = db.query(Lead).filter(Lead.mobile == mobile).order_by(Lead.created_at.desc()).first()
    if not lead:
        return {"message": "No data found for this mobile", "requested": False}

    active = (
        db.query(LoanApplication)
        .filter(
            LoanApplication.lead_id == lead.id,
            LoanApplication.status.in_(("submitted", "under_review", "approved", "kyc_pending", "partner_handoff")),
        )
        .count()
    )
    if active > 0:
        return {
            "message": "Active loan applications exist — deletion will be processed after closure per RBI retention rules.",
            "requested": True,
            "status": "deferred",
        }

    lead.full_name = "DELETED"
    lead.pan = None
    lead.email = None
    lead.city = "REDACTED"
    lead.status = "deletion_requested"
    db.add(
        ApplicationLog(
            lead_id=lead.id,
            event="dpdp_deletion_requested",
            details="Customer requested data erasure via privacy API",
        )
    )
    db.commit()
    return {
        "message": "Your data deletion request has been recorded. PII will be purged within 30 days per DPDP Act.",
        "requested": True,
        "status": "queued",
    }
