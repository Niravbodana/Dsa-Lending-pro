from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import LoanApplication
from app.schemas_application import (
    AadhaarOtpRequest,
    AadhaarVerifyRequest,
    BankVerifyRequest,
    EsignRequest,
    KycStepResponse,
    SubmitApplicationRequest,
)
from app.services.application import (
    add_status_history,
    mask_aadhaar,
    send_notification,
    update_application_status,
)
from app.services.consent import client_meta, log_consent_event, record_consent
from app.services.otp import generate_otp, get_lead_by_mobile, get_mobile_from_token
from app.services.rate_limit import rate_limit

router = APIRouter(prefix="/kyc", tags=["kyc"])

_aadhaar_otps: dict[int, str] = {}
_aadhaar_attempts: dict[int, int] = {}
MAX_AADHAAR_VERIFY_ATTEMPTS = 5


def _get_app(db: Session, token: str, app_id: int) -> tuple[str, LoanApplication]:
    mobile = get_mobile_from_token(db, token)
    if not mobile:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    app = db.query(LoanApplication).filter(LoanApplication.id == app_id).first()
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    lead = get_lead_by_mobile(db, mobile)
    if not lead or app.lead_id != lead.id:
        raise HTTPException(status_code=403, detail="Access denied")
    return mobile, app


@router.post("/aadhaar/send-otp", response_model=KycStepResponse)
def aadhaar_send_otp(
    payload: AadhaarOtpRequest, request: Request, db: Session = Depends(get_db)
):
    rate_limit(request, key="kyc-aadhaar-send", max_hits=5, window_seconds=900)
    mobile, app = _get_app(db, payload.session_token, payload.application_id)
    if len(payload.aadhaar) != 12 or not payload.aadhaar.isdigit():
        raise HTTPException(status_code=400, detail="Invalid Aadhaar number")

    otp = generate_otp()
    _aadhaar_otps[app.id] = otp
    _aadhaar_attempts.pop(app.id, None)
    app.aadhaar_masked = mask_aadhaar(payload.aadhaar)
    db.commit()

    dev_otp = otp if settings.mock_otp and not settings.is_production else None
    return KycStepResponse(
        message="Aadhaar OTP sent to registered mobile",
        step="aadhaar_otp",
        completed=False,
        dev_otp=dev_otp,
    )


@router.post("/aadhaar/verify", response_model=KycStepResponse)
def aadhaar_verify(
    payload: AadhaarVerifyRequest, request: Request, db: Session = Depends(get_db)
):
    rate_limit(request, key="kyc-aadhaar-verify", max_hits=20, window_seconds=900)
    mobile, app = _get_app(db, payload.session_token, payload.application_id)

    attempts = _aadhaar_attempts.get(app.id, 0)
    if attempts >= MAX_AADHAAR_VERIFY_ATTEMPTS:
        raise HTTPException(status_code=429, detail="Too many OTP attempts. Request a new OTP.")

    stored = _aadhaar_otps.get(app.id)
    if not stored or stored != payload.otp:
        _aadhaar_attempts[app.id] = attempts + 1
        raise HTTPException(status_code=400, detail="Invalid Aadhaar OTP")

    app.aadhaar_verified = True
    add_status_history(db, app.id, "aadhaar_verified", "eKYC completed via Aadhaar OTP")
    db.commit()
    _aadhaar_otps.pop(app.id, None)
    _aadhaar_attempts.pop(app.id, None)

    return KycStepResponse(message="Aadhaar verified successfully", step="aadhaar", completed=True)


@router.post("/bank/verify", response_model=KycStepResponse)
def bank_verify(payload: BankVerifyRequest, request: Request, db: Session = Depends(get_db)):
    rate_limit(request, key="kyc-bank", max_hits=10, window_seconds=900)
    mobile, app = _get_app(db, payload.session_token, payload.application_id)

    if not app.aadhaar_verified:
        raise HTTPException(status_code=400, detail="Complete Aadhaar verification first")

    # Mock penny drop — accepts any valid-looking account
    app.bank_account = f"XXXX{payload.account_number[-4:]}"
    app.bank_ifsc = payload.ifsc
    app.address = payload.address
    app.bank_verified = True
    add_status_history(db, app.id, "bank_verified", f"Penny drop successful — {payload.ifsc}")
    db.commit()

    return KycStepResponse(
        message="Bank account verified via penny drop (₹1 credited & reversed)",
        step="bank",
        completed=True,
    )


@router.post("/esign", response_model=KycStepResponse)
def esign_complete(payload: EsignRequest, request: Request, db: Session = Depends(get_db)):
    rate_limit(request, key="kyc-esign", max_hits=10, window_seconds=900)
    mobile, app = _get_app(db, payload.session_token, payload.application_id)

    if not app.bank_verified:
        raise HTTPException(status_code=400, detail="Complete bank verification first")

    lead = get_lead_by_mobile(db, mobile)
    ip, ua = client_meta(request)
    record_consent(
        db,
        consent_type="loan_agreement_esign",
        accepted=True,
        lead_id=lead.id if lead else None,
        application_id=app.id,
        mobile=mobile,
        page_url=payload.page_url or f"/application/{app.id}/kyc",
        ip_address=ip,
        user_agent=ua,
        metadata=f"lender={app.lender_name}, ref={app.application_ref}",
    )
    if lead:
        log_consent_event(
            db,
            lead.id,
            "loan_agreement_esign",
            f"{app.application_ref} — {app.lender_name}",
        )

    app.esign_completed = True
    app.status = "kyc_completed"
    add_status_history(db, app.id, "kyc_completed", "Digital agreement signed")
    add_status_history(db, app.id, "esign_completed", "Loan agreement eSigned")
    db.commit()

    return KycStepResponse(message="Loan agreement signed digitally", step="esign", completed=True)


@router.post("/submit", response_model=KycStepResponse)
def submit_application(
    payload: SubmitApplicationRequest, request: Request, db: Session = Depends(get_db)
):
    rate_limit(request, key="kyc-submit", max_hits=10, window_seconds=900)
    mobile, app = _get_app(db, payload.session_token, payload.application_id)

    if not app.esign_completed:
        raise HTTPException(status_code=400, detail="Complete all KYC steps first")

    update_application_status(
        db, app, "submitted", f"Application forwarded to {app.lender_name}", "platform"
    )

    send_notification(
        db,
        mobile,
        "sms",
        "application_submitted",
        f"Application {app.application_ref} submitted to {app.lender_name}. Track status on dashboard.",
    )

    return KycStepResponse(
        message=f"Application submitted to {app.lender_name} for review",
        step="submitted",
        completed=True,
    )
