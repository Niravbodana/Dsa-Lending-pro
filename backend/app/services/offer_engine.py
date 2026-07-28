"""Phase 2 Offer Engine — parallel partner API calls + ranking."""

import asyncio
import math
import time
from typing import Literal

from app.config import settings
from app.schemas import LoanOffer
from app.services.partners.base import PartnerAdapter, PartnerConfig
from app.services.partners.http import HttpPartnerAdapter
from app.services.partners.mock import MockPartnerAdapter, PARTNER_PROFILES


def _calculate_emi(principal: int, annual_rate: float, tenure_months: int) -> int:
    monthly_rate = annual_rate / 12 / 100
    if monthly_rate == 0:
        return math.ceil(principal / tenure_months)
    emi = principal * monthly_rate * (1 + monthly_rate) ** tenure_months
    emi /= (1 + monthly_rate) ** tenure_months - 1
    return math.ceil(emi)


def _get_partner_configs() -> list[PartnerConfig]:
    configs = []
    partner_api_map = {
        "hdfc": (settings.partner_hdfc_api_url, settings.partner_hdfc_api_key),
        "icici": (settings.partner_icici_api_url, settings.partner_icici_api_key),
        "bajaj": (settings.partner_bajaj_api_url, settings.partner_bajaj_api_key),
    }
    for profile in PARTNER_PROFILES:
        api_url, api_key = partner_api_map.get(profile["partner_id"], (None, None))
        configs.append(
            PartnerConfig(
                partner_id=profile["partner_id"],
                lender_name=profile["lender_name"],
                lender_logo=profile["lender_logo"],
                api_url=api_url,
                api_key=api_key,
                enabled=True,
            )
        )
    return configs


def _create_adapter(config: PartnerConfig) -> PartnerAdapter:
    if config.api_url and config.api_key:
        return HttpPartnerAdapter(config)
    return MockPartnerAdapter(config)


async def _fetch_from_partner(
    adapter: PartnerAdapter,
    monthly_income: float,
    employment_type: str,
    city: str,
    pan: str,
    max_loan_amount: int,
) -> tuple[list[LoanOffer], int, str]:
    start = time.time()
    source = "api" if isinstance(adapter, HttpPartnerAdapter) else "mock"
    try:
        raw_offers = await adapter.fetch_offers(
            monthly_income, employment_type, city, pan, max_loan_amount
        )
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
    monthly_income: float,
    employment_type: str,
    city: str,
    pan: str,
    max_loan_amount: int,
) -> tuple[list[LoanOffer], int, int]:
    configs = [c for c in _get_partner_configs() if c.enabled]
    adapters = [_create_adapter(c) for c in configs]

    tasks = [
        _fetch_from_partner(a, monthly_income, employment_type, city, pan, max_loan_amount)
        for a in adapters
    ]
    results = await asyncio.gather(*tasks)

    all_offers: list[LoanOffer] = []
    responded = 0
    for offers, _, _ in results:
        if offers:
            responded += 1
            all_offers.extend(offers)

    # Sort by interest rate, mark best deal
    all_offers.sort(key=lambda o: (o.interest_rate, -o.loan_amount))
    if all_offers:
        best = all_offers[0]
        all_offers[0] = best.model_copy(update={"is_best_deal": True})

    return all_offers, len(configs), responded


def fetch_partner_offers_sync(
    monthly_income: float,
    employment_type: str,
    city: str,
    pan: str = "XXXXX0000X",
    max_loan_amount: int | None = None,
) -> tuple[list[LoanOffer], int, int]:
    """Sync wrapper for use in FastAPI sync endpoints."""
    if max_loan_amount is None:
        mult = 20 if employment_type == "salaried" else 15
        max_loan_amount = min(int(monthly_income * mult), 500000)

    return asyncio.run(
        fetch_all_partner_offers(
            monthly_income, employment_type, city, pan, max_loan_amount
        )
    )
