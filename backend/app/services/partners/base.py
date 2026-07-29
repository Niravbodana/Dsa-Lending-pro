"""Base partner lender adapter — plug in real APIs here."""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
import time


@dataclass
class PartnerOfferRaw:
    offer_id: str
    lender_name: str
    lender_logo: str
    loan_amount: int
    interest_rate: float
    tenure_months: int
    processing_fee: str
    features: list[str]
    approval_chance: str


@dataclass
class PartnerConfig:
    partner_id: str
    lender_name: str
    lender_logo: str
    api_url: str | None
    api_key: str | None
    enabled: bool
    timeout_seconds: float = 5.0
    mock_profile: dict | None = None
    required_fields: list[str] = field(default_factory=list)
    offers_endpoint_path: str = "/offers"
    auth_header_name: str = "Authorization"
    auth_type: str = "bearer"


class PartnerAdapter(ABC):
    def __init__(self, config: PartnerConfig):
        self.config = config

    @abstractmethod
    async def fetch_offers(self, lead_data: dict) -> list[PartnerOfferRaw]:
        pass

    def _timed(self) -> float:
        return time.time()
