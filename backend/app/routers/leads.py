from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ApplicationLog, Lead
from app.schemas import (
    LeadDetailsRequest,
    LeadResponse,
    OffersResponse,
    SelectOfferRequest,
    SelectOfferResponse,
)
from app.services.lender import fetch_partner_offers
from app.services.otp import get_lead_by_mobile, get_mobile_from_token

router = APIRouter(prefix="/leads", tags=["leads"])


@router.post("/details", response_model=LeadResponse)
def save_lead_details(payload: LeadDetailsRequest, db: Session = Depends(get_db)):
    mobile = get_mobile_from_token(payload.session_token)
    if not mobile:
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    lead = get_lead_by_mobile(db, mobile)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    lead.full_name = payload.full_name
    lead.pan = payload.pan
    lead.monthly_income = payload.monthly_income
    lead.employment_type = payload.employment_type
    lead.city = payload.city
    lead.status = "details_submitted"
    db.add(ApplicationLog(lead_id=lead.id, event="details_submitted", details=payload.city))
    db.commit()
    db.refresh(lead)
    return lead


@router.get("/offers", response_model=OffersResponse)
def get_offers(session_token: str, db: Session = Depends(get_db)):
    mobile = get_mobile_from_token(session_token)
    if not mobile:
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    lead = get_lead_by_mobile(db, mobile)
    if not lead or not lead.monthly_income:
        raise HTTPException(status_code=400, detail="Please submit your details first")

    offers = fetch_partner_offers(
        monthly_income=lead.monthly_income,
        employment_type=lead.employment_type or "salaried",
        city=lead.city or "Mumbai",
    )
    lead.status = "offers_fetched"
    db.add(ApplicationLog(lead_id=lead.id, event="offers_fetched", details=f"{len(offers)} offers"))
    db.commit()

    return OffersResponse(
        lead_id=lead.id,
        offers=offers,
        message="Best offers from our partner lenders",
    )


@router.post("/select-offer", response_model=SelectOfferResponse)
def select_offer(payload: SelectOfferRequest, db: Session = Depends(get_db)):
    mobile = get_mobile_from_token(payload.session_token)
    if not mobile:
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    lead = get_lead_by_mobile(db, mobile)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    lead.selected_lender = payload.lender_name
    lead.selected_offer_id = payload.offer_id
    lead.status = "offer_selected"
    db.add(
        ApplicationLog(
            lead_id=lead.id,
            event="offer_selected",
            details=f"{payload.lender_name} - {payload.offer_id}",
        )
    )
    db.commit()

    return SelectOfferResponse(
        message="Offer selected successfully",
        lead_id=lead.id,
        lender_name=payload.lender_name,
        offer_id=payload.offer_id,
        next_step="Complete KYC on partner portal (Phase 3)",
    )
