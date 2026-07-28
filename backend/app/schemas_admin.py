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
