"""PAN verification — mock in dev; wire NSDL/ITD provider in production."""

from __future__ import annotations

import hashlib
import re

PAN_RE = re.compile(r"^[A-Z]{5}\d{4}[A-Z]$")

# Deterministic mock names for dev/demo
_MOCK_NAMES = [
    "RAHUL KUMAR SHARMA",
    "PRIYA SINGH PATEL",
    "AMIT VERMA GUPTA",
    "NEHA REDDY NAIR",
    "VIKASH JOSHI MEHTA",
    "ANJALI DESAI KHAN",
    "SURESH IYER MALHOTRA",
    "KAVITA BANERJEE RAO",
]


def validate_pan_format(pan: str) -> str:
    p = pan.strip().upper()
    if not PAN_RE.match(p):
        raise ValueError("Invalid PAN format")
    return p


def lookup_pan(pan: str) -> dict:
    """
    Returns verified PAN holder details.
    Production: replace with NSDL e-KYC / ITD PAN verification API.
    """
    p = validate_pan_format(pan)
    idx = int(hashlib.sha256(p.encode()).hexdigest(), 16) % len(_MOCK_NAMES)
    name = _MOCK_NAMES[idx]
    # Derive DOB from PAN digits for consistent demo
    digits = int(p[5:9])
    year = 1970 + (digits % 35)
    month = 1 + (digits % 12)
    day = 1 + (digits % 28)
    gender = "female" if p[9] in "FMP" else "male"
    return {
        "pan": p,
        "full_name": name,
        "date_of_birth": f"{year:04d}-{month:02d}-{day:02d}",
        "gender": gender,
        "verified": True,
        "source": "mock",
    }
