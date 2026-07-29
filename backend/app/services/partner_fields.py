"""Catalog of lead fields that lending partner APIs may require."""

from __future__ import annotations

FIELD_CATALOG: dict[str, dict[str, str]] = {
    "mobile": {"label": "Mobile number", "step": "mobile", "type": "tel"},
    "full_name": {"label": "Full name (as per PAN)", "step": "details", "type": "text"},
    "pan": {"label": "PAN", "step": "details", "type": "text"},
    "date_of_birth": {"label": "Date of birth", "step": "details", "type": "date"},
    "email": {"label": "Email address", "step": "details", "type": "email"},
    "pincode": {"label": "PIN code", "step": "details", "type": "text"},
    "gender": {"label": "Gender", "step": "details", "type": "select"},
    "monthly_income": {"label": "Monthly income", "step": "details", "type": "number"},
    "employment_type": {"label": "Employment type", "step": "details", "type": "select"},
    "city": {"label": "City", "step": "details", "type": "text"},
    "loan_purpose": {"label": "Loan purpose", "step": "details", "type": "select"},
    "existing_emi": {"label": "Existing monthly EMI", "step": "details", "type": "number"},
    "aadhaar": {"label": "Aadhaar (KYC step)", "step": "kyc", "type": "text"},
    "bank_account": {"label": "Bank account", "step": "kyc", "type": "text"},
    "bank_ifsc": {"label": "IFSC", "step": "kyc", "type": "text"},
    "address": {"label": "Address", "step": "kyc", "type": "text"},
}

DEFAULT_REQUIRED_FIELDS = [
    "mobile",
    "full_name",
    "pan",
    "date_of_birth",
    "monthly_income",
    "employment_type",
    "city",
]


def parse_required_fields(raw: str | None) -> list[str]:
    if not raw:
        return list(DEFAULT_REQUIRED_FIELDS)
    import json

    try:
        parsed = json.loads(raw)
        if isinstance(parsed, list):
            return [str(f) for f in parsed if str(f) in FIELD_CATALOG]
    except json.JSONDecodeError:
        pass
    return [f.strip() for f in raw.split(",") if f.strip() in FIELD_CATALOG]


def union_required_fields(field_lists: list[list[str]]) -> list[str]:
    seen: set[str] = set()
    ordered: list[str] = []
    for fields in field_lists:
        for field in fields:
            if field not in seen:
                seen.add(field)
                ordered.append(field)
    return ordered or list(DEFAULT_REQUIRED_FIELDS)
