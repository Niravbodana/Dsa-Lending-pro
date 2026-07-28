# DSA Lending Pro — Complete A to Z Loan Marketplace

Personal Loan Marketplace (LSP model) — MoneyView/Navi style. Connect customers with partner banks, earn commission on disbursal.

## Full Platform Features

| Phase | Feature |
|-------|---------|
| **1** | Landing page, OTP login, lead capture, partner offers |
| **2** | Eligibility engine, parallel partner API offers, best deal ranking |
| **3** | Aadhaar eKYC, bank penny drop, digital eSign, application submit |
| **4** | Status tracking, partner webhooks, SMS notifications |
| **5** | User dashboard, EMI schedule, application timeline |
| **6** | Admin panel — leads, applications, commissions, bug fixer |

## Pages

| URL | Description |
|-----|-------------|
| `/` | Premium homepage |
| `/apply` | 5-step loan application |
| `/application/[id]/kyc` | KYC + eSign flow |
| `/dashboard` | User dashboard (OTP login) |
| `/track` | Track loan by ref + mobile |
| `/compliance` | RBI LSP + DPDP Act |
| `/admin` | Admin panel (`admin123`) |

## Quick Start

```bash
# Backend
cd backend && source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend && npm install && npm run dev
```

## Partner API Integration

```env
PARTNER_HDFC_API_URL=https://your-api.com/offers
PARTNER_HDFC_API_KEY=your-key
```

## Webhook (Partner Status Updates)

```bash
POST /api/webhooks/partner/status
{
  "application_ref": "DSA123456",
  "status": "disbursed",
  "message": "Loan disbursed",
  "disbursal_amount": 500000
}
```

## License

Apache 2.0
