from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class AdminLoginRequest(BaseModel):
    password: str


class AdminLoginResponse(BaseModel):
    token: str
    message: str


class BugReportCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200)
    description: str = Field(..., min_length=10)
    severity: Literal["low", "medium", "high", "critical"] = "medium"
    page_url: str | None = None
    reported_by: str | None = None


class BugReportUpdate(BaseModel):
    status: Literal["open", "in_progress", "fixed", "closed"] | None = None
    severity: Literal["low", "medium", "high", "critical"] | None = None
    fix_notes: str | None = None


class BugReportResponse(BaseModel):
    id: int
    title: str
    description: str
    severity: str
    status: str
    page_url: str | None
    reported_by: str | None
    fix_notes: str | None
    created_at: datetime
    fixed_at: datetime | None

    class Config:
        from_attributes = True


class LeadAdminResponse(BaseModel):
    id: int
    mobile: str
    full_name: str | None
    pan: str | None
    monthly_income: float | None
    employment_type: str | None
    city: str | None
    status: str
    selected_lender: str | None
    selected_offer_id: str | None
    created_at: datetime

    class Config:
        from_attributes = True


class LeadStatusUpdate(BaseModel):
    status: str


class AdminStatsResponse(BaseModel):
    total_leads: int
    otp_verified: int
    details_submitted: int
    offers_fetched: int
    offer_selected: int
    open_bugs: int
    fixed_bugs: int
    total_bugs: int
    conversion_rate: float
    total_applications: int = 0
    disbursed_count: int = 0
    total_disbursed: int = 0
    total_commission: float = 0


class ApplicationAdminResponse(BaseModel):
    id: int
    application_ref: str
    lead_id: int
    lender_name: str
    loan_amount: int
    interest_rate: float
    emi: int
    status: str
    aadhaar_verified: bool
    bank_verified: bool
    esign_completed: bool
    commission_amount: float | None
    created_at: datetime

    class Config:
        from_attributes = True


class ApplicationStatusUpdate(BaseModel):
    status: Literal["under_review", "approved", "disbursed", "rejected"]
    message: str | None = None


class PartnerFieldCatalogItem(BaseModel):
    key: str
    label: str
    step: str
    type: str


class LendingPartnerCreate(BaseModel):
    partner_id: str = Field(..., min_length=2, max_length=50, pattern=r"^[a-z0-9_]+$")
    lender_name: str = Field(..., min_length=2, max_length=120)
    lender_logo: str = Field(..., min_length=2, max_length=40)
    api_url: str | None = None
    api_key: str | None = None
    webhook_url: str | None = None
    enabled: bool = True
    sort_order: int = 0
    required_fields: list[str] = Field(default_factory=list)
    mock_interest_rate: float = 12.99
    mock_tenure_months: int = 36
    mock_processing_fee: str = "2%"
    mock_features: list[str] = Field(default_factory=lambda: ["Digital process"])
    mock_amount_offset: int = 0
    page_slug: str | None = None
    page_title: str | None = None
    page_description: str | None = None
    offers_endpoint_path: str = "/offers"
    auth_header_name: str = "Authorization"
    auth_type: Literal["bearer", "api_key_header"] = "bearer"
    workflow_mode: str = "internal"
    external_lending_url: str | None = None
    partner_ref_code: str | None = None
    external_lead_source: str | None = None


class LendingPartnerUpdate(BaseModel):
    lender_name: str | None = None
    lender_logo: str | None = None
    api_url: str | None = None
    api_key: str | None = None
    webhook_url: str | None = None
    enabled: bool | None = None
    sort_order: int | None = None
    required_fields: list[str] | None = None
    mock_interest_rate: float | None = None
    mock_tenure_months: int | None = None
    mock_processing_fee: str | None = None
    mock_features: list[str] | None = None
    mock_amount_offset: int | None = None
    page_slug: str | None = None
    page_title: str | None = None
    page_description: str | None = None
    offers_endpoint_path: str | None = None
    auth_header_name: str | None = None
    auth_type: Literal["bearer", "api_key_header"] | None = None
    timeout_seconds: float | None = None


class LendingPartnerResponse(BaseModel):
    id: int
    partner_id: str
    lender_name: str
    lender_logo: str
    api_url: str | None
    api_key_masked: str
    has_api_key: bool
    webhook_url: str | None
    enabled: bool
    sort_order: int
    required_fields: list[str]
    mock_interest_rate: float
    mock_tenure_months: int
    mock_processing_fee: str
    mock_features: list[str]
    mock_amount_offset: int
    page_slug: str | None
    page_title: str | None
    page_description: str | None
    offers_endpoint_path: str | None
    auth_header_name: str | None
    auth_type: str | None
    timeout_seconds: float
    created_at: datetime
    updated_at: datetime
