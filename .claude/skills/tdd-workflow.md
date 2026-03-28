# Skill: TDD Workflow for Agent Development

## When to use
During Phase 3 (Implement) of every feature. TDD is not optional — it's how features get built.

## Why TDD fits agent development
- Tests ARE the specification — write what should happen before writing how
- Instant feedback loop — agent knows immediately if code works
- Prevents overengineering — write only enough code to pass the test
- Regressions caught on the spot, not days later
- Forces small incremental changes, which is how agents work best

## The Cycle

For each slice of functionality:

### 1. RED — Write a failing test
- Think about the behavior, not the implementation
- Test name describes the expected behavior: `test_portfolio_returns_total_value`, `should display holdings sorted by value`
- Test should fail for the RIGHT reason (missing function, wrong return value — not import error or syntax error)
- One assertion per test (or closely related assertions)
- Commit the failing test: `test: red — <what behavior is being tested>`

### 2. GREEN — Make it pass
- Write the MINIMUM code to make the test pass
- Don't write code that isn't needed by a test
- Ugly code is fine at this stage — correctness first
- Run the test — it must pass
- Run ALL tests — nothing else broke

### 3. REFACTOR — Clean up
- Apply senior patterns (OnPush, Depends, computed, etc.)
- Extract shared logic
- Improve naming
- Run ALL tests again — still passing
- Commit: `feat: green — <what was implemented>`

### Repeat for the next slice

## Slicing Strategy

Break features into testable slices. Order: data model → service logic → API endpoint → component behavior → UI rendering.

**Example — Portfolio Dashboard:**
```
Slice 1: Portfolio model types exist and validate
Slice 2: PortfolioService returns holdings from API
Slice 3: GET /api/v1/portfolio returns mock data
Slice 4: Dashboard component loads and displays holdings
Slice 5: Holdings sorted by market value descending
Slice 6: Financial formatting shows correct $ and % values
Slice 7: Gain/loss colors applied correctly
Slice 8: Loading state shows skeleton while fetching
Slice 9: Error state shows message on API failure
```

Each slice = one RED-GREEN-REFACTOR cycle.

## What to test at each layer

### Models (TypeScript types + Pydantic)
- Validation rules (required fields, value ranges)
- Computed/derived fields calculate correctly
- Serialization/deserialization

### Services
- Business logic with mocked dependencies
- Error cases (API failure, empty data, invalid input)
- Data transformation correctness

### API Endpoints
- HTTP status codes (200, 400, 404, 500)
- Response shape matches Pydantic model
- Error responses have correct format
- Streaming endpoints send proper SSE format

### Components
- Renders correct content given inputs
- User interactions trigger expected outputs
- Loading/error/empty states display correctly
- Does NOT test: internal signal values, CSS styling, Ionic internals

## What NOT to test
- Framework internals (Angular routing works, Ionic renders ion-card)
- Third-party library behavior
- Implementation details (private methods, internal state shape)
- CSS/visual styling (that's what Playwright visual snapshots are for)

## Running tests

```bash
# Client
cd client && npx jest                    # all tests
cd client && npx jest --watch            # watch mode during TDD
cd client && npx jest --coverage         # with coverage report

# Server
cd server && source .venv/bin/activate
pytest -v                                # all tests verbose
pytest -v --tb=short                     # shorter tracebacks
pytest --cov                             # with coverage report
```
