from fastapi import APIRouter, Depends, HTTPException, Header, Request
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.schemas import (
    AuthMeResponse,
    LogoutResponse,
    SendOtpRequest,
    SendOtpResponse,
    VerifyOtpRequest,
    VerifyOtpResponse,
)
from app.services.consent import client_meta, record_consent
from app.services.journey import build_journey
from app.services.otp import create_session_token, get_mobile_from_token, revoke_session_token, send_otp, verify_otp
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
    db.commit()
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


def _token_from_header(authorization: str | None) -> str | None:
    if authorization and authorization.startswith("Bearer "):
        return authorization.removeprefix("Bearer ").strip() or None
    return None


@router.get("/me")
def api_me(authorization: str | None = Header(None), db: Session = Depends(get_db)):
    token = _token_from_header(authorization)
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    mobile = get_mobile_from_token(db, token)
    if not mobile:
        raise HTTPException(status_code=401, detail="Session expired")
    journey = build_journey(db, mobile)
    return {"mobile": mobile, "authenticated": True, "journey": journey}


@router.post("/logout", response_model=LogoutResponse)
def api_logout(authorization: str | None = Header(None), db: Session = Depends(get_db)):
    token = _token_from_header(authorization)
    if not token:
        return LogoutResponse(message="Already logged out", logged_out=True)
    revoke_session_token(db, token)
    return LogoutResponse(message="Logged out successfully", logged_out=True)
