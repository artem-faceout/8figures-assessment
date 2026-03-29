# PRD: Onboarding & Paywall

## Overview

First-launch onboarding flow that introduces the 8FIGURES value proposition, captures user investment context, and gates the app behind a premium subscription paywall. Forward-only navigation (no back button) except on the paywall screen where the user can return to change their portfolio choice.

## User Flow

```
App Launch (first time)
  → Native Splash (Capacitor)
  → Onboarding: Hook (screen 1/3)
  → Onboarding: Promise (screen 2/3)
  → Onboarding: Bridge (screen 3/3) — user selects investment profile
  → Paywall (hard gate — must start trial or subscribe)
  → AI Chat (out of scope for this feature)
```

On subsequent launches, the app skips onboarding entirely (persisted flag).

## Screens

### 1. Native Splash

**Not an Angular screen.** Handled by Capacitor's native splash screen plugin.

- **Visual:** Dark background (#030304), centered gold diamond logo with amber aura glow, "By 8FIGURES Intelligence" tagline at bottom
- **Behavior:** Displays during app bootstrap, auto-dismisses when Angular is ready
- **Assets needed:** App icon (gold diamond on dark), splash background image
- **Implementation:** `@capacitor/splash-screen` config in `capacitor.config.ts`

### 2. Onboarding: Hook

**Purpose:** Emotional hook — make the user feel their portfolio might be underperforming.

| Element | Detail |
|---|---|
| Headline | "Your **money** is working. But is it working for **you**?" — "money" and "you" use gold gradient text |
| Subtitle | "8Figures uses autonomous intelligence to audit your portfolio in real-time. Experience crystalline financial clarity." — 50% white opacity |
| CTA | "Continue" — full-width pill button, gold gradient bg, black text |
| Page indicator | 3 dots, first is active (gold pill 32px wide), others are inactive (6px circles, 10% white) |
| Background | Near-black (#050505) with animated gold ambient glows (3 blur circles at different positions) |
| Animations | Glows pulse subtly. Headline fades in on screen entry |

### 3. Onboarding: Promise

**Purpose:** Demonstrate the AI companion's value with a mock conversation.

| Element | Detail |
|---|---|
| Headline | "Meet your AI portfolio **companion.**" — "companion." in gold (#F7931A) |
| Mock chat | User bubble: "How's my portfolio doing today?" (gold-tinted, top-left rounded) |
| AI response | "8FIGURES AI" header with gold avatar, "Your portfolio is up **2.4%** since market open." (2.4% in green #4ADE80), mini portfolio card showing AAPL (+1.2%, Outperforming) and NVDA (+4.8%, AI Surge) with logos, quote about NVIDIA driving growth |
| Smart Insight chip | Gold pill with sparkle icon and "SMART INSIGHT" label |
| CTA | "Continue →" — gold solid button with arrow icon |
| Page indicator | 3 dots, second active |
| Background | Dark (#0A0A0A) with subtle grid pattern overlay (gold lines at 5% opacity) |
| Animations | Chat bubbles stagger in (user first, then AI). Portfolio card items slide up. Chip fades in last |

### 4. Onboarding: Bridge

**Purpose:** Capture user's investment experience level. This choice affects downstream user activation.

| Element | Detail |
|---|---|
| Headline | "Let's set up your portfolio." |
| Subtitle | "Tell us where you are." — JetBrains Mono, muted gray (#A0A0A0) |
| Card A | Icon (chart trending up) + "I have investments" / "I'll tell the AI what I'm holding" — dark card (#0F1115), border #2D2F36, 40px radius, decorative corner element |
| Card B | Icon (plant/seedling) + "I'm just getting started" / "Help me build my first portfolio" — same styling |
| AI Insight chip | Sparkle icon + "Your answers help our engine curate tax-efficient strategies tailored to your wealth stage." — JetBrains Mono 10px, pill with backdrop blur |
| CTA | "Continue Journey" — gold solid button, disabled until a card is selected |
| Page indicator | 3 dots, third active |
| Background | Dark (#08090C) with two amber blur decorations |
| Selection behavior | Tapping a card selects it (visual highlight — gold border or glow). Only one can be selected at a time. CTA enables on selection |
| Animations | Cards slide up with stagger. Selection adds gold border with subtle glow transition |

**Data captured:** `investmentProfile: 'experienced' | 'beginner'` — stored alongside the onboarding completion flag.

### 5. Paywall

**Purpose:** Hard gate. User must subscribe or start trial to proceed. Has back navigation to Bridge screen.

| Element | Detail |
|---|---|
| Header | "Unlock Your Financial Edge" — gradient text (gold → orange → warm gold) |
| Subtitle | "Ascend to the elite tier of asset management. Precision-engineered intelligence for the digital alchemist." — light warm text (#DBC2AE) |
| Pricing card | Frosted glass card (backdrop-blur, 60% dark bg, gold top border), "PREMIUM YEARLY" label (#FFB874), "$199.99 /year" — large Space Grotesk heading + JetBrains Mono suffix |
| Features | 4 items with icons: Real-time AI Portfolio Audits, Unlimited Magic Wand Interactions, Priority Market Insights, Early Access to New Models |
| CTA | "Start 7-Day Free Trial" — orange→gold gradient pill, strong glow shadow |
| Restore Purchase | Text link below CTA, warm muted color, uppercase tracking |
| Legal | "SECURED BY QUANTUM-RESISTANT PROTOCOLS / CANCEL ANYTIME DURING TRIAL" — 10px, 40% opacity |
| Background | Near-black with two large ambient orange/gold blurs, radial gradient overlay at 40% opacity |
| Back navigation | Back button or swipe-back to return to Bridge screen |
| Animations | Pricing card scales up on entry. Feature items stagger in. CTA pulses glow once |

**Purchase behavior (assessment scope):** Mock implementation. Tapping "Start 7-Day Free Trial" simulates success after a brief delay (spinner → success state → navigate to AI Chat). No actual StoreKit/Google Play integration.

## State & Persistence

### OnboardingService

```
Signal: currentStep      — 0..3 (Hook, Promise, Bridge, Paywall)
Signal: investmentProfile — 'experienced' | 'beginner' | null
Signal: isComplete        — boolean

Storage key: '8f_onboarding_complete' — boolean
Storage key: '8f_investment_profile'  — 'experienced' | 'beginner'
Storage key: '8f_subscription_status' — 'trial' | 'active' | 'none'
```

- On app launch: check `8f_onboarding_complete`. If true, skip to main app.
- On Bridge selection: persist `investmentProfile` immediately (survives back-nav from paywall).
- On paywall "purchase": set `8f_onboarding_complete = true`, `8f_subscription_status = 'trial'`, navigate forward.
- Storage: Capacitor Preferences API (`@capacitor/preferences`) for cross-platform key-value persistence.

### No Backend Endpoint Needed

Onboarding is entirely client-side. The investment profile and subscription status are stored locally. No new API endpoints required.

## Routing

```
/onboarding          → OnboardingPage (manages step state internally)
  step 0: Hook
  step 1: Promise
  step 2: Bridge
  step 3: Paywall

/chat                → AI Chat (existing, out of scope)
```

**Guard:** `OnboardingGuard` on the main app routes — redirects to `/onboarding` if `8f_onboarding_complete` is not true. Conversely, `/onboarding` redirects to `/chat` if already completed.

**Single route, internal steps** rather than `/onboarding/hook`, `/onboarding/promise` etc. — simpler state management, prevents URL-based step skipping, and allows smooth inter-step animations without route transitions.

## Component Architecture

```
OnboardingPage (smart container)
├── OnboardingHookComponent (step 0)
├── OnboardingPromiseComponent (step 1)
├── OnboardingBridgeComponent (step 2)
├── PaywallComponent (step 3)
└── Shared:
    ├── PageIndicatorComponent (dots)
    ├── OnboardingButtonComponent (gold CTA)
    └── AmbientGlowComponent (reusable blur decorations)
```

All are standalone Angular components. `OnboardingPage` owns step navigation and animation triggers.

## Animations

Keep it smooth and simple. CSS transitions + Angular animations:

| Transition | Effect |
|---|---|
| Step forward | Current step fades out + slides left, next step fades in + slides from right (300ms ease-out) |
| Step backward (paywall→bridge) | Reverse of above |
| Screen entry elements | Staggered fade-in + translateY (headline first, then body, then CTA) — 150ms stagger |
| Card selection (Bridge) | Border color transition to gold + subtle box-shadow glow (200ms ease) |
| Ambient glows | CSS `@keyframes` — slow opacity pulse (4s cycle), subtle position drift |
| Paywall CTA | Single glow pulse on entry (scale 1→1.02→1, 600ms) |

## Figma Asset Download List

These assets must be downloaded from Figma and saved locally (URLs expire in 7 days):

| Asset | Figma Node | Purpose |
|---|---|---|
| App logo (gold diamond) | 2:12 | Splash screen, possible reuse |
| Grain texture | 2:5 | Splash background overlay |
| AAPL logo | 2:106 | Promise screen mock chat |
| NVDA logo | 2:120 | Promise screen mock chat |
| AI avatar icon | 2:95 | Promise screen chat header |
| Chart trending icon | 2:167 | Bridge card A |
| Seedling icon | 2:179 | Bridge card B |
| Decorative corner A | 2:164 | Bridge card A |
| Decorative corner B | 2:176 | Bridge card B |
| Sparkle icon | 2:136 / 2:189 | Smart Insight chip, AI insight chip |
| Feature icons (4) | 6:32, 6:36, 6:41, 6:45 | Paywall feature list |
| Arrow right icon | 2:83 | Promise CTA button |

## Acceptance Criteria

1. First launch shows onboarding; second launch skips directly to main app
2. User can progress through Hook → Promise → Bridge → Paywall
3. Bridge screen requires card selection before CTA enables
4. Investment profile choice persists across back-navigation from paywall
5. Paywall is a hard gate — no skip/close option
6. Paywall has back navigation to Bridge screen
7. Mock "Start 7-Day Free Trial" completes onboarding and navigates forward
8. "Restore Purchase" shows a mock toast (e.g., "No previous purchase found")
9. Page indicators accurately reflect current step (1-3, paywall has no indicator)
10. All screens match Figma designs at 390px viewport width
11. Animations are smooth at 60fps, no jank on scroll or transition
12. All text, colors, and spacing use design system tokens — no hardcoded values
13. Touch targets are minimum 44x44pt
14. Works in both browser dev and Capacitor iOS simulator

## Implementation Manifest

### Files to Create

```
client/src/app/
├── core/
│   ├── models/onboarding.model.ts          # Types, enums, storage key constants
│   ├── services/onboarding.service.ts       # State management + Capacitor Preferences persistence
│   └── guards/onboarding.guard.ts           # Route guard: redirect to/from onboarding
├── features/
│   └── onboarding/
│       ├── onboarding.page.ts               # Smart container — step orchestrator, animation host
│       ├── onboarding.page.html
│       ├── onboarding.page.scss
│       ├── onboarding.page.spec.ts
│       ├── components/
│       │   ├── hook/
│       │   │   ├── onboarding-hook.component.ts
│       │   │   ├── onboarding-hook.component.html
│       │   │   └── onboarding-hook.component.scss
│       │   ├── promise/
│       │   │   ├── onboarding-promise.component.ts
│       │   │   ├── onboarding-promise.component.html
│       │   │   └── onboarding-promise.component.scss
│       │   ├── bridge/
│       │   │   ├── onboarding-bridge.component.ts
│       │   │   ├── onboarding-bridge.component.html
│       │   │   └── onboarding-bridge.component.scss
│       │   └── paywall/
│       │       ├── paywall.component.ts
│       │       ├── paywall.component.html
│       │       └── paywall.component.scss
│       └── animations/
│           └── onboarding.animations.ts     # Angular animation triggers (step transitions, stagger entry)
├── shared/
│   └── components/
│       ├── page-indicator/                  # Reusable dot stepper (inputs: totalSteps, currentStep)
│       │   ├── page-indicator.component.ts
│       │   ├── page-indicator.component.html
│       │   └── page-indicator.component.scss
│       └── ambient-glow/                    # Reusable positioned blur circle decoration
│           ├── ambient-glow.component.ts
│           └── ambient-glow.component.scss
└── assets/
    └── onboarding/                          # Downloaded Figma assets (URLs expire 7 days)
        ├── logo-gold.svg
        ├── aapl-logo.png
        ├── nvda-logo.png
        ├── ai-avatar.svg
        ├── icon-chart.svg
        ├── icon-seedling.svg
        ├── icon-sparkle.svg
        ├── icon-arrow-right.svg
        ├── corner-decoration-a.svg
        ├── corner-decoration-b.svg
        └── feature-icons/
            ├── audit.svg
            ├── magic-wand.svg
            ├── insights.svg
            └── early-access.svg
```

### Files to Modify

| File | Change |
|---|---|
| `client/src/app/app.routes.ts` | Add `/onboarding` route with `OnboardingPage`, default redirect, apply `OnboardingGuard` |
| `client/src/index.html` | ✅ Done — Google Fonts added |
| `client/src/theme/variables.scss` | ✅ Done — full design system token set synced |
| `client/capacitor.config.ts` | ✅ Done — SplashScreen plugin configured |
| `client/package.json` | ✅ Done — `@capacitor/preferences` and `@capacitor/splash-screen` installed |

### Prerequisites Status

All prerequisites completed in the prep session:
- [x] `@capacitor/preferences` installed
- [x] `@capacitor/splash-screen` installed
- [x] Google Fonts loaded in `index.html`
- [x] `variables.scss` synced with full design system tokens
- [x] `capacitor.config.ts` splash screen config added
- [x] Build passes clean
- [x] Lint passes clean

## Out of Scope

- Actual in-app purchase integration (StoreKit / Google Play Billing)
- Backend user accounts or authentication
- AI Chat screen (destination after onboarding — separate feature)
- Analytics / event tracking
- Deep linking into onboarding steps
- Multiple pricing tiers or monthly/yearly toggle
