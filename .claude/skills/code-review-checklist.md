# Skill: Code Review Checklist

## When to use

After implementing any feature, before committing. Run through this checklist.

## TypeScript / Angular

- [ ] No `any` types anywhere — search for `any` in all .ts files
- [ ] All components are standalone (no NgModules)
- [ ] `inject()` used instead of constructor injection
- [ ] Signals used for component state (not plain properties)
- [ ] Services are properly injected and typed
- [ ] No business logic in component templates
- [ ] Lazy loading configured for feature routes

## Ionic / Mobile

- [ ] All UI uses Ionic components (ion-card, ion-list, ion-item, etc.)
- [ ] Touch targets are 44x44pt minimum
- [ ] Safe areas handled (no content hidden behind notch/home indicator)
- [ ] Tested in browser at mobile viewport (375px width)
- [ ] Financial numbers properly formatted (2 decimal places, $ prefix, commas)
- [ ] Gain/loss colors correct (green positive, red negative)

## Backend

- [ ] All endpoints use Pydantic models
- [ ] Async handlers
- [ ] CORS configured for dev origins
- [ ] No API keys in source code

## General

- [ ] No console.log left in code (use proper logging if needed)
- [ ] No commented-out code
- [ ] Imports are clean (no unused imports)
- [ ] File naming follows convention
- [ ] Git commit message is descriptive with proper prefix
