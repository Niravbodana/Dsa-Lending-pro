"""Application helpers — ref generation, status updates, notifications, commission."""

import secrets
import string
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models import ApplicationStatusHistory, LoanApplication, NotificationLog

# Commission rates by loan amount slab (%)
COMMISSION_SLABS = [
    (100000, 0.015),
    (300000, 0.02),
    (500000, 0.025),
    (float("inf"), 0.03),
]

STATUS_FLOW = [
    "offer_selected",
    "kyc_pending",
    "kyc_completed",
    "partner_handoff",
    "submitted",
    "under_review",
    "approved",
    "disbursed",
    "rejected",
    "cancelled",
]


def generate_application_ref() -> str:
    suffix = "".join(secrets.choice(string.ascii_uppercase + string.digits) for _ in range(10))
    return f"NLR{suffix}"


def calculate_commission(loan_amount: int) -> float:
    for threshold, rate in COMMISSION_SLABS:
        if loan_amount <= threshold:
            return round(loan_amount * rate, 2)
    return round(loan_amount * 0.03, 2)


def add_status_history(
    db: Session,
    application_id: int,
    status: str,
    message: str | None = None,
    source: str = "system",
) -> None:
    db.add(
        ApplicationStatusHistory(
            application_id=application_id,
            status=status,
            message=message,
            source=source,
        )
    )


def update_application_status(
    db: Session,
    app: LoanApplication,
    new_status: str,
    message: str | None = None,
    source: str = "system",
) -> LoanApplication:
    app.status = new_status
    if new_status == "disbursed" and not app.disbursal_amount:
        app.disbursal_amount = app.loan_amount
        app.disbursal_date = datetime.now(timezone.utc)
        app.commission_amount = calculate_commission(app.loan_amount)
        from app.services.kfs import cooling_off_deadline

        if not app.cooling_off_until:
            app.cooling_off_until = cooling_off_deadline()
    add_status_history(db, app.id, new_status, message, source)
    db.commit()
    db.refresh(app)
    return app


def send_notification(db: Session, mobile: str, channel: str, template: str, message: str) -> None:
    db.add(
        NotificationLog(
            mobile=mobile,
            channel=channel,
            template=template,
            message=message,
        )
    )
    db.commit()


def mask_aadhaar(aadhaar: str) -> str:
    clean = aadhaar.replace(" ", "").replace("-", "")
    if len(clean) != 12:
        return "XXXX-XXXX-XXXX"
    return f"XXXX-XXXX-{clean[-4:]}"
