# DSA Lending Pro

Personal Loan Marketplace — connect customers with partner banks & NBFCs. Similar to MoneyView / Navi.

## Phase 1 MVP (Current)

- Landing page with eligibility CTA
- Mobile OTP verification (mock in dev)
- Lead capture form (Name, PAN, Income, Employment, City)
- Partner loan offers display (mock — ready for real API integration in Phase 2)
- Offer selection & lead storage in PostgreSQL

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React, Tailwind CSS |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Database | PostgreSQL |
| Cache | Redis (ready for Phase 2) |

## Quick Start

### 1. Start database

```bash
docker compose up -d
```

### 2. Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # if .env doesn't exist
uvicorn app.main:app --reload --port 8000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000**

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/send-otp` | Send OTP to mobile |
| POST | `/api/auth/verify-otp` | Verify OTP, get session token |
| POST | `/api/leads/details` | Save lead details |
| GET | `/api/leads/offers` | Fetch partner offers |
| POST | `/api/leads/select-offer` | Select an offer |

## Roadmap

- **Phase 2:** Real partner lender API integration
- **Phase 3:** eKYC, bank verification, eSign
- **Phase 4:** Loan status tracking & webhooks
- **Phase 5:** User dashboard & EMI calculator
- **Phase 6:** Admin panel & commission tracking

## License

Apache 2.0
