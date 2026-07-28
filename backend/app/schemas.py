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


class OffersResponse(BaseModel):
    lead_id: int
    offers: list[LoanOffer]
    message: str


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
