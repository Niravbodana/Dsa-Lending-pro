from datetime import datetime

from pydantic import BaseModel, Field, model_validator

from app.services.consent import CONSENT_VERSIONS


class ConsentVersionsResponse(BaseModel):
    versions: dict[str, str]


class CookieConsentRequest(BaseModel):
    essential: bool = True
    analytics: bool = False
    page_url: str | None = None


class CookieConsentResponse(BaseModel):
    message: str
    recorded: list[str]


class LeadConsentsInput(BaseModel):
    dpdp_data_processing: bool
    privacy_policy: bool
    terms_of_service: bool
    credit_bureau_check: bool = False
    marketing_communications: bool = False
    privacy_version: str = Field(default=CONSENT_VERSIONS["privacy_policy"])
    terms_version: str = Field(default=CONSENT_VERSIONS["terms_of_service"])
    dpdp_version: str = Field(default=CONSENT_VERSIONS["dpdp_data_processing"])

    @model_validator(mode="after")
    def required_must_be_true(self) -> "LeadConsentsInput":
        if not self.dpdp_data_processing or not self.privacy_policy or not self.terms_of_service:
            raise ValueError("Privacy, terms, and DPDP consents are required")
        return self


class ConsentRecordResponse(BaseModel):
    id: int
    lead_id: int | None
    application_id: int | None
    mobile: str | None
    consent_type: str
    consent_version: str
    accepted: bool
    page_url: str | None
    ip_address: str | None
    metadata_json: str | None
    created_at: datetime

    class Config:
        from_attributes = True
