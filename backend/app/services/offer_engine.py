"""Phase 2 Offer Engine — parallel partner API calls + ranking."""

import asyncio
import math
import time

from sqlalchemy.orm import Session

from app.models import Lead
from app.schemas import LoanOffer
from app.services.partner_store import get_enabled_partner_configs, lead_to_api_payload
from app.services.partners.base import PartnerAdapter, PartnerConfig
from app.services.partners.http import HttpPartnerAdapter
from app.services.partners.mock import MockPartnerAdapter


def _calculate_emi(principal: int, annual_rate: float, tenure_months: int) -> int:
    monthly_rate = annual_rate / 12 / 100
    if monthly_rate == 0:
        return math.ceil(principal / tenure_months)
    emi = principal * monthly_rate * (1 + monthly_rate) ** tenure_months
    emi /= (1 + monthly_rate) ** tenure_months - 1
    return math.ceil(emi)


def _create_adapter(config: PartnerConfig) -> PartnerAdapter:
    if config.api_url and config.api_key:
        return HttpPartnerAdapter(config)
    return MockPartnerAdapter(config)


async def _fetch_from_partner(
    adapter: PartnerAdapter,
    lead_data: dict,
) -> tuple[list[LoanOffer], int, str]:
    start = time.time()
    source = "api" if isinstance(adapter, HttpPartnerAdapter) else "mock"
    try:
        raw_offers = await adapter.fetch_offers(lead_data)
        elapsed_ms = int((time.time() - start) * 1000)
        offers = []
        for raw in raw_offers:
            emi = _calculate_emi(raw.loan_amount, raw.interest_rate, raw.tenure_months)
            offers.append(
                LoanOffer(
                    offer_id=raw.offer_id,
                    lender_name=raw.lender_name,
                    lender_logo=raw.lender_logo,
                    loan_amount=raw.loan_amount,
                    interest_rate=raw.interest_rate,
                    tenure_months=raw.tenure_months,
                    emi=emi,
                    processing_fee=raw.processing_fee,
                    approval_chance=raw.approval_chance,  # type: ignore
                    features=raw.features,
                    lender_api_source=source,
                    response_time_ms=elapsed_ms,
                )
            )
        return offers, elapsed_ms, source
    except Exception:
        return [], 0, source


async def fetch_all_partner_offers(
    db: Session,
    lead: Lead,
) -> tuple[list[LoanOffer], int, int]:
    lead_data = lead_to_api_payload(lead)
    if not lead_data.get("max_loan_amount"):
        mult = 20 if (lead.employment_type or "salaried") == "salaried" else 15
        income = float(lead.monthly_income or 0)
        lead_data["max_loan_amount"] = min(int(income * mult), 500000)

    configs = get_enabled_partner_configs(db)
    adapters = [_create_adapter(c) for c in configs]

    tasks = [_fetch_from_partner(a, lead_data) for a in adapters]
    results = await asyncio.gather(*tasks)

    all_offers: list[LoanOffer] = []
    responded = 0
    for offers, _, _ in results:
        if offers:
            responded += 1
            all_offers.extend(offers)

    all_offers.sort(key=lambda o: (o.interest_rate, -o.loan_amount))
    if all_offers:
        best = all_offers[0]
        all_offers[0] = best.model_copy(update={"is_best_deal": True})

    return all_offers, len(configs), responded


def fetch_partner_offers_sync(db: Session, lead: Lead) -> tuple[list[LoanOffer], int, int]:
    return asyncio.run(fetch_all_partner_offers(db, lead))
