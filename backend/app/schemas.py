from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator


class SendOtpRequest(BaseModel):
    mobile: str = Field(..., min_length=10, max_length=10, pattern=r"^[6-9]\d{9}$")


class SendOtpResponse(BaseModel):
    message: str
    expires_in: int
    dev_otp: str | None = None


class VerifyOtpRequest(BaseModel):
    mobile: str = Field(..., min_length=10, max_length=10, pattern=r"^[6-9]\d{9}$")
    otp: str = Field(..., min_length=6, max_length=6, pattern=r"^\d{6}$")


class VerifyOtpResponse(BaseModel):
    message: str
    verified: bool
    session_token: str


class LeadDetailsRequest(BaseModel):
    session_token: str
    full_name: str = Field(..., min_length=2, max_length=120)
    pan: str = Field(..., min_length=10, max_length=10)
    monthly_income: float = Field(..., gt=0)
    employment_type: Literal["salaried", "self_employed", "business"]
    city: str = Field(..., min_length=2, max_length=80)

    @field_validator("pan")
    @classmethod
    def validate_pan(cls, value: str) -> str:
        pan = value.upper()
        if not (
            len(pan) == 10
            and pan[:5].isalpha()
            and pan[5:9].isdigit()
            and pan[9].isalpha()
        ):
            raise ValueError("Invalid PAN format")
        return pan


class LeadResponse(BaseModel):
    id: int
    mobile: str
    full_name: str | None
    pan: str | None
    monthly_income: float | None
    employment_type: str | None
    city: str | None
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class LoanOffer(BaseModel):
    offer_id: str
    lender_name: str
    lender_logo: str
    loan_amount: int
    interest_rate: float
    tenure_months: int
    emi: int
    processing_fee: str
    approval_chance: Literal["high", "medium", "low"]
    features: list[str]
    is_best_deal: bool = False
    lender_api_source: str = "mock"
    response_time_ms: int | None = None


class EligibilityRequest(BaseModel):
    session_token: str
    loan_purpose: Literal["personal", "medical", "wedding", "travel", "business", "education"] = "personal"
    existing_emi: float = Field(default=0, ge=0)


class EligibilityResult(BaseModel):
    eligible: bool
    score: int
    max_loan_amount: int
    recommended_tenure: int
    debt_to_income_ratio: float
    message: str
    factors: list[str]


class EligibilityResponse(BaseModel):
    lead_id: int
    eligibility: EligibilityResult


class OffersResponse(BaseModel):
    lead_id: int
    offers: list[LoanOffer]
    message: str
    eligibility_score: int | None = None
    partners_queried: int = 0
    partners_responded: int = 0


class SelectOfferRequest(BaseModel):
    session_token: str
    offer_id: str
    lender_name: str


class SelectOfferResponse(BaseModel):
    message: str
    lead_id: int
    lender_name: str
    offer_id: str
    next_step: str
