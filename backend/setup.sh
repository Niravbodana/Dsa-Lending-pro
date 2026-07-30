#!/usr/bin/env bash
# First-time backend setup (Mac/Linux). Run from the backend/ folder:
#   chmod +x setup.sh && ./setup.sh

set -euo pipefail

cd "$(dirname "$0")"

if ! command -v python3 >/dev/null 2>&1; then
  echo "Error: python3 not found. Install Python 3.10+ first."
  exit 1
fi

if [[ ! -d .venv ]]; then
  echo "Creating virtual environment (.venv)..."
  python3 -m venv .venv
else
  echo "Virtual environment already exists."
fi

# shellcheck disable=SC1091
source .venv/bin/activate

echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Created backend/.env from .env.example"
fi

echo ""
echo "Setup complete. Start the server with:"
echo "  source .venv/bin/activate && uvicorn app.main:app --reload --port 8000"
