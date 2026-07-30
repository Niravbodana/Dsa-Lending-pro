#!/usr/bin/env bash
# NeerCred backend — Mac first-time setup (use Python 3.12, NOT 3.14)
set -euo pipefail

cd "$(dirname "$0")"

PYTHON=""
for candidate in python3.12 python3.11 python3.10; do
  if command -v "$candidate" >/dev/null 2>&1; then
    PYTHON="$candidate"
    break
  fi
done

if [[ -z "$PYTHON" ]]; then
  echo "ERROR: Python 3.12 not found."
  echo "Install with: brew install python@3.12"
  echo "Your default python3 is too new (3.14) — pydantic will not install."
  exit 1
fi

VER=$("$PYTHON" --version 2>&1)
echo "Using $VER"

if [[ "$VER" == *"3.14"* ]]; then
  echo "ERROR: Do not use Python 3.14. Run: brew install python@3.12"
  exit 1
fi

echo "Removing old .venv (if any)..."
rm -rf .venv

echo "Creating virtual environment..."
"$PYTHON" -m venv .venv
source .venv/bin/activate

pip install --upgrade pip
pip install -r requirements.txt

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Created backend/.env from .env.example"
fi

echo ""
echo "Setup complete. Start backend with:"
echo "  cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --port 8000"
