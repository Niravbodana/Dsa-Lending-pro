from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator, model_validator

from app.schemas_consent import LeadConsentsInput


class SendOtpRequest(BaseModel):
    mobile: str = Field(..., min_length=10, max_length=10, pattern=r"^[6-9]\d{9}$")
    sms_consent: bool = Field(
        ...,
        description="User consent to receive OTP SMS for verification (DPDP)",
    )

    @model_validator(mode="after")
    def sms_consent_required(self) -> "SendOtpRequest":
        if not self.sms_consent:
            raise ValueError("SMS OTP consent is required")
        return self


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


class AuthMeResponse(BaseModel):
    mobile: str
    authenticated: bool = True


class LogoutResponse(BaseModel):
    message: str
    logged_out: bool


class LeadDetailsRequest(BaseModel):
    session_token: str
    full_name: str = Field(..., min_length=2, max_length=120)
    pan: str = Field(..., min_length=10, max_length=10)
    monthly_income: float = Field(..., gt=0)
    employment_type: Literal["salaried", "self_employed", "business"]
    city: str = Field(..., min_length=2, max_length=80)
    date_of_birth: str | None = Field(None, pattern=r"^\d{4}-\d{2}-\d{2}$")
    email: str | None = Field(None, max_length=120)
    pincode: str | None = Field(None, min_length=6, max_length=6, pattern=r"^\d{6}$")
    gender: Literal["male", "female", "other"] | None = None
    consents: LeadConsentsInput
    page_url: str | None = None

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
    date_of_birth: str | None = None
    email: str | None = None
    pincode: str | None = None
    gender: str | None = None
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
    workflow_mode: str = "internal"
    partner_slug: str | None = None
    handoff_path: str | None = None


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
    loan_amount: int
    interest_rate: float
    tenure_months: int
    emi: int
    lender_data_sharing_consent: bool
    page_url: str | None = None

    @model_validator(mode="after")
    def lender_consent_required(self) -> "SelectOfferRequest":
        if not self.lender_data_sharing_consent:
            raise ValueError("Lender data sharing consent is required")
        return self


class SelectOfferResponse(BaseModel):
    message: str
    lead_id: int
    lender_name: str
    offer_id: str
    application_id: int | None = None
    application_ref: str | None = None
    next_step: str
    handoff_path: str | None = None
    workflow_mode: str = "internal"


class RequiredFieldInfo(BaseModel):
    key: str
    label: str
    step: str
    type: str


class RequiredFieldsResponse(BaseModel):
    fields: list[RequiredFieldInfo]
    partners_count: int


class PanLookupRequest(BaseModel):
    session_token: str
    pan: str = Field(..., min_length=10, max_length=10)

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


class PanLookupResponse(BaseModel):
    pan: str
    full_name: str
    date_of_birth: str
    gender: Literal["male", "female", "other"]
    verified: bool
    source: str = "mock"


class PartnerPreferenceRequest(BaseModel):
    session_token: str
    partner_slug: str = Field(..., min_length=1, max_length=80)


class WorkflowStepInfo(BaseModel):
    id: str
    label: str
    phase: str


class JourneyApplicationInfo(BaseModel):
    id: int
    application_ref: str
    lender_name: str
    status: str
    loan_amount: int
    interest_rate: float
    tenure_months: int
    emi: int
    aadhaar_verified: bool
    bank_verified: bool
    esign_completed: bool
    kyc_step: str


class JourneyLeadInfo(BaseModel):
    id: int | None = None
    mobile: str
    full_name: str | None = None
    pan: str | None = None
    monthly_income: float | None = None
    employment_type: str | None = None
    city: str | None = None
    date_of_birth: str | None = None
    email: str | None = None
    pincode: str | None = None
    gender: str | None = None
    loan_purpose: str | None = None
    existing_emi: float | None = None
    status: str | None = None
    eligibility_score: int | None = None
    max_loan_amount: int | None = None
    preferred_partner_slug: str | None = None
    selected_lender: str | None = None


class JourneyResponse(BaseModel):
    authenticated: bool
    next_step: str
    apply_step: str
    workflow_step: str
    workflow: list[WorkflowStepInfo]
    lead: JourneyLeadInfo | None
    application: JourneyApplicationInfo | None
    can_resume: bool


class PartnerHandoffResponse(BaseModel):
    partner_id: str
    lender_name: str
    workflow_mode: str
    embed_url: str
    external_url: str
    prefill: dict
    required_on_partner: list[str]
    message: str
