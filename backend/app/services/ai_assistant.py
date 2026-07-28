"""Rule-based AI assistant for Neer Loan Solutions — English responses."""

from __future__ import annotations

import re

QUICK_REPLIES = [
    "How do I apply for a loan?",
    "How much loan can I get?",
    "What documents are needed?",
    "Calculate my EMI",
    "Track my application",
    "What are the interest rates?",
]

GREETING = (
    "Hello! I'm **Neer AI** — your personal loan assistant. "
    "I can help with loan applications, eligibility, KYC, EMI, and tracking. "
    "Try a quick option below or type your question!"
)


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower().strip())


def _match(text: str, *keywords: str) -> bool:
    return any(k in text for k in keywords)


def _calc_emi(text: str) -> str | None:
    amounts = re.findall(r"(\d[\d,]*)\s*(?:lakh|lac|l)?", text)
    rates = re.findall(r"(\d+(?:\.\d+)?)\s*%", text)
    tenures = re.findall(r"(\d+)\s*(?:month|months|emi)", text)

    principal = None
    for a in amounts:
        val = float(a.replace(",", ""))
        if _match(text, "lakh", "lac", "l"):
            val *= 100000
        if val >= 10000:
            principal = val
            break

    rate = float(rates[0]) if rates else 12.0
    tenure = int(tenures[0]) if tenures else 36

    if principal is None:
        nums = [float(n.replace(",", "")) for n in re.findall(r"\b(\d[\d,]*)\b", text)]
        big = [n for n in nums if n >= 10000]
        if big:
            principal = big[0]
        elif len(nums) >= 2:
            principal, tenure = nums[0], int(nums[1])
        else:
            return None

    monthly_rate = rate / 12 / 100
    if monthly_rate == 0:
        emi = principal / tenure
    else:
        emi = principal * monthly_rate * (1 + monthly_rate) ** tenure / ((1 + monthly_rate) ** tenure - 1)

    total = emi * tenure
    interest = total - principal
    return (
        f"📊 **EMI Estimate**\n\n"
        f"• Loan amount: ₹{principal:,.0f}\n"
        f"• Interest rate: {rate}% p.a.\n"
        f"• Tenure: {tenure} months\n\n"
        f"**Monthly EMI: ₹{emi:,.0f}**\n"
        f"Total interest: ₹{interest:,.0f}\n"
        f"Total repayment: ₹{total:,.0f}\n\n"
        f"For exact offers, visit /apply — partner lenders will show your best rates!"
    )


def generate_reply(message: str, history: list[dict[str, str]] | None = None) -> tuple[str, list[str]]:
    text = _normalize(message)

    if not text or _match(text, "hi", "hello", "hey", "start"):
        return GREETING, QUICK_REPLIES[:4]

    emi_reply = _calc_emi(text)
    if emi_reply and _match(text, "emi", "calculate", "monthly", "%", "lakh", "lac"):
        return emi_reply, ["Apply for a loan", "View rates", "Documents list"]

    if _match(text, "apply", "application", "how to", "start"):
        return (
            "🚀 **How to Apply**\n\n"
            "1. Click **Apply Now** or go to /apply\n"
            "2. Verify your mobile with OTP\n"
            "3. Enter PAN, income, and city\n"
            "4. Run eligibility check (2–5 min)\n"
            "5. Compare partner offers and select the best\n"
            "6. Complete KYC: Aadhaar OTP → Bank verify → eSign\n"
            "7. Track on your dashboard\n\n"
            "The entire process is **100% digital** from home!"
        ), ["What documents are needed?", "KYC process", "Track application"]

    if _match(text, "eligib", "qualif", "maximum", "limit", "how much"):
        return (
            "✅ **Eligibility Criteria**\n\n"
            "• Age: 21–58 years\n"
            "• Min income: ₹15,000/month (salaried)\n"
            "• Valid PAN & Aadhaar, Indian resident\n"
            "• CIBIL 650+ preferred\n"
            "• Max loan: **₹5,00,000**\n\n"
            "Visit /apply for real-time eligibility based on your profile."
        ), ["Apply for a loan", "Calculate EMI", "Documents list"]

    if _match(text, "document", "kyc", "aadhaar", "pan"):
        return (
            "📄 **Documents Required**\n\n"
            "• **PAN Card** (mandatory)\n"
            "• **Aadhaar** — OTP-based eKYC\n"
            "• **Bank account** for disbursal\n"
            "• **Address proof** — Aadhaar is sufficient\n\n"
            "No physical uploads — fully digital KYC!"
        ), ["KYC process", "Apply for a loan", "Track application"]

    if _match(text, "rate", "interest", "roi", "percent"):
        return (
            "📉 **Interest Rates**\n\n"
            "Rates start from **10.99%** with partner lenders.\n\n"
            "• HDFC Bank — from 10.99%\n"
            "• ICICI Bank — from 11.25%\n"
            "• Bajaj Finserv — from 11.50%\n\n"
            "Visit /rates to compare or /apply for personalized offers."
        ), ["Calculate EMI", "Apply for a loan", "Eligibility criteria"]

    if _match(text, "track", "status", "ref", "nlr"):
        return (
            "📍 **Track Your Application**\n\n"
            "• **Track page**: /track — enter ref + mobile\n"
            "• **Dashboard**: /dashboard — OTP login\n\n"
            "Ref format: **NLR######**\n"
            "Statuses: Submitted → Under Review → Approved → Disbursed"
        ), ["Apply for a loan", "Processing time", "Contact support"]

    if _match(text, "emi", "repay", "installment"):
        emi_reply = _calc_emi(text)
        if emi_reply:
            return emi_reply, ["Apply for a loan", "Interest rates", "Prepayment rules"]
        return (
            "💰 **About EMI**\n\n"
            "EMI is your monthly loan repayment.\n"
            "Example: ₹3,00,000 @ 12% for 36 months ≈ **₹9,964/month**\n\n"
            "Type: `3 lakh 12% 36 months` and I'll calculate it!"
        ), ["Calculate EMI 3 lakh 12% 36", "Apply for a loan", "Interest rates"]

    if _match(text, "contact", "support", "call", "email", "help"):
        return (
            "📞 **Contact Support**\n\n"
            "• Phone: +91 98765 43210\n"
            "• Email: support@neerloansolutions.com\n"
            "• Help Center: /help\n"
            "• Grievance: grievance@neerloansolutions.com\n\n"
            "Mon–Sat, 9 AM – 7 PM IST"
        ), ["Apply for a loan", "Track application", "Compliance info"]

    if _match(text, "rbi", "compliance", "safe", "legal", "dpdp"):
        return (
            "🏛️ **Safety & Compliance**\n\n"
            "Neer Loan Solutions is an **RBI LSP registered** platform.\n"
            "We do not lend directly — we connect you with partner lenders.\n"
            "Full details at /compliance"
        ), ["Apply for a loan", "Documents list", "Contact DPO"]

    return (
        "🤔 I'm your loan specialist! I can help with:\n"
        "• Loan application process\n"
        "• Eligibility & max amount\n"
        "• Documents & KYC\n"
        "• EMI calculation\n"
        "• Application tracking\n\n"
        "Choose a quick option below or ask clearly!"
    ), QUICK_REPLIES
