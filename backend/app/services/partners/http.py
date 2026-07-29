"""HTTP partner adapter — calls lending partner APIs configured in admin panel."""

import httpx

from app.services.partners.base import PartnerAdapter, PartnerOfferRaw


class HttpPartnerAdapter(PartnerAdapter):
    """
    POST lead payload to partner offers API.
    Default path: {api_url}/offers — configurable per partner in admin.
  Expected response:
    {"offers": [{"offer_id", "loan_amount", "interest_rate", "tenure_months", ...}]}
    """

    def _build_url(self) -> str:
        base = (self.config.api_url or "").rstrip("/")
        path = (self.config.offers_endpoint_path or "/offers").strip()
        if not path.startswith("/"):
            path = f"/{path}"
        return f"{base}{path}"

    def _auth_headers(self) -> dict[str, str]:
        headers = {"Content-Type": "application/json"}
        if not self.config.api_key:
            return headers
        name = self.config.auth_header_name or "Authorization"
        if self.config.auth_type == "api_key_header":
            headers[name] = self.config.api_key
        else:
            headers[name] = f"Bearer {self.config.api_key}"
        return headers

    def _payload(self, lead_data: dict) -> dict:
        required = set(self.config.required_fields or [])
        if required:
            return {k: lead_data.get(k) for k in required if lead_data.get(k) is not None}
        return {
            k: v
            for k, v in lead_data.items()
            if v is not None and k not in {"eligibility_score"}
        }

    async def fetch_offers(self, lead_data: dict) -> list[PartnerOfferRaw]:
        if not self.config.api_url or not self.config.api_key:
            return []

        try:
            async with httpx.AsyncClient(timeout=self.config.timeout_seconds) as client:
                response = await client.post(
                    self._build_url(),
                    json=self._payload(lead_data),
                    headers=self._auth_headers(),
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
