"""Build prefill payloads for external partner handoff pages (e.g. Choice Connect)."""

from __future__ import annotations

from urllib.parse import parse_qs, urlencode, urlparse, urlunparse

from app.models import Lead, LendingPartner


def split_full_name(full_name: str | None) -> tuple[str, str]:
    if not full_name or not full_name.strip():
        return ("", "")
    parts = full_name.strip().split()
    if len(parts) == 1:
        return (parts[0], parts[0])
    return (parts[0], " ".join(parts[1:]))


def map_occupation(employment_type: str | None) -> str:
    mapping = {
        "salaried": "Salaried",
        "self_employed": "Self Employed",
        "business": "Business Owner",
    }
    return mapping.get(employment_type or "", "Salaried")


def format_dob_ddmmyyyy(dob: str | None) -> str:
    if not dob:
        return ""
    # YYYY-MM-DD -> DD-MM-YYYY
    if len(dob) == 10 and dob[4] == "-":
        y, m, d = dob.split("-")
        return f"{d}-{m}-{y}"
    return dob


def build_choice_connect_prefill(lead: Lead, partner: LendingPartner) -> dict:
    first, last = split_full_name(lead.full_name)
    return {
        "firstName": first,
        "lastName": last,
        "mobile": lead.mobile or "",
        "email": lead.email or "",
        "pan": (lead.pan or "").upper(),
        "dob": format_dob_ddmmyyyy(lead.date_of_birth),
        "occupation": map_occupation(lead.employment_type),
        "monthlyIncome": str(int(lead.monthly_income or 0)),
        "pincode": lead.pincode or "",
        "city": lead.city or "",
        "gender": lead.gender or "",
        "loanPurpose": lead.loan_purpose or "personal",
        "cba_code": partner.partner_ref_code or "",
        "lead_source": partner.external_lead_source or "connect_referral_link",
    }


def build_handoff_embed_url(partner: LendingPartner, prefill: dict) -> str:
    """Embed URL with NeerCred prefill query params (for our handoff bridge page)."""
    base = partner.external_lending_url or ""
    if not base:
        return ""
    parsed = urlparse(base)
    query = parse_qs(parsed.query)
    # Preserve existing lead_source from partner URL if set
    for key, value in prefill.items():
        if value and key not in ("cba_code", "lead_source"):
            query[key] = [str(value)]
    if prefill.get("lead_source"):
        query["lead_source"] = [prefill["lead_source"]]
    new_query = urlencode({k: v[0] for k, v in query.items()})
    return urlunparse(parsed._replace(query=new_query))


def parse_choice_connect_url(url: str) -> dict:
    """Extract cba_code and lead_source from Choice Connect referral URL."""
    parsed = urlparse(url)
    parts = [p for p in parsed.path.split("/") if p]
    cba_code = parts[-1] if parts else None
    qs = parse_qs(parsed.query)
    lead_source_raw = (qs.get("lead_source") or [None])[0]
    lead_source = lead_source_raw
    if lead_source_raw:
        try:
            import base64

            decoded = base64.b64decode(lead_source_raw).decode("utf-8")
            if decoded:
                lead_source = decoded
        except Exception:
            pass
    return {"cba_code": cba_code, "lead_source": lead_source or "connect_referral_link"}
