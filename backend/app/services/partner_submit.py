"""Forward completed applications to partner lender APIs."""

from __future__ import annotations

import logging

import httpx
from sqlalchemy.orm import Session

from app.models import Lead, LoanApplication, LendingPartner
from app.services.partner_secrets import decrypt_api_key
from app.services.partner_store import lead_to_api_payload

logger = logging.getLogger(__name__)


def _find_partner(db: Session, lender_name: str) -> LendingPartner | None:
    return (
        db.query(LendingPartner)
        .filter(LendingPartner.lender_name == lender_name, LendingPartner.enabled.is_(True))
        .first()
    )


def submit_to_partner(db: Session, lead: Lead, application: LoanApplication) -> str | None:
    """
    POST application to partner API after KYC submit.
    Returns partner_ref_id if successful, else None (mock ref generated).
    """
    partner = _find_partner(db, application.lender_name)
    if not partner or not partner.api_url:
        return f"MOCK-{application.application_ref}"

    api_key = decrypt_api_key(partner.api_key_encrypted) if partner.api_key_encrypted else None
    if not api_key:
        return f"MOCK-{application.application_ref}"

    base = partner.api_url.rstrip("/")
    path = getattr(partner, "application_endpoint_path", None) or "/applications"
    if not path.startswith("/"):
        path = f"/{path}"
    url = f"{base}{path}"

    payload = {
        **lead_to_api_payload(lead),
        "application_ref": application.application_ref,
        "offer_id": application.offer_id,
        "loan_amount": application.loan_amount,
        "interest_rate": application.interest_rate,
        "tenure_months": application.tenure_months,
        "emi": application.emi,
        "aadhaar_verified": application.aadhaar_verified,
        "bank_verified": application.bank_verified,
        "esign_completed": application.esign_completed,
    }

    headers = {"Content-Type": "application/json"}
    auth_name = partner.auth_header_name or "Authorization"
    if partner.auth_type == "api_key_header":
        headers[auth_name] = api_key
    else:
        headers[auth_name] = f"Bearer {api_key}"

    try:
        with httpx.Client(timeout=partner.timeout_seconds) as client:
            res = client.post(url, json=payload, headers=headers)
            res.raise_for_status()
            data = res.json()
            return data.get("partner_ref_id") or data.get("reference_id") or f"PTR-{application.application_ref}"
    except Exception as exc:
        logger.warning("Partner submit failed for %s: %s", application.lender_name, exc)
        return f"MOCK-{application.application_ref}"
