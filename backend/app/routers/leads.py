from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import ApplicationLog, Lead, LoanApplication
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
from app.services.application import add_status_history, generate_application_ref, send_notification
from app.services.consent import record_consent, record_consent_bundle, log_consent_event
from app.services.eligibility import EligibilityInput, check_eligibility
from app.services.offer_engine import fetch_partner_offers_sync
from app.services.otp import get_lead_by_mobile, get_mobile_from_token

router = APIRouter(prefix="/leads", tags=["leads"])


def _auth(db: Session, token: str) -> str:
    mobile = get_mobile_from_token(db, token)
    if not mobile:
        raise HTTPException(status_code=401, detail="Invalid or expired session")
    return mobile


@router.post("/details", response_model=LeadResponse)
def save_lead_details(
    payload: LeadDetailsRequest, request: Request, db: Session = Depends(get_db)
):
    mobile = _auth(db, payload.session_token)
    lead = get_lead_by_mobile(db, mobile)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    lead.full_name = payload.full_name
    lead.pan = payload.pan
    lead.monthly_income = payload.monthly_income
    lead.employment_type = payload.employment_type
    lead.city = payload.city
    lead.status = "details_submitted"

    c = payload.consents
    record_consent_bundle(
        db,
        mobile=mobile,
        lead_id=lead.id,
        application_id=None,
        consents={
            "dpdp_data_processing": c.dpdp_data_processing,
            "privacy_policy": c.privacy_policy,
            "terms_of_service": c.terms_of_service,
            "credit_bureau_check": c.credit_bureau_check,
            "marketing_communications": c.marketing_communications,
        },
        page_url=payload.page_url or "/apply",
        request=request,
    )
    log_consent_event(
        db,
        lead.id,
        "legal_consent_recorded",
        f"privacy={c.privacy_version}, terms={c.terms_version}, dpdp={c.dpdp_version}",
    )
    db.add(ApplicationLog(lead_id=lead.id, event="details_submitted", details=payload.city))
    db.commit()
    db.refresh(lead)
    return lead


@router.post("/check-eligibility", response_model=EligibilityResponse)
def check_lead_eligibility(payload: EligibilityRequest, db: Session = Depends(get_db)):
    mobile = _auth(db, payload.session_token)
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
    mobile = _auth(db, session_token)
    lead = get_lead_by_mobile(db, mobile)
    if not lead or not lead.monthly_income:
        raise HTTPException(status_code=400, detail="Please submit your details first")

    if lead.status == "not_eligible":
        raise HTTPException(status_code=400, detail="Not eligible for loan")

    max_loan = lead.max_loan_amount or min(int(lead.monthly_income * 20), 500000)

    offers, queried, responded = fetch_partner_offers_sync(
        monthly_income=lead.monthly_income,
        employment_type=lead.employment_type or "salaried",
        city=lead.city or "Mumbai",
        pan=lead.pan or "XXXXX0000X",
        max_loan_amount=max_loan,
    )

    if not offers:
        raise HTTPException(status_code=404, detail="No offers available from partners")

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
def select_offer(payload: SelectOfferRequest, request: Request, db: Session = Depends(get_db)):
    mobile = _auth(db, payload.session_token)
    lead = get_lead_by_mobile(db, mobile)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    lead.selected_lender = payload.lender_name
    lead.selected_offer_id = payload.offer_id
    lead.status = "offer_selected"

    app_ref = generate_application_ref()
    application = LoanApplication(
        lead_id=lead.id,
        application_ref=app_ref,
        lender_name=payload.lender_name,
        offer_id=payload.offer_id,
        loan_amount=payload.loan_amount,
        interest_rate=payload.interest_rate,
        tenure_months=payload.tenure_months,
        emi=payload.emi,
        status="kyc_pending",
    )
    db.add(application)
    db.flush()

    ip, ua = client_meta(request)
    record_consent(
        db,
        consent_type="lender_data_sharing",
        accepted=True,
        lead_id=lead.id,
        application_id=application.id,
        mobile=mobile,
        page_url=payload.page_url or "/apply",
        metadata=f"lender={payload.lender_name}",
        ip_address=ip,
        user_agent=ua,
    )
    log_consent_event(
        db,
        lead.id,
        "lender_data_sharing_consent",
        f"{payload.lender_name} — app {app_ref}",
    )

    add_status_history(db, application.id, "offer_selected", f"Offer from {payload.lender_name}")
    add_status_history(db, application.id, "kyc_pending", "Complete KYC to proceed")
    db.add(
        ApplicationLog(
            lead_id=lead.id,
            event="offer_selected",
            details=f"{payload.lender_name} - {app_ref}",
        )
    )
    db.commit()
    db.refresh(application)

    send_notification(
        db,
        mobile,
        "sms",
        "offer_selected",
        f"Your loan application {app_ref} with {payload.lender_name} is initiated. Complete KYC to proceed.",
    )

    return SelectOfferResponse(
        message="Offer selected — complete KYC to proceed",
        lead_id=lead.id,
        lender_name=payload.lender_name,
        offer_id=payload.offer_id,
        application_id=application.id,
        application_ref=app_ref,
        next_step="/application/{id}/kyc",
    )
