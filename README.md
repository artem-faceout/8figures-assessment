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

### Linting & Testing
```bash
cd client
ng lint                              # ESLint (strict, no-any enforced)
npx playwright test --grep @visual   # Visual snapshot tests
```

## Architecture

See [docs/architecture.md](docs/architecture.md) for architecture decisions and trade-offs.

## AI Development Pipeline

See [CLAUDE.md](CLAUDE.md) for the root project config.
See [.claude/](.claude/) for skills, commands, and workflow automation.
See [docs/tasks.md](docs/tasks.md) for the task breakdown.

## Deliverables

- [ ] Portfolio dashboard with holdings
- [ ] AI chat with streaming responses
- [ ] Capacitor iOS deployment
- [x] AI development pipeline (CLAUDE.md + skills + commands + docs)
- [ ] Loom walkthrough video
