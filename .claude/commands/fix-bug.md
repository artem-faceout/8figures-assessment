# Command: Fix Bug

## When to use
When a bug is reported — by the user during QA, by failing tests, or discovered during development. Executed by `@debugger` agent.

## Diagnostic tools
```bash
# Client
cd client && npx jest --verbose --testPathPattern="<test-file>"  # run single test
cd client && npx jest --watch                                     # watch mode
cd client && ng lint                                              # lint check
cd client && npx tsc --noEmit                                     # type check

# Server
cd server && source .venv/bin/activate
pytest -v -k "<test-name>"          # run single test
pytest -v --tb=long                 # full tracebacks
python -m py_compile <file>.py      # syntax check
```

## Workflow

### 1. Reproduce
- Understand the bug: what's expected vs what happens
- Write a failing test that captures the bug (TDD red step)
- If it can't be unit tested, document the manual repro steps

### 2. Root Cause
- Find the actual cause — don't guess, trace the code path
- Ask: why did this happen? Not just what's wrong, but what led to it
- Check: was this bug in a recently changed file? Was it a regression?
- Check `docs/api-contract.md` and `docs/data-models.md` — is the implementation drifting from the contract?

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

### 5. Test Improvement
The bug got past existing tests. Fix that:

- **Why didn't tests catch this?** Missing coverage? Wrong assertion? Happy-path-only tests?
- **Write regression test(s)** covering the exact bug and nearby edge cases (not just the specific input — the category of input)
- **Comment each regression test** with what it guards:
  ```typescript
  // Regression: streaming chunks arriving out of order caused duplicate messages
  // Root cause: missing dedup check in message buffer
  it('should deduplicate chunks with same sequence id', () => { ... });
  ```
- **Review related tests** — if this area was under-tested, add 1-2 more tests for adjacent scenarios that could fail the same way

### 6. Skill Feedback (if pattern)
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

### 7. Quality Gate
Invoke `@quality-gate` to run the full pipeline (`commands/post-feature.md`): tests, lint, types, build, then code review and design review (if UI changed). Do not skip this — a bugfix that introduces a new problem is not a fix.

### 8. Commit
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
5. **Test improvement:** Existing test only checked final scroll position. Add tests for mid-stream scroll, rapid chunk arrival, and user-scrolled-up-should-not-force-scroll
6. **Skill feedback:** Add to `skills/performance-patterns.md` under streaming section: "Always auto-scroll container during streaming, not just on completion"
7. **Quality gate:** Run `@quality-gate` — all green
8. **Commit:** `fix: client: auto-scroll chat during streaming, not just on completion`
