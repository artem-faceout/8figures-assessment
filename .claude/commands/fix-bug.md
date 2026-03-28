# Command: Fix Bug

## When to use
When a bug is reported — by the user during QA, by failing tests, or discovered during development.

## Workflow

### 1. Reproduce
- Understand the bug: what's expected vs what happens
- Write a failing test that captures the bug (TDD red step)
- If it can't be unit tested, document the manual repro steps

### 2. Root Cause
- Find the actual cause — don't guess, trace the code path
- Ask: why did this happen? Not just what's wrong, but what led to it
- Check: was this bug in a recently changed file? Was it a regression?

### 3. Fix
- Make the failing test pass (TDD green step)
- Apply minimal fix — don't refactor unrelated code in a bugfix
- Run ALL tests — ensure nothing else broke

### 4. Classify
Is this a **one-off** or a **pattern**?

**One-off indicators:**
- Typo, wrong variable name, copy-paste error
- Specific to one place in the code
- Unlikely to happen again in a different context

**Pattern indicators:**
- Could happen (or has happened) in multiple places
- Caused by missing knowledge about the framework/stack
- A checklist item would have caught it
- The same category of mistake has appeared before

### 5. Skill Feedback (if pattern)
Find which skill should have prevented this bug:

| Bug category | Update this skill |
|---|---|
| Wrong Angular pattern | `skills/angular-senior-review.md` |
| Wrong FastAPI pattern | `skills/fastapi-senior-review.md` |
| Missing/broken test | `skills/angular-testing.md` or `skills/fastapi-testing.md` |
| UI not matching design | `skills/figma-to-ionic.md` or `skills/design-system.md` |
| Performance issue | `skills/performance-patterns.md` |
| Financial formatting | `skills/financial-data-formatting.md` |
| Architecture violation | `skills/code-review-checklist.md` |
| Streaming issue | `skills/ai-chat-streaming.md` |
| Capacitor/mobile issue | `skills/capacitor-build.md` |
| No skill covers it | Add to `skills/code-review-checklist.md` |

**How to update:** Add a checklist item, a "Common mistakes" entry, or a code example showing the wrong vs right way. Keep it concrete.

**Escalation:** If the same pattern appears a 3rd time across the project, add it to `CLAUDE.md` "Common Mistakes To Avoid" section.

### 6. Commit
```
fix: <area>: <short description of what was fixed>
```

If a skill was updated, commit separately:
```
learning: update <skill> to prevent <bug category>
```

## Example

**Bug:** "Chat messages don't scroll to bottom when streaming"

1. **Reproduce:** Write test that verifies scroll position updates during stream
2. **Root cause:** `scrollToBottom()` called once after stream completes, not during
3. **Fix:** Call scroll on each batched `requestAnimationFrame` update
4. **Classify:** Pattern — any future streaming UI will have this issue
5. **Skill feedback:** Add to `skills/performance-patterns.md` under streaming section: "Always auto-scroll container during streaming, not just on completion"
6. **Commit:** `fix: client: auto-scroll chat during streaming, not just on completion`
