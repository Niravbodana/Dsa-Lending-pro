"""Rule-based AI assistant for Neer Loan Solutions — loan marketplace help."""

from __future__ import annotations

import re
from typing import Literal

Role = Literal["user", "assistant"]

QUICK_REPLIES = [
    "Loan kaise apply karun?",
    "Kitna loan mil sakta hai?",
    "Documents kya chahiye?",
    "EMI calculate karo",
    "Application track karo",
    "Interest rate kya hai?",
]

GREETING = (
    "Namaste! Main Neer AI hoon — aapka personal loan assistant. "
    "Loan apply, eligibility, KYC, EMI, tracking — sab mein madad kar sakta hoon. "
    "Neeche quick options try karo ya apna sawal likho!"
)


def _normalize(text: str) -> str:
    return re.sub(r"\s+", " ", text.lower().strip())


def _match(text: str, *keywords: str) -> bool:
    return any(k in text for k in keywords)


def _calc_emi(text: str) -> str | None:
    amounts = re.findall(r"(\d[\d,]*)\s*(?:lakh|lac|l)?", text)
    rates = re.findall(r"(\d+(?:\.\d+)?)\s*%", text)
    tenures = re.findall(r"(\d+)\s*(?:month|mahine|emi)", text)

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
        f"Exact offer ke liye /apply pe jao — partner lenders se best rate milega!"
    )


