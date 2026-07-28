from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator


# --- KYC ---
class AadhaarOtpRequest(BaseModel):
    session_token: str
    application_id: int
    aadhaar: str = Field(..., min_length=12, max_length=14)

    @field_validator("aadhaar")
    @classmethod
    def clean_aadhaar(cls, v: str) -> str:
        return v.replace(" ", "").replace("-", "")


class AadhaarVerifyRequest(BaseModel):
    session_token: str
    application_id: int
    otp: str = Field(..., min_length=6, max_length=6)


class BankVerifyRequest(BaseModel):
    session_token: str
    application_id: int
    account_number: str = Field(..., min_length=9, max_length=18)
    ifsc: str = Field(..., min_length=11, max_length=11)
    address: str = Field(..., min_length=10, max_length=300)

    @field_validator("ifsc")
    @classmethod
    def validate_ifsc(cls, v: str) -> str:
        ifsc = v.upper()
        if len(ifsc) != 11:
            raise ValueError("Invalid IFSC")
        return ifsc


class EsignRequest(BaseModel):
    session_token: str
    application_id: int
    agreed: bool
    page_url: str | None = None

    @model_validator(mode="after")
    def agreement_required(self) -> "EsignRequest":
        if not self.agreed:
            raise ValueError("Loan agreement consent is required")
        return self


class SubmitApplicationRequest(BaseModel):
    session_token: str
    application_id: int


class KycStepResponse(BaseModel):
    message: str
    step: str
    completed: bool
    dev_otp: str | None = None


# --- Application ---
class ApplicationResponse(BaseModel):
    id: int
    application_ref: str
    lead_id: int
    lender_name: str
    offer_id: str
    loan_amount: int
    interest_rate: float
    tenure_months: int
    emi: int
    status: str
    aadhaar_verified: bool
    bank_verified: bool
    esign_completed: bool
    aadhaar_masked: str | None
    bank_account: str | None
    disbursal_amount: int | None
    commission_amount: float | None
    created_at: datetime

    class Config:
        from_attributes = True


class StatusTimelineItem(BaseModel):
    status: str
    message: str | None
    source: str
    created_at: datetime

    class Config:
        from_attributes = True


class ApplicationDetailResponse(BaseModel):
    application: ApplicationResponse
    timeline: list[StatusTimelineItem]
    lead_name: str | None
    lead_mobile: str | None


class SelectOfferResponse(BaseModel):
    message: str
    lead_id: int
    lender_name: str
    offer_id: str
    application_id: int
    application_ref: str
    next_step: str


# --- Dashboard ---
class EmiScheduleItem(BaseModel):
    month: int
    emi: int
    principal: int
    interest: int
    balance: int


class DashboardProfile(BaseModel):
    mobile: str
    full_name: str | None
    city: str | None
    total_applications: int
    active_applications: int
    disbursed_amount: int


class WebhookPayload(BaseModel):
    application_ref: str
    status: Literal["under_review", "approved", "disbursed", "rejected"]
    message: str | None = None
    partner_ref_id: str | None = None
    disbursal_amount: int | None = None
