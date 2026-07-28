from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ApplicationLog, Lead
from app.schemas import (
    EligibilityRequest,
    EligibilityResponse,
    EligibilityResult,
    LeadDetailsRequest,
    LeadResponse,
    OffersResponse,
    SelectOfferRequest,
    SelectOfferResponse,
)
from app.services.eligibility import EligibilityInput, check_eligibility
from app.services.offer_engine import fetch_partner_offers_sync
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


@router.post("/check-eligibility", response_model=EligibilityResponse)
def check_lead_eligibility(payload: EligibilityRequest, db: Session = Depends(get_db)):
    mobile = get_mobile_from_token(payload.session_token)
    if not mobile:
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    lead = get_lead_by_mobile(db, mobile)
    if not lead or not lead.monthly_income:
        raise HTTPException(status_code=400, detail="Please submit your details first")

    result = check_eligibility(
        EligibilityInput(
            monthly_income=lead.monthly_income,
            employment_type=lead.employment_type or "salaried",
            city=lead.city or "Mumbai",
            existing_emi=payload.existing_emi,
            loan_purpose=payload.loan_purpose,
        )
    )

    lead.loan_purpose = payload.loan_purpose
    lead.existing_emi = payload.existing_emi
    lead.eligibility_score = result.score
    lead.max_loan_amount = result.max_loan_amount
    lead.status = "eligibility_checked" if result.eligible else "not_eligible"
    db.add(
        ApplicationLog(
            lead_id=lead.id,
            event="eligibility_checked",
            details=f"score={result.score}, eligible={result.eligible}",
        )
    )
    db.commit()

    return EligibilityResponse(
        lead_id=lead.id,
        eligibility=EligibilityResult(
            eligible=result.eligible,
            score=result.score,
            max_loan_amount=result.max_loan_amount,
            recommended_tenure=result.recommended_tenure,
            debt_to_income_ratio=result.debt_to_income_ratio,
            message=result.message,
            factors=result.factors,
        ),
    )


@router.get("/offers", response_model=OffersResponse)
def get_offers(session_token: str, db: Session = Depends(get_db)):
    mobile = get_mobile_from_token(session_token)
    if not mobile:
        raise HTTPException(status_code=401, detail="Invalid or expired session")

    lead = get_lead_by_mobile(db, mobile)
    if not lead or not lead.monthly_income:
        raise HTTPException(status_code=400, detail="Please submit your details first")

    if lead.status == "not_eligible":
        raise HTTPException(status_code=400, detail="Not eligible for loan based on eligibility check")

    max_loan = lead.max_loan_amount or min(int(lead.monthly_income * 20), 500000)

    offers, queried, responded = fetch_partner_offers_sync(
        monthly_income=lead.monthly_income,
        employment_type=lead.employment_type or "salaried",
        city=lead.city or "Mumbai",
        pan=lead.pan or "XXXXX0000X",
        max_loan_amount=max_loan,
    )

    if not offers:
        raise HTTPException(
            status_code=404,
            detail="No offers available from partner lenders at this time. Please try again later.",
        )

    lead.status = "offers_fetched"
    db.add(
        ApplicationLog(
            lead_id=lead.id,
            event="offers_fetched",
            details=f"{len(offers)} offers from {responded}/{queried} partners",
        )
    )
    db.commit()

    return OffersResponse(
        lead_id=lead.id,
        offers=offers,
        message=f"Found {len(offers)} offers from {responded} partner lenders",
        eligibility_score=lead.eligibility_score,
        partners_queried=queried,
        partners_responded=responded,
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
