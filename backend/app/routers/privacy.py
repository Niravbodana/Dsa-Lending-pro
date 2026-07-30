"""DPDP data subject rights API."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps.session import get_session_token
from app.services.otp import get_mobile_from_token
from app.services.privacy import export_customer_data, request_data_deletion

router = APIRouter(prefix="/privacy", tags=["privacy"])


def _mobile(db: Session, token: str) -> str:
    mobile = get_mobile_from_token(db, token)
    if not mobile:
        from fastapi import HTTPException

        raise HTTPException(status_code=401, detail="Invalid or expired session")
    return mobile


@router.get("/export")
def export_my_data(session_token: str = Depends(get_session_token), db: Session = Depends(get_db)):
    """DPDP — download all data associated with your account."""
    mobile = _mobile(db, session_token)
    return export_customer_data(db, mobile)


@router.post("/delete-request")
def delete_my_data(session_token: str = Depends(get_session_token), db: Session = Depends(get_db)):
    """DPDP — request erasure of personal data."""
    mobile = _mobile(db, session_token)
    return request_data_deletion(db, mobile)
