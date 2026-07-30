"""Customer journey state — resume apply/KYC from server-side lead data."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.models import Lead, LoanApplication

# Apply funnel steps
APPLY_STEPS = ("mobile", "otp", "details", "offers")
# Full end-to-end workflow (MoneyView / Navi style)
WORKFLOW_STEPS = (
    {"id": "mobile", "label": "Mobile", "phase": "apply"},
    {"id": "otp", "label": "Verify OTP", "phase": "apply"},
    {"id": "details", "label": "Profile", "phase": "apply"},
    {"id": "offers", "label": "Offers", "phase": "apply"},
    {"id": "kyc", "label": "KYC", "phase": "kyc"},
    {"id": "bank", "label": "Bank", "phase": "kyc"},
    {"id": "esign", "label": "eSign", "phase": "kyc"},
    {"id": "submit", "label": "Submit", "phase": "kyc"},
    {"id": "review", "label": "Review", "phase": "lender"},
    {"id": "disbursal", "label": "Disbursal", "phase": "lender"},
)

_STATUS_TO_APPLY_STEP: dict[str, str] = {
    "otp_verified": "details",
    "details_submitted": "details",
    "not_eligible": "details",
    "eligibility_checked": "offers",
    "offers_fetched": "offers",
    "offer_selected": "offers",
}


def _latest_application(db: Session, lead_id: int) -> LoanApplication | None:
    return (
        db.query(LoanApplication)
        .filter(LoanApplication.lead_id == lead_id)
        .order_by(LoanApplication.id.desc())
        .first()
    )


def _kyc_step(app: LoanApplication) -> str:
    if app.status == "partner_handoff":
        return "done"
    if app.status in ("submitted", "under_review", "approved", "disbursed", "rejected"):
        return "done"
    if not app.aadhaar_verified:
        return "aadhaar"
    if not app.bank_verified:
        return "bank"
    if not getattr(app, "kfs_accepted", False):
        return "kfs"
    if not app.esign_completed:
        return "esign"
    return "submit"


def _workflow_current_step(lead: Lead | None, app: LoanApplication | None) -> str:
    if not lead:
        return "mobile"
    if app:
        if app.status == "disbursed":
            return "disbursal"
        if app.status == "partner_handoff":
            return "kyc"
        if app.status in ("submitted", "under_review", "approved"):
            return "review"
        kyc = _kyc_step(app)
        if kyc == "done":
            return "review"
        if kyc == "aadhaar":
            return "kyc"
        if kyc == "kfs":
            return "esign"
        return kyc
    return _STATUS_TO_APPLY_STEP.get(lead.status, "details")


def build_journey(db: Session, mobile: str | None) -> dict:
    if not mobile:
        return {
            "authenticated": False,
            "next_step": "mobile",
            "apply_step": "mobile",
            "workflow_step": "mobile",
            "workflow": WORKFLOW_STEPS,
            "lead": None,
            "application": None,
            "can_resume": False,
        }

    lead = db.query(Lead).filter(Lead.mobile == mobile).first()
    if not lead:
        return {
            "authenticated": True,
            "next_step": "details",
            "apply_step": "details",
            "workflow_step": "details",
            "workflow": WORKFLOW_STEPS,
            "lead": {"mobile": mobile},
            "application": None,
            "can_resume": True,
        }

    app = _latest_application(db, lead.id)
    workflow_step = _workflow_current_step(lead, app)

    # Route user to correct page
    if app and app.status == "partner_handoff":
        slug = getattr(app, "partner_slug", None) or "choiceconnect"
        next_step = f"/apply/partner/{slug}/handoff"
        apply_step = "offers"
    elif app and app.status in ("kyc_pending", "kyc_completed") and _kyc_step(app) != "done":
        next_step = "kyc"
        apply_step = "offers"
    elif app and app.status in ("submitted", "under_review", "approved", "disbursed", "rejected"):
        next_step = "dashboard"
        apply_step = "offers"
    elif lead.status in ("eligibility_checked", "offers_fetched"):
        next_step = "offers"
        apply_step = "offers"
    elif lead.status == "otp_verified":
        next_step = "details"
        apply_step = "details"
    elif lead.status in ("details_submitted", "not_eligible"):
        next_step = "details"
        apply_step = "details"
    else:
        next_step = _STATUS_TO_APPLY_STEP.get(lead.status, "details")
        apply_step = next_step

    lead_data = {
        "id": lead.id,
        "mobile": lead.mobile,
        "full_name": lead.full_name,
        "pan": lead.pan,
        "monthly_income": lead.monthly_income,
        "employment_type": lead.employment_type,
        "city": lead.city,
        "date_of_birth": lead.date_of_birth,
        "email": lead.email,
        "pincode": lead.pincode,
        "gender": lead.gender,
        "loan_purpose": lead.loan_purpose,
        "existing_emi": lead.existing_emi,
        "status": lead.status,
        "eligibility_score": lead.eligibility_score,
        "max_loan_amount": lead.max_loan_amount,
        "preferred_partner_slug": getattr(lead, "preferred_partner_slug", None),
        "selected_lender": lead.selected_lender,
    }

    app_data = None
    if app:
        app_data = {
            "id": app.id,
            "application_ref": app.application_ref,
            "lender_name": app.lender_name,
            "status": app.status,
            "loan_amount": app.loan_amount,
            "interest_rate": app.interest_rate,
            "tenure_months": app.tenure_months,
            "emi": app.emi,
            "aadhaar_verified": app.aadhaar_verified,
            "bank_verified": app.bank_verified,
            "esign_completed": app.esign_completed,
            "kyc_step": _kyc_step(app),
        }

    return {
        "authenticated": True,
        "next_step": next_step,
        "apply_step": apply_step,
        "workflow_step": workflow_step,
        "workflow": WORKFLOW_STEPS,
        "lead": lead_data,
        "application": app_data,
        "can_resume": lead.status != "otp_verified" or bool(lead.full_name),
    }
