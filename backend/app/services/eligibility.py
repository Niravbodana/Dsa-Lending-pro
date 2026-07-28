"""Eligibility engine — Phase 2."""

from dataclasses import dataclass


@dataclass
class EligibilityInput:
    monthly_income: float
    employment_type: str
    city: str
    existing_emi: float
    loan_purpose: str


@dataclass
class EligibilityOutput:
    eligible: bool
    score: int
    max_loan_amount: int
    recommended_tenure: int
    debt_to_income_ratio: float
    message: str
    factors: list[str]


TIER1_CITIES = {"mumbai", "delhi", "bangalore", "bengaluru", "hyderabad", "chennai", "pune", "kolkata"}

PURPOSE_MULTIPLIER = {
    "personal": 1.0,
    "medical": 1.1,
    "wedding": 1.05,
    "travel": 0.95,
    "business": 1.15,
    "education": 1.0,
}

EMPLOYMENT_MULTIPLIER = {
    "salaried": 20,
    "self_employed": 15,
    "business": 18,
}


def check_eligibility(data: EligibilityInput) -> EligibilityOutput:
    factors: list[str] = []
    score = 50

    # Income check
    if data.monthly_income < 15000:
        return EligibilityOutput(
            eligible=False,
            score=20,
            max_loan_amount=0,
            recommended_tenure=0,
            debt_to_income_ratio=0,
            message="Minimum monthly income ₹15,000 required for personal loan.",
            factors=["Income below minimum threshold"],
        )

    if data.monthly_income >= 50000:
        score += 20
        factors.append("Strong income profile (+20)")
    elif data.monthly_income >= 25000:
        score += 10
        factors.append("Adequate income (+10)")

    # Employment
    emp_mult = EMPLOYMENT_MULTIPLIER.get(data.employment_type, 15)
    if data.employment_type == "salaried":
        score += 15
        factors.append("Salaried employment — preferred (+15)")
    elif data.employment_type == "business":
        score += 10
        factors.append("Business owner (+10)")

    # City tier
    city_lower = data.city.lower().strip()
    if any(t in city_lower for t in TIER1_CITIES):
        score += 10
        factors.append("Tier-1 city — higher approval (+10)")

    # Debt-to-income
    dti = (data.existing_emi / data.monthly_income) * 100 if data.monthly_income else 0
    if dti > 60:
        return EligibilityOutput(
            eligible=False,
            score=max(score - 30, 10),
            max_loan_amount=0,
            recommended_tenure=0,
            debt_to_income_ratio=round(dti, 1),
            message="Existing EMI obligations too high. Please clear some loans first.",
            factors=factors + [f"DTI ratio {dti:.0f}% exceeds 60% limit"],
        )
    if dti < 30:
        score += 10
        factors.append(f"Low DTI ratio {dti:.0f}% (+10)")
    elif dti < 50:
        score += 5
        factors.append(f"Moderate DTI ratio {dti:.0f}% (+5)")

    # Purpose
    purpose_mult = PURPOSE_MULTIPLIER.get(data.loan_purpose, 1.0)
    factors.append(f"Loan purpose: {data.loan_purpose}")

    # Max loan calculation
    base_max = int(data.monthly_income * emp_mult * purpose_mult)
    available_emi_capacity = data.monthly_income * 0.5 - data.existing_emi
    if available_emi_capacity < 5000:
        base_max = min(base_max, 100000)
        factors.append("Limited EMI capacity — capped loan amount")

    max_loan = min(max(base_max, 50000), 500000)
    max_loan = (max_loan // 1000) * 1000

    score = min(score, 100)

    # Recommended tenure
    if max_loan <= 100000:
        tenure = 24
    elif max_loan <= 300000:
        tenure = 36
    else:
        tenure = 48

    eligible = score >= 40 and max_loan >= 50000

    if eligible:
        message = f"Congratulations! You're eligible for up to ₹{max_loan:,} personal loan."
    else:
        message = "Unfortunately, you don't meet minimum eligibility criteria at this time."

    return EligibilityOutput(
        eligible=eligible,
        score=score,
        max_loan_amount=max_loan if eligible else 0,
        recommended_tenure=tenure,
        debt_to_income_ratio=round(dti, 1),
        message=message,
        factors=factors,
    )
