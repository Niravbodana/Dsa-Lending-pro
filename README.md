# Neer Loan Solutions — Complete A to Z Loan Marketplace

Personal Loan Marketplace (LSP model) — premium digital lending platform. Connect customers with partner banks, earn commission on disbursal.

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
| `/loans` | All loan products |
| `/rates` | Interest rates comparison |
| `/about` | About Neer Loan Solutions |
| `/contact` | Contact & support |
| `/help` | Help center / FAQs |
| `/refer` | Refer & earn program |
| `/app` | Mobile app download |
| `/partner-with-us` | Lender & DSA partnerships |
| `/compliance` | RBI LSP + DPDP Act |
| `/admin` | Admin panel (`admin123`) — includes **Legal Consents** audit log |

## Legal Consent (DPDP Act 2023)

User consents are **persisted in the database** (`user_consents` table) with version, timestamp, IP, and page URL:

| Step | Consent types recorded |
|------|------------------------|
| Apply — mobile | `sms_otp` |
| Apply — details | `privacy_policy`, `terms_of_service`, `dpdp_data_processing`, optional `credit_bureau_check`, `marketing_communications` |
| Offer selection | `lender_data_sharing` |
| KYC eSign | `loan_agreement_esign` |
| Site-wide | `cookie_essential`, `cookie_analytics` (cookie banner) |

View records in **Admin → Legal Consents**. Policy version: `2026.1` (see `backend/app/services/consent.py`).

## Admin Site Builder (AI Chat CMS)

Edit the **homepage live** from Admin → **Site Builder AI**:

```
change headline to Dream Big. Borrow Smart.
set roi to 9.99%
change photo to wedding
change button text to Apply Karo Abhi
show urgency bar
urgency text: 500 people applied today
reset website to default
```

Homepage auto-refreshes every 15 seconds. Public config API: `GET /api/cms/config`.

## Quick Start (Mac / Linux)

**Stable branch:** `cursor/fix-mobile-fetch-0fce` (admin login, mobile session, photos, fast scroll)

```bash
# 1. Clone + checkout stable branch
git clone https://github.com/Niravbodana/Dsa-Lending-pro.git
cd Dsa-Lending-pro
git checkout cursor/fix-mobile-fetch-0fce

# 2. Backend (Terminal 1) — first time only
cd backend
chmod +x setup.sh && ./setup.sh
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000

# 3. Frontend (Terminal 2)
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local
npm run dev
```

Open **http://localhost:3000** — Admin password: `admin123`

### Already inside `backend/` folder?

Do **not** run `cd backend` again. If you see `source: no such file or directory: .venv/bin/activate`, create the venv first:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000
```

Or use the helper script: `chmod +x setup.sh && ./setup.sh`

> **Note:** Local dev uses SQLite (no PostgreSQL needed). For Docker/PostgreSQL use `pip install -r requirements-prod.txt`.

## Partner API Integration

```env
PARTNER_HDFC_API_URL=https://your-api.com/offers
PARTNER_HDFC_API_KEY=your-key
```

## Webhook (Partner Status Updates)

```bash
POST /api/webhooks/partner/status
{
  "application_ref": "NLR123456",
  "status": "disbursed",
  "message": "Loan disbursed",
  "disbursal_amount": 500000
}
```

## License

Apache 2.0