def generate_reply(message: str, history: list[dict[str, str]] | None = None) -> tuple[str, list[str]]:
    text = _normalize(message)
    suggestions: list[str] = []

    if not text or _match(text, "hi", "hello", "namaste", "hey", "start"):
        return GREETING, QUICK_REPLIES[:4]

    emi_reply = _calc_emi(text)
    if emi_reply and _match(text, "emi", "calculate", "kitna", "monthly", "%", "lakh", "lac"):
        return emi_reply, ["Loan apply karo", "Best rates dekho", "Documents list"]

    if _match(text, "apply", "application", "kaise", "start", "shuru"):
        return (
            "🚀 **Loan Apply Kaise Karein?**\n\n"
            "1. **Apply Now** button dabao ya /apply pe jao\n"
            "2. Mobile number + OTP verify karo\n"
            "3. PAN, income, city details bharo\n"
            "4. Eligibility check (2-5 min)\n"
            "5. Partner offers compare karo — best deal select karo\n"
            "6. KYC: Aadhaar OTP → Bank verify → eSign\n"
            "7. Done! Dashboard pe track karo\n\n"
            "Poora process **100% digital** hai — ghar baithe complete ho jata hai!"
        ), ["Documents kya chahiye?", "KYC process", "Track application"]

    if _match(text, "eligib", "qualif", "mil sakta", "kitna loan", "maximum", "limit"):
        return (
            "✅ **Eligibility Criteria**\n\n"
            "• Age: 21–58 years\n"
            "• Min income: ₹15,000/month (salaried)\n"
            "• Indian resident with valid PAN & Aadhaar\n"
            "• CIBIL 650+ preferred (lower score pe bhi try karo)\n"
            "• Max loan: **₹5,00,000** tak\n\n"
            "Exact amount aapki income, existing EMI aur credit profile pe depend karta hai. "
            "/apply pe jao — real-time eligibility milegi!"
        ), ["Loan apply karo", "EMI calculate karo", "Documents list"]

    if _match(text, "document", "kyc", "aadhaar", "pan", "paper"):
        return (
            "📄 **Documents Required**\n\n"
            "• **PAN Card** (mandatory)\n"
            "• **Aadhaar** — OTP se eKYC\n"
            "• **Bank account** — salary / business account\n"
            "• **Address proof** — Aadhaar sufficient\n\n"
            "Koi physical copy upload nahi — sab **digital KYC** se hota hai!\n"
            "KYC page: Aadhaar OTP → ₹1 penny drop → Digital eSign"
        ), ["KYC kaise hota hai?", "Loan apply karo", "Track application"]

    if _match(text, "kyc", "aadhaar", "esign", "penny", "verify"):
        return (
            "🔐 **KYC Process (Step by Step)**\n\n"
            "1. **Aadhaar eKYC** — OTP aayega registered mobile pe\n"
            "2. **Bank Verification** — ₹1 penny drop, account match\n"
            "3. **Digital eSign** — loan agreement sign (IT Act valid)\n"
            "4. **Submit** — lender ko application forward\n\n"
            "Data encrypted hai, DPDP Act compliant. "
            "Details: /compliance page dekho."
        ), ["Application track karo", "Kitna time lagta hai?", "Contact support"]

    if _match(text, "rate", "interest", "roi", "percent", "%"):
        return (
            "📉 **Interest Rates**\n\n"
            "Neer Loan Solutions pe rates **10.99% se shuru** hote hain.\n\n"
            "Partner lenders:\n"
            "• HDFC Bank — from 10.99%\n"
            "• ICICI Bank — from 11.25%\n"
            "• Bajaj Finserv — from 11.50%\n"
            "• Tata Capital, IDFC, etc.\n\n"
            "Exact rate aapki profile pe depend karta hai. "
            "/rates pe compare karo ya /apply se personalized offers lo!"
        ), ["EMI calculate karo", "Loan apply karo", "Best deal kaise milega?"]

    if _match(text, "track", "status", "ref", "nlr", "kahan", "progress"):
        return (
            "📍 **Application Track Kaise Karein?**\n\n"
            "• **Track page**: /track — Application Ref + Mobile daalo\n"
            "• **Dashboard**: /dashboard — OTP login, saari applications\n\n"
            "Ref format: **NLR######** (e.g. NLR123456)\n"
            "Status: Submitted → Under Review → Approved → Disbursed\n\n"
            "SMS updates bhi aate hain har stage pe!"
        ), ["Loan apply karo", "Kitna time lagta hai?", "Contact support"]

    if _match(text, "time", "kitne din", "fast", "jaldi", "approval"):
        return (
            "⏱️ **Processing Time**\n\n"
            "• Eligibility check: **2–5 minutes**\n"
            "• Offer comparison: instant\n"
            "• KYC completion: **10–15 minutes**\n"
            "• Lender approval: same day to 48 hours\n"
            "• Disbursal: approval ke baad **24–48 hours**\n\n"
            "Sabse fast track: subah apply karo, sham tak approval possible!"
        ), ["Loan apply karo", "Track application", "Documents list"]

    if _match(text, "emi", "repay", "monthly", "installment"):
        emi_reply = _calc_emi(text)
        if emi_reply:
            return emi_reply, ["Loan apply karo", "Prepayment rules", "Best rates"]
        return (
            "💰 **EMI ke baare mein**\n\n"
            "EMI = Monthly installment jo aap lender ko dete ho.\n"
            "Formula: loan amount + interest / tenure\n\n"
            "Example: ₹3,00,000 @ 12% for 36 months ≈ **₹9,964/month**\n\n"
            "Mujhe likho: `3 lakh 12% 36 months` — main calculate kar dunga!\n"
            "Ya homepage pe EMI Calculator use karo."
        ), ["EMI calculate karo 3 lakh 12% 36", "Loan apply karo", "Interest rates"]

    if _match(text, "refer", "earn", "cashback", "reward"):
        return (
            "🎁 **Refer & Earn ₹2,000!**\n\n"
            "Dost ko Neer Loan Solutions pe refer karo:\n"
            "• Unka loan disburse hone pe **₹2,000** aapko\n"
            "• Unhe bhi special rate benefit mil sakta hai\n\n"
            "Details: /refer page dekho!"
        ), ["Loan apply karo", "Share link", "Contact support"]

    if _match(text, "partner", "dsa", "nbfc", "bank", "lender"):
        return (
            "🤝 **Partner With Us**\n\n"
            "Banks, NBFCs aur DSA agents ke liye:\n"
            "• Quality pre-verified leads\n"
            "• API integration ready\n"
            "• Real-time webhook status updates\n"
            "• Commission tracking in admin panel\n\n"
            "/partner-with-us pe details aur contact form hai."
        ), ["Loan apply karo", "Contact support", "About Neer Loan"]

    if _match(text, "rbi", "compliance", "safe", "legal", "dpdp", "privacy"):
        return (
            "🏛️ **Safety & Compliance**\n\n"
            "Neer Loan Solutions ek **RBI LSP registered** platform hai.\n"
            "• Hum khud loan nahi dete — partner lenders se connect karte hain\n"
            "• Paisa seedha aapke account mein lender se aata hai\n"
            "• DPDP Act compliant data handling\n"
            "• Grievance: grievance@neerloansolutions.com\n\n"
            "Full details: /compliance page"
        ), ["Loan apply karo", "Documents list", "Contact DPO"]

    if _match(text, "contact", "support", "call", "email", "help", "complaint"):
        return (
            "📞 **Contact Support**\n\n"
            "• Phone: +91 98765 43210\n"
            "• Email: support@neerloansolutions.com\n"
            "• WhatsApp: green button bottom-right\n"
            "• Grievance: grievance@neerloansolutions.com\n"
            "• Help Center: /help\n\n"
            "Mon–Sat, 9 AM – 7 PM. Hum jaldi respond karte hain!"
        ), ["Loan apply karo", "Track application", "Grievance process"]

    if _match(text, "admin", "commission", "bug"):
        return (
            "ℹ️ Customer support ke liye main yahan hoon!\n\n"
            "Loan apply, track, KYC, rates — in sab mein help kar sakta hoon. "
            "Koi specific loan sawal pucho?"
        ), QUICK_REPLIES[:3]

  # Fallback with context from history
    if history:
        last_user = next((h["content"] for h in reversed(history) if h.get("role") == "user"), "")
        if last_user and last_user != message:
            nested = generate_reply(last_user, None)
            if nested[0] != GREETING:
                return (
                    f"Samajh gaya! Thoda aur detail:\n\n{nested[0]}"
                ), nested[1]

    return (
        "🤔 Yeh sawal thoda alag hai — main loan specialist hoon!\n\n"
        "Main help kar sakta hoon:\n"
        "• Loan apply process\n"
        "• Eligibility & max amount\n"
        "• Documents & KYC\n"
        "• EMI calculation\n"
        "• Application tracking\n"
        "• Interest rates\n\n"
        "Neeche quick option choose karo ya clearly likho!"
    ), QUICK_REPLIES
