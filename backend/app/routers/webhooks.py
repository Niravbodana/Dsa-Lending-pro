import hashlib
import hmac
import json

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import Lead, LoanApplication
from app.schemas_application import WebhookPayload
from app.services.application import send_notification, update_application_status

router = APIRouter(prefix="/webhooks", tags=["webhooks"])


def _verify_signature(body: bytes, signature: str | None) -> None:
    secret = settings.webhook_hmac_secret
    if settings.is_production:
        if not secret:
            raise HTTPException(status_code=503, detail="Webhook secret not configured")
    elif not secret:
        return

    if not signature:
        raise HTTPException(status_code=401, detail="Missing webhook signature")

    normalized = signature.removeprefix("sha256=").strip()
    expected = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, normalized):
        raise HTTPException(status_code=401, detail="Invalid webhook signature")


@router.post("/partner/status")
async def partner_status_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Partner lenders call this webhook to update application status.
    Requires X-Webhook-Signature: sha256=<hmac> when WEBHOOK_HMAC_SECRET is set.
    """
    body = await request.body()
    _verify_signature(body, request.headers.get("x-webhook-signature"))

    try:
        payload = WebhookPayload.model_validate(json.loads(body))
    except (json.JSONDecodeError, ValueError) as exc:
        raise HTTPException(status_code=400, detail="Invalid webhook payload") from exc

    app = (
        db.query(LoanApplication)
        .filter(LoanApplication.application_ref == payload.application_ref.upper())
        .first()
    )
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")

    if payload.partner_ref_id:
        app.partner_ref_id = payload.partner_ref_id

    if payload.status == "partner_submitted" and app.status == "partner_handoff":
        app.status = "submitted"

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
