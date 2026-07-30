"""Key Fact Statement (KFS) builder — RBI digital lending disclosure."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone

from app.models import Lead, LoanApplication

COOLING_OFF_DAYS = 3
DEFAULT_PROCESSING_FEE_PCT = 2.0
LSP_NAME = "NeerCred"
LSP_DISCLOSURE = (
    "NeerCred is an RBI-registered Loan Service Provider (LSP). "
    "The loan is sanctioned and disbursed by the Regulated Entity (RE) named below. "
    "NeerCred does not lend money directly."
)


def build_kfs(app: LoanApplication, lead: Lead | None) -> dict:
    fee_pct = app.processing_fee_pct or DEFAULT_PROCESSING_FEE_PCT
    processing_fee = round(app.loan_amount * fee_pct / 100)
    gst_on_fee = round(processing_fee * 0.18)
    total_payment = app.emi * app.tenure_months
    total_interest = max(0, total_payment - app.loan_amount)

    return {
        "lsp_name": LSP_NAME,
        "lsp_disclosure": LSP_DISCLOSURE,
        "lender_name": app.lender_name,
        "application_ref": app.application_ref,
        "borrower_name": lead.full_name if lead else None,
        "loan_amount": app.loan_amount,
        "interest_rate_pa": app.interest_rate,
        "apr_percent": round(app.interest_rate + fee_pct / app.tenure_months * 12, 2),
        "tenure_months": app.tenure_months,
        "emi": app.emi,
        "processing_fee": processing_fee,
        "processing_fee_pct": fee_pct,
        "gst_on_processing_fee": gst_on_fee,
        "total_interest": total_interest,
        "total_amount_payable": total_payment + processing_fee + gst_on_fee,
        "foreclosure_charges": "0%–4% depending on lender policy",
        "late_payment_penalty": "2% per month on overdue EMI",
        "bounce_charges": "₹500–₹750 per instance",
        "cooling_off_days": COOLING_OFF_DAYS,
        "cooling_off_note": (
            f"You may cancel without penalty within {COOLING_OFF_DAYS} days of loan disbursal "
            "by paying principal + proportionate interest (RBI cooling-off guidelines)."
        ),
    }


def cooling_off_deadline() -> datetime:
    return datetime.now(timezone.utc) + timedelta(days=COOLING_OFF_DAYS)
