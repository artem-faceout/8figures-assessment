# Skill: Mobile Layout Patterns

> **Learning process:** When a layout bug is found and fixed, update this file with the pattern that would have prevented it. This skill is the project's collective memory for layout decisions — it grows over time. See `commands/fix-bug.md` for the enforcement rule.

## When to use
When building any full-screen view or component that takes the full viewport height. Check this before writing layout CSS.

## Core Rule: Fixed Shell, Scrollable Content

Every full-screen mobile view must use this structure:

```
┌─────────────────────────┐
│  Fixed Header (optional) │  ← back button, title, status bar
├─────────────────────────┤
│                         │
│   Scrollable Content    │  ← flex: 1, overflow-y: auto
│                         │
├─────────────────────────┤
│  Fixed Footer           │  ← CTA button, page indicators
└─────────────────────────┘
```

**Why:** On iPhone SE (320×568), content that fits on iPhone 13 Mini (375×812) overflows. If the CTA scrolls with content, users on small screens may never see it.

### SCSS pattern

```scss
:host {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.screen {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.fixed-header {
  position: relative;
  padding: 0.75rem 1.5rem;
  z-index: 2;
}

.scrollable-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 1.5rem;
  z-index: 1;
}

.fixed-footer {
  position: relative;
  padding: 1rem 1.5rem;
  padding-bottom: max(1rem, env(safe-area-inset-bottom));
  z-index: 2;
}
```

### What goes where

| Element | Placement | Rationale |
|---|---|---|
| Back button | Fixed header | Always reachable |
| CTA / primary action | Fixed footer | Always visible, no scroll needed |
| Page indicators | Fixed footer or outside step container | Always visible |
| Content, cards, forms | Scrollable content | Adapts to screen size |
| Ambient glows / decorations | Absolute positioned in screen container | Don't interfere with layout |

## Testing Requirement

All screens must be visually tested at **both** viewports:
- iPhone 13 Mini: 375×812, 3× scale
- iPhone SE: 320×568, 2× scale

Configured in `playwright.config.ts` as two projects. Snapshots are auto-suffixed with the project name.

## Anti-patterns

| Don't | Do instead |
|---|---|
| `justify-content: center` on a full-height flex container with CTA inside | Let content flow naturally, put CTA in fixed footer |
| CTA inside the scrollable area | CTA in `.fixed-footer` |
| `height: 100vh` | `height: 100%` on `:host` (100vh breaks on mobile with browser chrome) |
| Large fixed padding/margin that assumes tall viewport | Responsive spacing, scrollable content absorbs overflow |
| `position: fixed` for header/footer | `position: relative` inside a flex column (fixed breaks in Capacitor WebView) |

## Discovered patterns

<!-- Add new patterns here as they're discovered during development -->

### Figma SVGs in `<img>` tags (2026-03-29)
Figma MCP exports SVGs with `width="100%" height="100%"` and `var()` CSS custom properties. Both break in `<img>` tags:
- Fix: Replace with explicit `width`/`height` attributes and hardcode fill colors
- CSS custom properties don't work inside `<img>` — only in inline SVG
