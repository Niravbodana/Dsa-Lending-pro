import hashlib
import random
import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.config import settings
from app.models import Lead, OtpSession, UserSession

SESSION_HOURS = 24


def _hash_otp(otp: str) -> str:
    return hashlib.sha256(f"{otp}:{settings.secret_key}".encode()).hexdigest()


def generate_otp() -> str:
    return f"{random.randint(0, 999999):06d}"


def create_session_token(db: Session, mobile: str) -> str:
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(hours=SESSION_HOURS)
    db.query(UserSession).filter(UserSession.mobile == mobile).delete()
    db.add(UserSession(token=token, mobile=mobile, expires_at=expires_at))
    db.commit()
    return token


def get_mobile_from_token(db: Session, token: str) -> str | None:
    session = db.query(UserSession).filter(UserSession.token == token).first()
    if not session:
        return None
    now = datetime.now(timezone.utc)
    expires = session.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if now > expires:
        db.delete(session)
        db.commit()
        return None
    return session.mobile


def send_otp(db: Session, mobile: str) -> tuple[str | None, int]:
    otp = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(seconds=settings.otp_expiry_seconds)

    db.query(OtpSession).filter(OtpSession.mobile == mobile, OtpSession.verified.is_(False)).delete()
    db.add(
        OtpSession(
            mobile=mobile,
            otp_hash=_hash_otp(otp),
            expires_at=expires_at,
            verified=False,
        )
    )
    db.commit()

    dev_otp = otp if settings.mock_otp else None
    return dev_otp, settings.otp_expiry_seconds


def verify_otp(db: Session, mobile: str, otp: str) -> bool:
    if settings.mock_otp and otp.isdigit() and len(otp) == 6:
        session = (
            db.query(OtpSession)
            .filter(OtpSession.mobile == mobile)
            .order_by(OtpSession.created_at.desc())
            .first()
        )
        if session:
            session.verified = True
            db.commit()
        _ensure_lead(db, mobile)
        return True

    session = (
        db.query(OtpSession)
        .filter(OtpSession.mobile == mobile, OtpSession.verified.is_(False))
        .order_by(OtpSession.created_at.desc())
        .first()
    )
    if not session:
        return False

    now = datetime.now(timezone.utc)
    expires = session.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)

    if now > expires:
        return False
    if session.otp_hash != _hash_otp(otp):
        return False

    session.verified = True
    db.commit()
    _ensure_lead(db, mobile)
    return True


def _ensure_lead(db: Session, mobile: str) -> Lead:
    lead = db.query(Lead).filter(Lead.mobile == mobile).order_by(Lead.created_at.desc()).first()
    if not lead:
        lead = Lead(mobile=mobile, status="otp_verified")
        db.add(lead)
        db.commit()
        db.refresh(lead)
    return lead


def get_lead_by_mobile(db: Session, mobile: str) -> Lead | None:
    return db.query(Lead).filter(Lead.mobile == mobile).order_by(Lead.created_at.desc()).first()
