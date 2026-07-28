# AGENTS.md

Guidance for AI agents working in this repository.

## Project overview

**DSA Lending Pro** is a Personal Loan Marketplace (LSP model) — customers apply for loans, we show offers from partner banks/NBFCs, and earn commission on disbursal. Similar to MoneyView / Navi.

## Cursor Cloud specific instructions

### Services

| Service | Port | How to start |
|---------|------|--------------|
| FastAPI backend | 8000 | `cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000` |
| Next.js frontend | 3000 | `cd frontend && npm run dev` |
| PostgreSQL | 5432 | Optional — `docker compose up -d` (uses SQLite by default in dev) |
| Redis | 6379 | Optional — `docker compose up -d` (not required for Phase 1) |

### First-time setup

```bash
cd backend && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
cd frontend && npm install
```

For PostgreSQL instead of SQLite, run `docker compose up -d` and set `DATABASE_URL=postgresql://dsa_user:dsa_pass@localhost:5432/dsa_lending` in `backend/.env`.

Copy `backend/.env.example` to `backend/.env` if missing. Frontend uses `frontend/.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:8000`.

### Lint / test / build

```bash
# Frontend lint
cd frontend && npm run lint

# Frontend build
cd frontend && npm run build

# Backend has no test suite yet
```

### Dev mode notes

- `MOCK_OTP=true` in `backend/.env` — any 6-digit OTP works; dev OTP is also returned in API response
- Partner offers in `backend/app/services/lender.py` are **mock data** — replace with real partner APIs in Phase 2
- Database tables are auto-created on backend startup via SQLAlchemy `create_all`

### Hello-world flow

1. Open http://localhost:3000
2. Click "Check Eligibility"
3. Enter mobile → OTP (use dev OTP shown) → fill details → view offers → select offer

### Secrets

None required for local dev. Production will need partner API keys, SMS gateway, etc.
