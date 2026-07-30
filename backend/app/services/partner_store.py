"""DB-backed lending partner registry for admin panel + offer engine."""

from __future__ import annotations

import json

from sqlalchemy.orm import Session

from app.config import settings
from app.models import Lead, LendingPartner
from app.services.partner_fields import DEFAULT_REQUIRED_FIELDS, parse_required_fields
from app.services.partner_secrets import decrypt_api_key, encrypt_api_key, mask_api_key
from app.services.partners.base import PartnerConfig
from app.services.partners.mock import PARTNER_PROFILES


def lead_to_api_payload(lead: Lead) -> dict:
    return {
        "mobile": lead.mobile,
        "full_name": lead.full_name,
        "pan": lead.pan,
        "date_of_birth": lead.date_of_birth,
        "email": lead.email,
        "pincode": lead.pincode,
        "gender": lead.gender,
        "monthly_income": lead.monthly_income,
        "employment_type": lead.employment_type,
        "city": lead.city,
        "loan_purpose": lead.loan_purpose,
        "existing_emi": lead.existing_emi or 0,
        "max_loan_amount": lead.max_loan_amount,
        "eligibility_score": lead.eligibility_score,
    }


def _env_api_for(partner_id: str) -> tuple[str | None, str | None]:
    mapping = {
        "hdfc": (settings.partner_hdfc_api_url, settings.partner_hdfc_api_key),
        "icici": (settings.partner_icici_api_url, settings.partner_icici_api_key),
        "bajaj": (settings.partner_bajaj_api_url, settings.partner_bajaj_api_key),
    }
    return mapping.get(partner_id, (None, None))


def partner_to_config(row: LendingPartner) -> PartnerConfig:
    api_key = decrypt_api_key(row.api_key_encrypted) if row.api_key_encrypted else None
    features = json.loads(row.mock_features_json) if row.mock_features_json else []
    mock_profile = {
        "partner_id": row.partner_id,
        "lender_name": row.lender_name,
        "lender_logo": row.lender_logo,
        "interest_rate": row.mock_interest_rate,
        "tenure_months": row.mock_tenure_months,
        "processing_fee": row.mock_processing_fee,
        "features": features,
        "amount_offset": row.mock_amount_offset,
    }
    return PartnerConfig(
        partner_id=row.partner_id,
        lender_name=row.lender_name,
        lender_logo=row.lender_logo,
        api_url=row.api_url,
        api_key=api_key,
        enabled=row.enabled,
        timeout_seconds=row.timeout_seconds,
        mock_profile=mock_profile,
        required_fields=parse_required_fields(row.required_fields_json),
        offers_endpoint_path=row.offers_endpoint_path or "/offers",
        auth_header_name=row.auth_header_name or "Authorization",
        auth_type=row.auth_type or "bearer",
    )


def get_enabled_partner_configs(db: Session) -> list[PartnerConfig]:
    rows = (
        db.query(LendingPartner)
        .filter(LendingPartner.enabled.is_(True))
        .filter(LendingPartner.workflow_mode != "external_handoff")
        .order_by(LendingPartner.sort_order.asc(), LendingPartner.id.asc())
        .all()
    )
    return [partner_to_config(row) for row in rows]


def get_union_required_fields(db: Session) -> list[str]:
    from app.services.partner_fields import union_required_fields

    rows = db.query(LendingPartner).filter(LendingPartner.enabled.is_(True)).all()
    if not rows:
        return list(DEFAULT_REQUIRED_FIELDS)
    lists = [parse_required_fields(row.required_fields_json) for row in rows]
    return union_required_fields(lists)


def seed_lending_partners(db: Session) -> None:
    if db.query(LendingPartner).count() > 0:
        upsert_choice_connect_partner(db)
        return

    for index, profile in enumerate(PARTNER_PROFILES):
        api_url, api_key = _env_api_for(profile["partner_id"])
        partner = LendingPartner(
            partner_id=profile["partner_id"],
            lender_name=profile["lender_name"],
            lender_logo=profile["lender_logo"],
            api_url=api_url,
            api_key_encrypted=encrypt_api_key(api_key) if api_key else None,
            enabled=True,
            sort_order=index,
            required_fields_json=json.dumps(DEFAULT_REQUIRED_FIELDS),
            mock_interest_rate=profile["interest_rate"],
            mock_tenure_months=profile["tenure_months"],
            mock_processing_fee=profile["processing_fee"],
            mock_features_json=json.dumps(profile["features"]),
            mock_amount_offset=profile["amount_offset"],
            page_slug=profile["partner_id"],
            page_title=f"{profile['lender_name']} Personal Loans",
            page_description=(
                f"Compare {profile['lender_name']} personal loan offers via NeerCred — "
                "digital KYC, transparent rates, fast disbursal."
            ),
            offers_endpoint_path="/offers",
            auth_header_name="Authorization",
            auth_type="bearer",
            timeout_seconds=8.0,
        )
        db.add(partner)
    db.commit()
    upsert_choice_connect_partner(db)


