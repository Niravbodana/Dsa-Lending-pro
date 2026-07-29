from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.schemas import SendOtpRequest, SendOtpResponse, VerifyOtpRequest, VerifyOtpResponse
from app.services.consent import client_meta, record_consent
from app.services.otp import create_session_token, send_otp, verify_otp
from app.services.rate_limit import rate_limit, rate_limit_key

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/send-otp", response_model=SendOtpResponse)
def api_send_otp(payload: SendOtpRequest, request: Request, db: Session = Depends(get_db)):
    rate_limit(request, key="send-otp", max_hits=5, window_seconds=3600)
    rate_limit_key(f"send-otp:{payload.mobile}", max_hits=3, window_seconds=3600)

    ip, ua = client_meta(request)
    record_consent(
        db,
        consent_type="sms_otp",
        accepted=True,
        mobile=payload.mobile,
        page_url="/apply",
        ip_address=ip,
        user_agent=ua,
    )
    dev_otp, expires_in = send_otp(db, payload.mobile)
    return SendOtpResponse(
        message="OTP sent successfully",
        expires_in=expires_in,
        dev_otp=dev_otp,
    )


@router.post("/verify-otp", response_model=VerifyOtpResponse)
def api_verify_otp(payload: VerifyOtpRequest, request: Request, db: Session = Depends(get_db)):
    rate_limit(request, key="verify-otp", max_hits=20, window_seconds=900)
    rate_limit_key(f"verify-otp:{payload.mobile}", max_hits=5, window_seconds=900)

    if not verify_otp(db, payload.mobile, payload.otp):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    token = create_session_token(db, payload.mobile)
    return VerifyOtpResponse(
        message="OTP verified successfully",
        verified=True,
        session_token=token,
    )
