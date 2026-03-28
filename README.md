# 8FIGURES Assessment — AI Portfolio Companion

## Overview
Mobile-first AI portfolio companion built with Angular 20, Capacitor 6, Ionic, and FastAPI.

## Quick Start

### Prerequisites
- Node.js 20+
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

## Architecture

See [docs/architecture.md](docs/architecture.md) for architecture decisions and trade-offs.

## AI Development Pipeline

See [CLAUDE.md](CLAUDE.md) for the root project config.
See [.claude/](.claude/) for skills, commands, and workflow automation.
See [docs/tasks.md](docs/tasks.md) for the task breakdown.

## Deliverables

- [x] Portfolio dashboard with holdings
- [x] AI chat with streaming responses
- [x] Capacitor iOS deployment
- [x] AI development pipeline (CLAUDE.md + skills + commands + docs)
- [x] Loom walkthrough video