def upsert_choice_connect_partner(db: Session) -> None:
    """Choice Connect referral partner — external handoff with auto-prefill."""
    from app.services.partner_handoff import parse_choice_connect_url

    url = (
        "https://choiceconnect.in/referral/loan/personal-loan/QzAwOTYxNDk="
        "?lead_source=Y29ubmVjdF9yZWZlcnJhbF9saW5r"
    )
    meta = parse_choice_connect_url(url)
    row = db.query(LendingPartner).filter(LendingPartner.partner_id == "choiceconnect").first()
    fields = json.dumps(
        ["mobile", "full_name", "pan", "date_of_birth", "email", "pincode", "monthly_income", "employment_type", "city"]
    )
    features = json.dumps(
        [
            "Smart Match from multiple banks & NBFCs",
            "100% digital — no branch visit",
            "Instant disbursement",
            "Credit score safe check",
        ]
    )
    if row:
        row.lender_name = "Choice Connect"
        row.lender_logo = "choiceconnect"
        row.external_lending_url = url
        row.workflow_mode = "external_handoff"
        row.partner_ref_code = meta["cba_code"]
        row.external_lead_source = meta["lead_source"]
        row.page_slug = "choiceconnect"
        row.page_title = "Choice Connect Personal Loans"
        row.page_description = (
            "Apply via Choice Connect — India's trusted loan marketplace. "
            "Your NeerCred verified details auto-fill on partner page."
        )
        row.mock_interest_rate = 10.49
        row.mock_tenure_months = 60
        row.mock_processing_fee = "From 2%"
        row.mock_features_json = features
        row.required_fields_json = fields
        row.enabled = True
    else:
        db.add(
            LendingPartner(
                partner_id="choiceconnect",
                lender_name="Choice Connect",
                lender_logo="choiceconnect",
                external_lending_url=url,
                workflow_mode="external_handoff",
                partner_ref_code=meta["cba_code"],
                external_lead_source=meta["lead_source"],
                enabled=True,
                sort_order=0,
                required_fields_json=fields,
                mock_interest_rate=10.49,
                mock_tenure_months=60,
                mock_processing_fee="From 2%",
                mock_features_json=features,
                mock_amount_offset=0,
                page_slug="choiceconnect",
                page_title="Choice Connect Personal Loans",
                page_description=(
                    "Apply via Choice Connect — multiple banks & NBFCs on one platform. "
                    "NeerCred verified profile auto-fills your application."
                ),
                timeout_seconds=8.0,
            )
        )
    db.commit()


def partner_admin_dict(row: LendingPartner, *, include_secret: bool = False) -> dict:
    api_key_plain = decrypt_api_key(row.api_key_encrypted) if row.api_key_encrypted else ""
    data = {
        "id": row.id,
        "partner_id": row.partner_id,
        "lender_name": row.lender_name,
        "lender_logo": row.lender_logo,
        "api_url": row.api_url,
        "api_key_masked": mask_api_key(api_key_plain),
        "has_api_key": bool(api_key_plain),
        "webhook_url": row.webhook_url,
        "enabled": row.enabled,
        "sort_order": row.sort_order,
        "required_fields": parse_required_fields(row.required_fields_json),
        "mock_interest_rate": row.mock_interest_rate,
        "mock_tenure_months": row.mock_tenure_months,
        "mock_processing_fee": row.mock_processing_fee,
        "mock_features": json.loads(row.mock_features_json) if row.mock_features_json else [],
        "mock_amount_offset": row.mock_amount_offset,
        "page_slug": row.page_slug,
        "page_title": row.page_title,
        "page_description": row.page_description,
        "offers_endpoint_path": row.offers_endpoint_path,
        "auth_header_name": row.auth_header_name,
        "auth_type": row.auth_type,
        "timeout_seconds": row.timeout_seconds,
        "external_lending_url": row.external_lending_url,
        "workflow_mode": getattr(row, "workflow_mode", None) or "internal",
        "partner_ref_code": row.partner_ref_code,
        "external_lead_source": row.external_lead_source,
        "created_at": row.created_at,
        "updated_at": row.updated_at,
    }
    if include_secret:
        data["api_key"] = api_key_plain
    return data
