# 8FIGURES Assessment — AI Portfolio Companion

## Overview
Mobile-first AI portfolio companion built with Angular 21, Capacitor 8, Ionic, and FastAPI.

## Quick Start

### One-command setup
```bash
./install.sh
```
This installs all dependencies for both client and server. See below for manual steps.

### Prerequisites
- Node.js 22+ (`.nvmrc` included — run `nvm use` to switch)
- Python 3.11+
- Xcode 16+ (for iOS simulator)
- CocoaPods (`gem install cocoapods`)

### Server
```bash
cd server
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Add your ANTHROPIC_API_KEY
uvicorn main:app --reload --port 8000
```

### Client (Browser)
```bash
cd client
npm install
npx playwright install chromium  # For visual snapshot tests
ng serve
# Open http://localhost:4200
```

### Client (iOS Simulator)
```bash
cd client
ng build
npx cap sync
npx cap open ios
# Select simulator in Xcode, click Run
```

### Testing
```bash
# Client unit tests (Jest + Testing Library)
cd client
npx jest                             # Run all tests
npx jest --watch                     # Watch mode (TDD)
npx jest --coverage                  # Coverage report

# Server tests (pytest)
cd server && source .venv/bin/activate
pytest -v                            # Run all tests
pytest --cov                         # Coverage report

# Visual snapshot tests (Playwright)
cd client
npx playwright test --grep @visual

# Linting
cd client && ng lint                 # ESLint (strict, no-any enforced)
```

## Architecture

See [docs/architecture.md](docs/architecture.md) for architecture decisions and trade-offs.

## AI Development Pipeline

See [CLAUDE.md](CLAUDE.md) for the root project config.
See [.claude/](.claude/) for skills, commands, and workflow automation.

## Deliverables

- [ ] Portfolio dashboard with holdings
- [ ] AI chat with streaming responses
- [ ] Capacitor iOS deployment
- [x] AI development pipeline (CLAUDE.md + skills + commands + docs)
- [ ] Loom walkthrough video
