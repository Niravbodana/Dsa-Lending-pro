from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request
from sqlalchemy.orm import Session

from app.database import get_db
from app.deps.session import get_session_token
from app.models import ApplicationLog, Lead, LendingPartner, LoanApplication
from app.schemas import (
    EligibilityRequest,
    EligibilityResponse,
    EligibilityResult,
    JourneyApplicationInfo,
    JourneyLeadInfo,
    JourneyResponse,
    LeadDetailsRequest,
    LeadResponse,
    OffersResponse,
    PanLookupRequest,
    PanLookupResponse,
    PartnerHandoffResponse,
    PartnerPreferenceRequest,
    RequiredFieldInfo,
    RequiredFieldsResponse,
    SelectOfferRequest,
    SelectOfferResponse,
    WorkflowStepInfo,
)
from app.services.partner_fields import FIELD_CATALOG
from app.services.partner_store import get_union_required_fields
from app.services.application import add_status_history, generate_application_ref, send_notification
from app.services.consent import client_meta, record_consent, record_consent_bundle, log_consent_event
from app.services.eligibility import EligibilityInput, check_eligibility
from app.services.journey import build_journey
from app.services.offer_engine import fetch_partner_offers_sync
from app.services.otp import get_lead_by_mobile, get_mobile_from_token
from app.services.partner_handoff import (
    build_choice_connect_prefill,
    build_handoff_embed_url,
)
from app.services.pan_lookup import lookup_pan

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
    lead.date_of_birth = payload.date_of_birth
    lead.email = payload.email
    lead.pincode = payload.pincode
    lead.gender = payload.gender
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
def get_offers(
    session_token: str = Depends(get_session_token),
    db: Session = Depends(get_db),
):
    mobile = _auth(db, session_token)
    lead = get_lead_by_mobile(db, mobile)
    if not lead or not lead.monthly_income:
        raise HTTPException(status_code=400, detail="Please submit your details first")

    if lead.status == "not_eligible":
        raise HTTPException(status_code=400, detail="Not eligible for loan")

    max_loan = lead.max_loan_amount or min(int(lead.monthly_income * 20), 500000)

    offers, queried, responded = fetch_partner_offers_sync(db, lead)

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

    if payload.offer_id.endswith("-handoff"):
        partner = (
            db.query(LendingPartner)
            .filter(LendingPartner.lender_name == payload.lender_name)
            .first()
        )
        slug = (partner.page_slug or partner.partner_id) if partner else "choiceconnect"
        handoff = f"/apply/partner/{slug}/handoff"
        db.add(
            ApplicationLog(
                lead_id=lead.id,
                event="external_offer_selected",
                details=f"{payload.lender_name} handoff",
            )
        )
        db.commit()
        return SelectOfferResponse(
            message=f"Continue with {payload.lender_name} — your verified details will auto-fill",
            lead_id=lead.id,
            lender_name=payload.lender_name,
            offer_id=payload.offer_id,
            next_step=handoff,
            handoff_path=handoff,
            workflow_mode="external_handoff",
        )

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
        next_step=f"/application/{application.id}/kyc",
        workflow_mode="internal",
    )


@router.get("/required-fields", response_model=RequiredFieldsResponse)
def get_required_fields(db: Session = Depends(get_db)):
    keys = get_union_required_fields(db)
    fields = [
        RequiredFieldInfo(
            key=key,
            label=FIELD_CATALOG[key]["label"],
            step=FIELD_CATALOG[key]["step"],
            type=FIELD_CATALOG[key]["type"],
        )
        for key in keys
        if key in FIELD_CATALOG
    ]
    from app.models import LendingPartner

    count = db.query(LendingPartner).filter(LendingPartner.enabled.is_(True)).count()
    return RequiredFieldsResponse(fields=fields, partners_count=count)


@router.get("/journey", response_model=JourneyResponse)
def get_journey(
    authorization: str | None = Header(None),
    session_token: str | None = Query(None),
    db: Session = Depends(get_db),
):
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization.removeprefix("Bearer ").strip() or None
    elif session_token:
        token = session_token
    mobile = get_mobile_from_token(db, token) if token else None
    data = build_journey(db, mobile)
    return JourneyResponse(
        authenticated=data["authenticated"],
        next_step=data["next_step"],
        apply_step=data["apply_step"],
        workflow_step=data["workflow_step"],
        workflow=[WorkflowStepInfo(**s) for s in data["workflow"]],
        lead=JourneyLeadInfo(**data["lead"]) if data["lead"] else None,
        application=JourneyApplicationInfo(**data["application"]) if data["application"] else None,
        can_resume=data["can_resume"],
    )


@router.post("/pan-lookup", response_model=PanLookupResponse)
def pan_lookup(payload: PanLookupRequest, db: Session = Depends(get_db)):
    _auth(db, payload.session_token)
    try:
        result = lookup_pan(payload.pan)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
    return PanLookupResponse(**result)


@router.post("/partner-preference")
def set_partner_preference(payload: PartnerPreferenceRequest, db: Session = Depends(get_db)):
    mobile = _auth(db, payload.session_token)
    lead = get_lead_by_mobile(db, mobile)
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    lead.preferred_partner_slug = payload.partner_slug.strip().lower()
    db.commit()
    return {"message": "Partner preference saved", "partner_slug": lead.preferred_partner_slug}


@router.get("/partner-handoff/{slug}", response_model=PartnerHandoffResponse)
def get_partner_handoff(
    slug: str,
    session_token: str = Depends(get_session_token),
    db: Session = Depends(get_db),
):
    mobile = _auth(db, session_token)
    lead = get_lead_by_mobile(db, mobile)
    if not lead or not lead.full_name or not lead.pan:
        raise HTTPException(status_code=400, detail="Complete your profile on NeerCred first")

    partner = (
        db.query(LendingPartner)
        .filter(LendingPartner.enabled.is_(True))
        .filter((LendingPartner.page_slug == slug) | (LendingPartner.partner_id == slug))
        .first()
    )
    if not partner or partner.workflow_mode != "external_handoff":
        raise HTTPException(status_code=404, detail="External partner not found")

    if not lead.email or not lead.pincode or not lead.date_of_birth:
        raise HTTPException(
            status_code=400,
            detail="Email, PIN code and date of birth required for this partner",
        )

    prefill = build_choice_connect_prefill(lead, partner)
    embed_url = build_handoff_embed_url(partner, prefill)
    external_url = partner.external_lending_url or embed_url

    db.add(
        ApplicationLog(
            lead_id=lead.id,
            event="partner_handoff_prepared",
            details=f"{partner.lender_name} — prefill ready",
        )
    )
    db.commit()

    return PartnerHandoffResponse(
        partner_id=partner.partner_id,
        lender_name=partner.lender_name,
        workflow_mode=partner.workflow_mode,
        embed_url=embed_url,
        external_url=external_url,
        prefill=prefill,
        required_on_partner=[
            "firstName",
            "lastName",
            "mobile",
            "email",
            "pan",
            "dob",
            "occupation",
            "monthlyIncome",
            "pincode",
        ],
        message="Your verified details are ready for Choice Connect",
    )
