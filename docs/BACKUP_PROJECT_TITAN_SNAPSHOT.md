# Project Titan Era — Full Backup Snapshot

**Created:** 30 July 2026  
**Git branch:** `backup/project-titan-snapshot-0fce`  
**Source:** `cursor/lsp-compliance-suite-0fce` @ `9989baa`

## What this backup contains

Everything after the **Project Titan** UX prompt was applied:

| Commit | Description |
|--------|-------------|
| `433f93a` | Project Titan — enterprise UX redesign (JourneyStepHeader, comparison table, design system, admin console, etc.) |
| `f271e5f` | Admin login + mobile session restore + API proxy |
| `4784276` | LSP compliance suite (KFS, handoff tracking, bureau, DPDP) |
| `3af2f05` | CMS images fix + native fast scroll |
| `3160966` | Mac backend setup docs |
| `9989baa` | Python 3.12 setup script (reject 3.14) |

## NOT included (later stable restore on `main`)

- OTP proxy fix (`79b65c7`)
- Restore to pre-Titan stable workflow (PR #30)

## How to run (Mac)

```bash
# Backend — use Python 3.12
cd backend
./setup-mac.sh   # or: python3.12 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload --port 8000

# Frontend
cd frontend
npm install
npm run dev
```

- Site: http://localhost:3000  
- Admin: http://localhost:3000/admin — password `admin123`  
- Titan report: `docs/PROJECT_TITAN_REPORT.md`

## Restore this branch from git

```bash
git fetch origin
git checkout backup/project-titan-snapshot-0fce
```
