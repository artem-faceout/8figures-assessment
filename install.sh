#!/usr/bin/env bash
set -euo pipefail

# 8FIGURES Assessment — Full Project Setup
# Run from project root: ./install.sh

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

step() { echo -e "\n${BOLD}▸ $1${NC}"; }
ok()   { echo -e "  ${GREEN}✓ $1${NC}"; }
warn() { echo -e "  ${YELLOW}⚠ $1${NC}"; }
fail() { echo -e "  ${RED}✗ $1${NC}"; exit 1; }

# ── Check prerequisites ──────────────────────────────────────────────

step "Checking prerequisites"

# Node.js
if command -v node &>/dev/null; then
  NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
  if [ "$NODE_VERSION" -lt 20 ]; then
    # Try nvm
    if [ -s "$HOME/.nvm/nvm.sh" ]; then
      echo "  Node $NODE_VERSION is too old, switching via nvm..."
      export NVM_DIR="$HOME/.nvm"
      . "$NVM_DIR/nvm.sh"
      nvm use 2>/dev/null || nvm install 22
      ok "Node $(node -v) (via nvm)"
    else
      fail "Node.js 20+ required (found v$NODE_VERSION). Install via nvm or brew install node@22"
    fi
  else
    ok "Node $(node -v)"
  fi
else
  fail "Node.js not found. Install via: brew install node@22"
fi

# Python
if command -v python3 &>/dev/null; then
  ok "Python $(python3 --version | cut -d' ' -f2)"
else
  fail "Python 3.11+ not found. Install via: brew install python@3.12"
fi

# Xcode (optional)
if command -v xcodebuild &>/dev/null; then
  ok "Xcode $(xcodebuild -version 2>/dev/null | head -1 | cut -d' ' -f2)"
else
  warn "Xcode not found — iOS simulator builds will not work"
fi

# ── Server setup ─────────────────────────────────────────────────────

step "Setting up server"

cd server

if [ ! -d ".venv" ]; then
  python3 -m venv .venv
  ok "Created virtual environment"
else
  ok "Virtual environment exists"
fi

source .venv/bin/activate
pip install -q -r requirements.txt
ok "Python dependencies installed"

if [ ! -f ".env" ]; then
  cp .env.example .env
  warn ".env created from .env.example — add your ANTHROPIC_API_KEY"
else
  ok ".env already exists"
fi

deactivate
cd ..

# ── Client setup ─────────────────────────────────────────────────────

step "Setting up client"

cd client

npm install --silent 2>/dev/null
ok "npm dependencies installed"

npx playwright install chromium 2>/dev/null
ok "Playwright Chromium installed"

cd ..

# ── Git hooks ────────────────────────────────────────────────────────

step "Configuring git hooks"

git config core.hooksPath .githooks
ok "Pre-commit hook enabled (lint, types, build checks run on every commit)"

# ── Verify builds ────────────────────────────────────────────────────

step "Verifying builds and tests"

cd client
npx jest --passWithNoTests 2>/dev/null
ok "Client tests pass"

npx ng lint 2>/dev/null
ok "ESLint passes clean"

npx ng build --configuration=production 2>/dev/null
ok "Angular production build successful"

cd ..

cd server
source .venv/bin/activate
python -m py_compile main.py
ok "Server compiles without errors"

pytest --tb=short -q 2>/dev/null
ok "Server tests pass"

deactivate
cd ..

# ── Summary ──────────────────────────────────────────────────────────

echo -e "\n${GREEN}${BOLD}Setup complete!${NC}\n"
echo "  Start server:  cd server && source .venv/bin/activate && uvicorn main:app --reload --port 8000"
echo "  Start client:  cd client && ng serve"
echo "  Open browser:  http://localhost:4200"
echo "  API docs:      http://localhost:8000/docs"
echo ""
echo "  Generate types: cd client && npm run generate:types  (requires server running)"
echo "  Client tests:  cd client && npx jest --watch"
echo "  Server tests:  cd server && pytest -v"
echo "  Lint:          cd client && ng lint"
echo "  Visual tests:  cd client && npx playwright test --grep @visual"
echo ""
if [ ! -f "server/.env" ] || grep -q "your-key-here" server/.env 2>/dev/null; then
  echo -e "  ${YELLOW}⚠ Don't forget to add your ANTHROPIC_API_KEY to server/.env${NC}"
fi
