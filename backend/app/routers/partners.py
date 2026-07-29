"""Public lending partner pages — no secrets exposed."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import LendingPartner
from app.services.partner_fields import FIELD_CATALOG, parse_required_fields

router = APIRouter(prefix="/partners", tags=["partners"])


class PublicPartner(BaseModel):
    partner_id: str
    lender_name: str
    lender_logo: str
    page_slug: str
    page_title: str | None
    page_description: str | None
    mock_interest_rate: float
    mock_tenure_months: int
    mock_processing_fee: str
    mock_features: list[str]
    required_fields: list[dict[str, str]]


def _public_partner(row: LendingPartner) -> PublicPartner:
    import json

    fields = parse_required_fields(row.required_fields_json)
    return PublicPartner(
        partner_id=row.partner_id,
        lender_name=row.lender_name,
        lender_logo=row.lender_logo,
        page_slug=row.page_slug or row.partner_id,
        page_title=row.page_title,
        page_description=row.page_description,
        mock_interest_rate=row.mock_interest_rate,
        mock_tenure_months=row.mock_tenure_months,
        mock_processing_fee=row.mock_processing_fee,
        mock_features=json.loads(row.mock_features_json) if row.mock_features_json else [],
        required_fields=[
            {
                "key": key,
                "label": FIELD_CATALOG[key]["label"],
                "step": FIELD_CATALOG[key]["step"],
            }
            for key in fields
            if key in FIELD_CATALOG
        ],
    )


@router.get("", response_model=list[PublicPartner])
def list_public_partners(db: Session = Depends(get_db)):
    rows = (
        db.query(LendingPartner)
        .filter(LendingPartner.enabled.is_(True))
        .order_by(LendingPartner.sort_order.asc())
        .all()
    )
    return [_public_partner(row) for row in rows]


@router.get("/{slug}", response_model=PublicPartner)
def get_public_partner(slug: str, db: Session = Depends(get_db)):
    row = (
        db.query(LendingPartner)
        .filter(LendingPartner.enabled.is_(True))
        .filter((LendingPartner.page_slug == slug) | (LendingPartner.partner_id == slug))
        .first()
    )
    if not row:
        raise HTTPException(status_code=404, detail="Partner not found")
    return _public_partner(row)
