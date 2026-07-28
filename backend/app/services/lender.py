import math
from typing import Literal

from app.schemas import LoanOffer


def _calculate_emi(principal: int, annual_rate: float, tenure_months: int) -> int:
    monthly_rate = annual_rate / 12 / 100
    if monthly_rate == 0:
        return math.ceil(principal / tenure_months)
    emi = principal * monthly_rate * (1 + monthly_rate) ** tenure_months
    emi /= (1 + monthly_rate) ** tenure_months - 1
    return math.ceil(emi)


def _approval_chance(monthly_income: float, loan_amount: int) -> Literal["high", "medium", "low"]:
    ratio = loan_amount / max(monthly_income, 1)
    if ratio <= 8:
        return "high"
    if ratio <= 15:
        return "medium"
    return "low"


def fetch_partner_offers(
    monthly_income: float,
    employment_type: str,
    city: str,
) -> list[LoanOffer]:
    """
    Mock partner lender offers for Phase 1.
    Replace this with real partner bank/NBFC API calls in Phase 2.
    """
    base_amount = min(int(monthly_income * 15), 500000)
    if employment_type == "salaried":
        base_amount = min(int(monthly_income * 20), 500000)
    elif employment_type == "business":
        base_amount = min(int(monthly_income * 18), 500000)

    base_amount = max(base_amount, 50000)
    base_amount = (base_amount // 1000) * 1000

    partners = [
        {
            "offer_id": "hdfc-pl-001",
            "lender_name": "HDFC Bank",
            "lender_logo": "HDFC",
            "interest_rate": 10.99,
            "tenure_months": 36,
            "processing_fee": "Up to 2%",
            "features": ["Instant approval", "Zero foreclosure"],
        },
        {
            "offer_id": "icici-pl-002",
            "lender_name": "ICICI Bank",
            "lender_logo": "ICICI",
            "interest_rate": 11.49,
            "tenure_months": 48,
            "processing_fee": "1.5%",
            "features": ["Flexible tenure", "Quick disbursal"],
        },
        {
            "offer_id": "bajaj-pl-003",
            "lender_name": "Bajaj Finserv",
            "lender_logo": "BAJAJ",
            "interest_rate": 12.99,
            "tenure_months": 60,
            "processing_fee": "2.5%",
            "features": ["Minimal documentation", "Same-day approval"],
        },
        {
            "offer_id": "tata-pl-004",
            "lender_name": "Tata Capital",
            "lender_logo": "TATA",
            "interest_rate": 13.25,
            "tenure_months": 48,
            "processing_fee": "2%",
            "features": ["No hidden charges", "Online KYC"],
        },
        {
            "offer_id": "neo-pl-005",
            "lender_name": "Neo Finance NBFC",
            "lender_logo": "MV",
            "interest_rate": 14.49,
            "tenure_months": 36,
            "processing_fee": "3%",
            "features": ["100% digital", "Fast processing"],
        },
    ]

    offers: list[LoanOffer] = []
    for idx, partner in enumerate(partners):
        loan_amount = max(base_amount - idx * 10000, 50000)
        emi = _calculate_emi(loan_amount, partner["interest_rate"], partner["tenure_months"])
        offers.append(
            LoanOffer(
                offer_id=partner["offer_id"],
                lender_name=partner["lender_name"],
                lender_logo=partner["lender_logo"],
                loan_amount=loan_amount,
                interest_rate=partner["interest_rate"],
                tenure_months=partner["tenure_months"],
                emi=emi,
                processing_fee=partner["processing_fee"],
                approval_chance=_approval_chance(monthly_income, loan_amount),
                features=partner["features"],
            )
        )

    offers.sort(key=lambda o: o.interest_rate)
    return offers
