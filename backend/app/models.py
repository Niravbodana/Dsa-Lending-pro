from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Lead(Base):
    __tablename__ = "leads"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    mobile: Mapped[str] = mapped_column(String(10), index=True)
    full_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    pan: Mapped[str | None] = mapped_column(String(10), nullable=True, index=True)
    monthly_income: Mapped[float | None] = mapped_column(Float, nullable=True)
    employment_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    city: Mapped[str | None] = mapped_column(String(80), nullable=True)
    date_of_birth: Mapped[str | None] = mapped_column(String(10), nullable=True)
    email: Mapped[str | None] = mapped_column(String(120), nullable=True)
    pincode: Mapped[str | None] = mapped_column(String(6), nullable=True)
    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)
    loan_purpose: Mapped[str | None] = mapped_column(String(30), nullable=True)
    existing_emi: Mapped[float | None] = mapped_column(Float, nullable=True, default=0)
    eligibility_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    max_loan_amount: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="otp_verified")
    selected_lender: Mapped[str | None] = mapped_column(String(100), nullable=True)
    selected_offer_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    preferred_partner_slug: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class UserSession(Base):
    __tablename__ = "user_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    token: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    mobile: Mapped[str] = mapped_column(String(10), index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class AdminSession(Base):
    __tablename__ = "admin_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    token: Mapped[str] = mapped_column(String(128), unique=True, index=True)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class OtpSession(Base):
    __tablename__ = "otp_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    mobile: Mapped[str] = mapped_column(String(10), index=True)
    otp_hash: Mapped[str] = mapped_column(String(128))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))
    verified: Mapped[bool] = mapped_column(default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class LoanApplication(Base):
    __tablename__ = "loan_applications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    lead_id: Mapped[int] = mapped_column(Integer, index=True)
    application_ref: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    lender_name: Mapped[str] = mapped_column(String(100))
    offer_id: Mapped[str] = mapped_column(String(100))
    loan_amount: Mapped[int] = mapped_column(Integer)
    interest_rate: Mapped[float] = mapped_column(Float)
    tenure_months: Mapped[int] = mapped_column(Integer)
    emi: Mapped[int] = mapped_column(Integer)
    status: Mapped[str] = mapped_column(String(30), default="offer_selected", index=True)
    # KYC fields
    aadhaar_masked: Mapped[str | None] = mapped_column(String(14), nullable=True)
    aadhaar_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    bank_account: Mapped[str | None] = mapped_column(String(20), nullable=True)
    bank_ifsc: Mapped[str | None] = mapped_column(String(11), nullable=True)
    bank_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    esign_completed: Mapped[bool] = mapped_column(Boolean, default=False)
    address: Mapped[str | None] = mapped_column(String(300), nullable=True)
    # Disbursal
    disbursal_amount: Mapped[int | None] = mapped_column(Integer, nullable=True)
    disbursal_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    commission_amount: Mapped[float | None] = mapped_column(Float, nullable=True)
    partner_ref_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    workflow_mode: Mapped[str] = mapped_column(String(30), default="internal")
    partner_slug: Mapped[str | None] = mapped_column(String(80), nullable=True)
    kfs_accepted: Mapped[bool] = mapped_column(Boolean, default=False)
    cooling_off_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    processing_fee_pct: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class ApplicationStatusHistory(Base):
    __tablename__ = "application_status_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    application_id: Mapped[int] = mapped_column(Integer, index=True)
    status: Mapped[str] = mapped_column(String(30))
    message: Mapped[str | None] = mapped_column(String(500), nullable=True)
    source: Mapped[str] = mapped_column(String(30), default="system")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class ApplicationLog(Base):
    __tablename__ = "application_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    lead_id: Mapped[int] = mapped_column(Integer, index=True)
    event: Mapped[str] = mapped_column(String(80))
    details: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class NotificationLog(Base):
    __tablename__ = "notification_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    mobile: Mapped[str] = mapped_column(String(10), index=True)
    channel: Mapped[str] = mapped_column(String(20))
    template: Mapped[str] = mapped_column(String(80))
    message: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class BugReport(Base):
    __tablename__ = "bug_reports"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(200))
    description: Mapped[str] = mapped_column(Text)
    severity: Mapped[str] = mapped_column(String(20), default="medium")
    status: Mapped[str] = mapped_column(String(20), default="open", index=True)
    page_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    reported_by: Mapped[str | None] = mapped_column(String(120), nullable=True)
    fix_notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    fixed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class UserConsent(Base):
    __tablename__ = "user_consents"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    lead_id: Mapped[int | None] = mapped_column(Integer, index=True, nullable=True)
    application_id: Mapped[int | None] = mapped_column(Integer, index=True, nullable=True)
    mobile: Mapped[str | None] = mapped_column(String(10), index=True, nullable=True)
    consent_type: Mapped[str] = mapped_column(String(50), index=True)
    consent_version: Mapped[str] = mapped_column(String(20))
    accepted: Mapped[bool] = mapped_column(Boolean, default=True)
    page_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    ip_address: Mapped[str | None] = mapped_column(String(45), nullable=True)
    user_agent: Mapped[str | None] = mapped_column(String(500), nullable=True)
    metadata_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class SiteConfig(Base):
    __tablename__ = "site_config"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    config_json: Mapped[str] = mapped_column(Text)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class LendingPartner(Base):
    __tablename__ = "lending_partners"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    partner_id: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    lender_name: Mapped[str] = mapped_column(String(120))
    lender_logo: Mapped[str] = mapped_column(String(40))
    api_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    api_key_encrypted: Mapped[str | None] = mapped_column(Text, nullable=True)
    webhook_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    required_fields_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    mock_interest_rate: Mapped[float] = mapped_column(Float, default=12.99)
    mock_tenure_months: Mapped[int] = mapped_column(Integer, default=36)
    mock_processing_fee: Mapped[str] = mapped_column(String(40), default="2%")
    mock_features_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    mock_amount_offset: Mapped[int] = mapped_column(Integer, default=0)
    page_slug: Mapped[str | None] = mapped_column(String(80), nullable=True, index=True)
    page_title: Mapped[str | None] = mapped_column(String(200), nullable=True)
    page_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    offers_endpoint_path: Mapped[str | None] = mapped_column(String(120), nullable=True)
    application_endpoint_path: Mapped[str | None] = mapped_column(String(120), nullable=True)
    external_lending_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    workflow_mode: Mapped[str] = mapped_column(String(30), default="internal")
    partner_ref_code: Mapped[str | None] = mapped_column(String(120), nullable=True)
    external_lead_source: Mapped[str | None] = mapped_column(String(120), nullable=True)
    auth_header_name: Mapped[str | None] = mapped_column(String(80), nullable=True)
    auth_type: Mapped[str | None] = mapped_column(String(30), nullable=True)
    timeout_seconds: Mapped[float] = mapped_column(Float, default=8.0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
