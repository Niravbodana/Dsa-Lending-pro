"""Mock partner adapters — replace with real HTTP calls when API keys are set."""

import random
from typing import Literal

from app.services.partners.base import PartnerAdapter, PartnerConfig, PartnerOfferRaw


def _approval_chance(monthly_income: float, loan_amount: int) -> Literal["high", "medium", "low"]:
    ratio = loan_amount / max(monthly_income, 1)
    if ratio <= 8:
        return "high"
    if ratio <= 15:
        return "medium"
    return "low"


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
        "partner_id": "moneyview",
        "lender_name": "MoneyView NBFC",
        "lender_logo": "MV",
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


class MockPartnerAdapter(PartnerAdapter):
    async def fetch_offers(
        self,
        monthly_income: float,
        employment_type: str,
        city: str,
        pan: str,
        max_loan_amount: int,
    ) -> list[PartnerOfferRaw]:
        profile = next(
            (p for p in PARTNER_PROFILES if p["partner_id"] == self.config.partner_id),
            None,
        )
        if not profile:
            return []

        loan_amount = max(max_loan_amount - profile["amount_offset"], 50000)
        chance = _approval_chance(monthly_income, loan_amount)

        # Simulate occasional rejection
        if chance == "low" and random.random() < 0.3:
            return []

        return [
            PartnerOfferRaw(
                offer_id=f"{profile['partner_id']}-pl-{pan[-4:]}",
                lender_name=profile["lender_name"],
                lender_logo=profile["lender_logo"],
                loan_amount=loan_amount,
                interest_rate=profile["interest_rate"],
                tenure_months=profile["tenure_months"],
                processing_fee=profile["processing_fee"],
                features=profile["features"],
                approval_chance=chance,
            )
        ]
