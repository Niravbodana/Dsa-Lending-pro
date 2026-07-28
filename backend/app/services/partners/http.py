"""HTTP partner adapter — calls real partner lender APIs."""

import httpx

from app.services.partners.base import PartnerAdapter, PartnerOfferRaw


class HttpPartnerAdapter(PartnerAdapter):
    """
    Real partner API integration.
    Set PARTNER_{ID}_API_URL and PARTNER_{ID}_API_KEY in .env to enable.
    Expected API response format:
    {
      "offers": [{
        "offer_id": "...",
        "loan_amount": 300000,
        "interest_rate": 11.5,
        "tenure_months": 36,
        "processing_fee": "2%",
        "features": ["..."],
        "approval_chance": "high"
      }]
    }
    """

    async def fetch_offers(
        self,
        monthly_income: float,
        employment_type: str,
        city: str,
        pan: str,
        max_loan_amount: int,
    ) -> list[PartnerOfferRaw]:
        if not self.config.api_url or not self.config.api_key:
            return []

        payload = {
            "monthly_income": monthly_income,
            "employment_type": employment_type,
            "city": city,
            "pan": pan,
            "max_loan_amount": max_loan_amount,
        }

        try:
            async with httpx.AsyncClient(timeout=self.config.timeout_seconds) as client:
                response = await client.post(
                    self.config.api_url,
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {self.config.api_key}",
                        "Content-Type": "application/json",
                    },
                )
                response.raise_for_status()
                data = response.json()

            offers = []
            for item in data.get("offers", []):
                offers.append(
                    PartnerOfferRaw(
                        offer_id=item["offer_id"],
                        lender_name=self.config.lender_name,
                        lender_logo=self.config.lender_logo,
                        loan_amount=item["loan_amount"],
                        interest_rate=item["interest_rate"],
                        tenure_months=item["tenure_months"],
                        processing_fee=item.get("processing_fee", "As per lender"),
                        features=item.get("features", []),
                        approval_chance=item.get("approval_chance", "medium"),
                    )
                )
            return offers
        except Exception:
            return []
