#!/usr/bin/env bash
# First-time backend setup (Mac/Linux). Run from the backend/ folder:
#   chmod +x setup.sh && ./setup.sh

set -euo pipefail

cd "$(dirname "$0")"

pick_python() {
  for candidate in python3.12 python3.11 python3.10 python3; do
    if command -v "$candidate" >/dev/null 2>&1; then
      echo "$candidate"
      return 0
    fi
  done
  return 1
}

PYTHON_BIN="$(pick_python || true)"
if [[ -z "${PYTHON_BIN}" ]]; then
  echo "Error: Python 3.10+ not found."
  echo "On Mac install: brew install python@3.12"
  exit 1
fi

PY_VERSION="$("$PYTHON_BIN" -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')"
PY_MAJOR="${PY_VERSION%%.*}"
PY_MINOR="${PY_VERSION#*.}"

if [[ "$PY_MAJOR" -gt 3 ]] || [[ "$PY_MAJOR" -eq 3 && "$PY_MINOR" -ge 14 ]]; then
  echo "Error: Python $PY_VERSION is too new for this project (pydantic-core has no wheels yet)."
  echo ""
  echo "Install Python 3.12 and recreate the venv:"
  echo "  brew install python@3.12"
  echo "  rm -rf .venv"
  echo "  python3.12 -m venv .venv"
  echo "  source .venv/bin/activate"
  echo "  pip install -r requirements.txt"
  exit 1
fi

if [[ "$PY_MAJOR" -lt 3 ]] || [[ "$PY_MAJOR" -eq 3 && "$PY_MINOR" -lt 10 ]]; then
  echo "Error: Python $PY_VERSION is too old. Need Python 3.10–3.13."
  exit 1
fi

echo "Using $PYTHON_BIN ($("$PYTHON_BIN" --version))"

if [[ -d .venv ]]; then
  VENV_PY="$(.venv/bin/python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")' 2>/dev/null || echo "")"
  if [[ -n "$VENV_PY" ]] && { [[ "${VENV_PY%%.*}" -gt 3 ]] || [[ "${VENV_PY%%.*}" -eq 3 && "${VENV_PY#*.}" -ge 14 ]]; }; then
    echo "Removing broken .venv (Python $VENV_PY)..."
    rm -rf .venv
  fi
fi

if [[ ! -d .venv ]]; then
  echo "Creating virtual environment (.venv)..."
  "$PYTHON_BIN" -m venv .venv
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
