"""Mock partner adapters — uses admin-configured mock profile when API is not set."""

import random
from typing import Literal

from app.services.partners.base import PartnerAdapter, PartnerOfferRaw

PARTNER_PROFILES = [
    {
        "partner_id": "hdfc",
        "lender_name": "HDFC Bank",
        "lender_logo": "HDFC",
        "interest_rate": 10.99,
        "tenure_months": 36,
        "processing_fee": "Up to 2%",
        "features": ["Instant approval", "Zero foreclosure"],
        "amount_offset": 0,
    },
    {
        "partner_id": "icici",
        "lender_name": "ICICI Bank",
        "lender_logo": "ICICI",
        "interest_rate": 11.49,
        "tenure_months": 48,
        "processing_fee": "1.5%",
        "features": ["Flexible tenure", "Quick disbursal"],
        "amount_offset": 10000,
    },
    {
        "partner_id": "bajaj",
        "lender_name": "Bajaj Finserv",
        "lender_logo": "BAJAJ",
        "interest_rate": 12.99,
        "tenure_months": 60,
        "processing_fee": "2.5%",
        "features": ["Minimal documentation", "Same-day approval"],
        "amount_offset": 20000,
    },
    {
        "partner_id": "tata",
        "lender_name": "Tata Capital",
        "lender_logo": "TATA",
        "interest_rate": 13.25,
        "tenure_months": 48,
        "processing_fee": "2%",
        "features": ["No hidden charges", "Online KYC"],
        "amount_offset": 30000,
    },
    {
        "partner_id": "neo_finance",
        "lender_name": "Neo Finance NBFC",
        "lender_logo": "NEO",
        "interest_rate": 14.49,
        "tenure_months": 36,
        "processing_fee": "3%",
        "features": ["100% digital", "Fast processing"],
        "amount_offset": 40000,
    },
    {
        "partner_id": "axis",
        "lender_name": "Axis Bank",
        "lender_logo": "AXIS",
        "interest_rate": 11.75,
        "tenure_months": 42,
        "processing_fee": "2%",
        "features": ["Pre-approved offers", "Digital process"],
        "amount_offset": 15000,
    },
]


def _approval_chance(monthly_income: float, loan_amount: int) -> Literal["high", "medium", "low"]:
    ratio = loan_amount / max(monthly_income or 1, 1)
    if ratio <= 8:
        return "high"
    if ratio <= 15:
        return "medium"
    return "low"


class MockPartnerAdapter(PartnerAdapter):
    async def fetch_offers(self, lead_data: dict) -> list[PartnerOfferRaw]:
        profile = self.config.mock_profile
        if not profile:
            profile = next(
                (p for p in PARTNER_PROFILES if p["partner_id"] == self.config.partner_id),
                None,
            )
        if not profile:
            return []

        monthly_income = float(lead_data.get("monthly_income") or 0)
        max_loan_amount = int(lead_data.get("max_loan_amount") or 100000)
        pan = str(lead_data.get("pan") or "0000")

        loan_amount = max(max_loan_amount - int(profile.get("amount_offset", 0)), 50000)
        chance = _approval_chance(monthly_income, loan_amount)

        if chance == "low" and random.random() < 0.3:
            return []

        return [
            PartnerOfferRaw(
                offer_id=f"{profile['partner_id']}-pl-{pan[-4:]}",
                lender_name=profile["lender_name"],
                lender_logo=profile["lender_logo"],
                loan_amount=loan_amount,
                interest_rate=float(profile["interest_rate"]),
                tenure_months=int(profile["tenure_months"]),
                processing_fee=str(profile.get("processing_fee", "2%")),
                features=list(profile.get("features", [])),
                approval_chance=chance,
            )
        ]
