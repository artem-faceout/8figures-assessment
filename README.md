# 8FIGURES Assessment — AI Portfolio Companion

Mobile-first AI portfolio companion that lets users view their investment portfolio, chat with an AI assistant about their holdings, and get contextual financial insights. Built as a technical assessment for the Principal Engineer & Agent Orchestrator role at 8FIGURES.

The project demonstrates: frontend architecture (Angular + Ionic + Capacitor), AI integration (Claude API with streaming SSE), and an AI-native development pipeline (6 specialized agents, 18 skills, 7 command workflows).

## Features

- **Portfolio dashboard** — holdings list with real-time gain/loss, financial formatting (currency, percentages, color-coded returns)
- **AI chat** — conversational interface powered by Claude, with streaming responses via server-proxied SSE
- **Asset detail** — per-holding view with price history and AI-powered metrics
- **Onboarding flow** — multi-step onboarding with hook, bridge, promise, and paywall screens
- **Dashboard guided tour** — 4-step tooltip overlay for first-time users
- **iOS deployment** — full Capacitor build running in iOS simulator

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 21 (standalone components, Signals) |
| Mobile shell | Capacitor 8 |
| UI components | Ionic 8 |
| Backend | FastAPI (Python 3.11+, async, Pydantic v2) |
| AI | Anthropic Claude API (streaming via SSE) |
| Client testing | Jest + Testing Library, Playwright (visual snapshots) |
| Server testing | pytest + httpx (async, >80% coverage) |
| Type safety | TypeScript strict mode, auto-generated API types from OpenAPI |
| Linting | ESLint + angular-eslint (`no-explicit-any` enforced) |

## Prerequisites

- **Node.js 22+** — `.nvmrc` included, run `nvm use` to switch
- **Python 3.11+** — for the FastAPI server
- **Xcode 16+** — only needed for iOS simulator builds
- **Anthropic API key** — required for AI chat and insights (get one at [console.anthropic.com](https://console.anthropic.com))

## Quick Start

### One-command setup
```bash
chmod +x install.sh
./install.sh
```
This installs all dependencies, sets up the virtual environment, configures git hooks, and verifies both builds pass.

### Manual Setup

#### 1. Server
```bash
cd server
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Edit .env and add your ANTHROPIC_API_KEY
uvicorn main:app --reload --port 8000
```

#### 2. Client (Browser)
```bash
cd client
npm install
ng serve
# Open http://localhost:4200
```

#### 3. Client (iOS Simulator)
```bash
cd client
ng build                  # Production build
npx cap sync              # Sync web assets to native project
npx cap open ios          # Open Xcode project
# In Xcode: select a simulator and click Run
```

## Environment Variables

| Variable | Required | Where | Description |
|----------|----------|-------|-------------|
| `ANTHROPIC_API_KEY` | Yes | `server/.env` | Claude API key — AI chat and insights won't work without it. Get one at [console.anthropic.com](https://console.anthropic.com). |

The `server/.env.example` file is provided as a template. Copy it to `server/.env` and replace the placeholder value.

## Testing

```bash
# Client unit tests (Jest + Testing Library)
cd client && npx jest                        # All tests
cd client && npx jest --watch                # Watch mode (TDD)
cd client && npx jest --coverage             # Coverage report

# Server tests (pytest)
cd server && source .venv/bin/activate
pytest -v                                    # All tests
pytest --cov                                 # Coverage report

# Visual snapshot tests (Playwright)
cd client && npx playwright test --grep @visual

# Linting
cd client && ng lint

# Generate API types (requires server running on port 8000)
cd client && npm run generate:types
```

## Architecture

Four-layer architecture with clear separation of concerns:

```
Presentation (Angular + Ionic)  →  what the user sees
State (Signals + Services)      →  data flow and business logic
API (HTTP client → FastAPI)     →  data fetching and AI proxy
Backend (FastAPI + Claude)      →  serves data, proxies AI calls
```

AI chat uses server-proxied SSE streaming — the API key never leaves the server. The client receives progressive token-by-token responses for a real-time feel.

See [docs/architecture.md](docs/architecture.md) for detailed architecture decisions and trade-offs.

## AI Development Pipeline

This project was built using an AI-native development pipeline with **6 specialized agents**, **18 skills**, and **7 command workflows**:

```
User describes feature
        │
        ▼
  @prep-session ──► PRD + API contracts + data models
        │
        ▼
  @feature-builder ──► TDD implementation (RED → GREEN → REFACTOR)
        │
        ▼
  @quality-gate ──┬──► automated checks (tests, lint, types, build)
                  ├──► @code-reviewer (patterns, architecture)
                  └──► @design-reviewer (Figma, tokens, mobile)
        │
        ▼
  @debugger ◄──── (only if something breaks)
```

Each agent has restricted tools, a single responsibility, and a documented playbook. Skills encode project-specific patterns (financial formatting, streaming architecture, Ionic layout). Commands define repeatable workflows (create feature, fix bug, quality gate).

See [CLAUDE.md](CLAUDE.md) for the full pipeline specification and [.claude/](.claude/) for all agents, skills, and commands.

## Project Structure

```
├── client/                    # Angular 21 + Capacitor 8 + Ionic
│   ├── src/app/
│   │   ├── core/              # Services, models, interceptors
│   │   ├── features/          # Dashboard, Chat, Asset Detail, Onboarding
│   │   └── shared/            # Reusable components and pipes
│   ├── e2e/visual/            # Playwright visual snapshot tests
│   └── capacitor.config.ts
├── server/                    # FastAPI backend
│   ├── routers/               # API route handlers
│   ├── services/              # Business logic + AI integration
│   ├── models/                # Pydantic models (source of truth)
│   └── tests/                 # pytest async tests
├── docs/                      # Architecture, PRDs, API contracts
├── .claude/                   # AI pipeline (agents, skills, commands)
└── install.sh                 # One-command project setup
```
