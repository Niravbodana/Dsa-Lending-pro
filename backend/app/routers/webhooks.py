from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import LoanApplication
from app.schemas_application import WebhookPayload
from app.services.application import send_notification, update_application_status

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


@router.post("/partner/status")
def partner_status_webhook(payload: WebhookPayload, db: Session = Depends(get_db)):
    """
    Partner lenders call this webhook to update application status.
    In production, verify HMAC signature from partner.
    """
    app = (
        db.query(LoanApplication)
        .filter(LoanApplication.application_ref == payload.application_ref.upper())
        .first()
    )
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if payload.partner_ref_id:
        app.partner_ref_id = payload.partner_ref_id

    update_application_status(
        db,
        app,
        payload.status,
        payload.message or f"Status updated by {app.lender_name}",
        source="partner_webhook",
    )

    if payload.disbursal_amount:
        app.disbursal_amount = payload.disbursal_amount
        db.commit()

    from app.models import Lead

    lead = db.query(Lead).filter(Lead.id == app.lead_id).first()
    if lead:
        send_notification(
            db,
            lead.mobile,
            "sms",
            f"status_{payload.status}",
            f"Loan {app.application_ref}: {payload.message or payload.status}",
        )

    return {"message": "Status updated", "application_ref": app.application_ref, "status": app.status}
