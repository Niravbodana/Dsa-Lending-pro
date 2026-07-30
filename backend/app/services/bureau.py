"""Credit bureau pull — mock in dev; wire CRIF/CIBIL/Experian in production."""

from __future__ import annotations

from app.models import Lead


def pull_credit_bureau_mock(lead: Lead) -> dict:
    """
    Mock bureau pull after credit_bureau_check consent.
    Production: integrate with licensed bureau API.
    """
    base = lead.eligibility_score or 50
    adjustment = 0
    factors: list[str] = []

    if lead.pan and len(lead.pan) == 10:
        adjustment += 3
        factors.append("PAN verified — bureau match (+3)")

    if lead.monthly_income and lead.monthly_income >= 30000:
        adjustment += 5
        factors.append("Stable income profile per bureau (+5)")

    factors.append("Credit bureau check completed (mock provider)")

    return {
        "provider": "mock_crif",
        "score_adjustment": adjustment,
        "factors": factors,
        "reference_id": f"BUR-{lead.id}-{lead.mobile[-4:]}",
    }
