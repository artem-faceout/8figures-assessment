# Skill: Architectural Principles

## When to use
During development and code review. Reference this skill when making design decisions, reviewing PRs, or evaluating whether code follows sound engineering principles. The senior review skills (`angular-senior-review.md`, `fastapi-senior-review.md`) and quality gates (`post-feature.md`, `review-and-fix.md`) delegate here for principle-level checks.

## SOLID

### S — Single Responsibility
Every module, class, and function should have one reason to change.

- **Component:** renders UI for one concern — `HoldingCardComponent` shows a holding, not also a chart
- **Service:** owns one domain — `PortfolioService` handles portfolio data, `AiChatService` handles chat
- **Router:** maps to one resource — `portfolio.py` doesn't also define chat endpoints
- **Model:** represents one entity — `Holding` doesn't include chat message fields

**Smell:** a file that changes for unrelated reasons, a class with methods that don't share state.

### O — Open/Closed
Open for extension, closed for modification. New behavior should not require editing existing working code.

- **Pipes:** add a new formatting pipe instead of adding flags to an existing one
- **Services:** new data sources implement the same interface — don't litter existing services with `if source === 'new'`
- **SSE events:** add new event types to the stream without modifying the handler for existing ones
- **Routes:** add new routes in new files — don't grow a single routes file indefinitely

**Smell:** a switch/if-else chain that grows every time a new variant is added.

### L — Liskov Substitution
Subtypes must be substitutable for their base types without breaking behavior.

- **Test doubles:** mock services must honor the same contract as real ones — if `getPortfolio()` returns `PortfolioResponse`, the mock can't return a partial shape
- **Pydantic models:** response subclasses must include all base fields — don't override fields with incompatible types
- **Components:** a shared component that replaces another must accept the same inputs and emit the same outputs

**Smell:** code that checks `instanceof` or type-discriminates to handle a "special" subtype differently.

### I — Interface Segregation
No client should be forced to depend on methods it doesn't use.

- **Models:** small, focused interfaces — `HoldingSummary` for list views, `HoldingDetail` for detail views, not one `HoldingGodObject`
- **Services:** split by consumer need — a component that only reads data shouldn't depend on a service that also writes
- **API responses:** return only what the endpoint's consumers need — don't send the entire portfolio when the client asked for one holding

**Smell:** importing a type and only using 2 of its 15 fields; a service where most consumers call only one of its many methods.

### D — Dependency Inversion
High-level modules should not depend on low-level modules. Both should depend on abstractions.

- **Angular:** use `inject()` and DI tokens — components depend on service interfaces, not concrete implementations
- **FastAPI:** use `Depends()` — routers depend on service abstractions, services depend on data layer abstractions
- **Testing:** swap implementations via Angular's DI or FastAPI's `dependency_overrides` — if you can't swap it, you coupled too tightly

**Smell:** direct imports of concrete implementations across layer boundaries; inability to test without the real dependency.

## KISS — Keep It Simple

The simplest solution that meets the requirement is the best one. Complexity must be justified.

- Prefer `computed()` over `effect()` chains for derived state
- Prefer a direct service call over an event bus when there's one consumer
- Prefer inline logic over a utility function when it's used once
- Prefer a flat data structure over nested objects when nesting adds no value
- Prefer Angular's built-in features over third-party libraries when they suffice

**Smell:** "clever" code that requires a comment to explain; abstractions with only one implementation; generic solutions for specific problems.

## DRY — Don't Repeat Yourself (with restraint)

Extract shared logic only when duplication is real and repeated. Premature DRY is worse than duplication.

- **Rule of three:** duplicate once is fine, duplicate twice is a smell, duplicate three times means extract
- **Extract to:** shared components (UI), services (logic), pipes (formatting), utility functions (pure transforms)
- **Don't extract:** similar-looking code that evolves independently — two components that happen to look alike today but serve different features

**Smell:** copy-pasted blocks with only variable names changed. But also: a "reusable" abstraction used exactly once.

## YAGNI — You Aren't Gonna Need It

Don't build for hypothetical future requirements. Build for what the spec says now.

- Don't add configuration options nobody asked for
- Don't build plugin systems for one plugin
- Don't abstract data access layers "in case we switch databases"
- Don't add feature flags for features that aren't conditional
- Don't create base classes "in case we need more subtypes"

**Smell:** commented-out code "for later"; parameters that are always passed the same value; abstractions whose only implementation is the "real" one.

## Separation of Concerns

Each layer has one job. Don't leak responsibilities across boundaries.

| Layer | Responsibility | Does NOT do |
|-------|---------------|-------------|
| **Component** | Render UI, handle user interaction | Business logic, data fetching, formatting math |
| **Service** | Business logic, orchestration | UI decisions, direct HTTP calls (use data layer) |
| **Data layer** | Data access, API calls | Business rules, UI state |
| **Model** | Shape of data, validation | Behavior, side effects |
| **Pipe / formatter** | Display transformation | Data mutation, API calls |
| **Router (BE)** | HTTP concerns (status codes, auth) | Business logic, data access |

**Smell:** a component with 50+ lines of logic that doesn't touch the template; a service that references `ion-toast`; a model with methods that call APIs.

## Loose Coupling / High Cohesion

- **Loose coupling:** modules interact through narrow, well-defined interfaces. Changing one module's internals doesn't cascade to others.
  - Features import from `shared/` and `core/` — never from each other
  - Services communicate through DI, not global state or event buses (unless truly decoupled pub/sub is needed)
  - Backend layers interact through typed interfaces, not dict access

- **High cohesion:** everything in a module relates to its single purpose.
  - A feature folder contains everything for that feature: component, tests, styles
  - A service file contains methods that operate on the same domain
  - A model file contains types for one entity and its variants

**Smell:** a change in one feature breaks another; a folder with files that have nothing in common; circular imports between modules.

## How to apply during review

When reviewing code, check these in order (fast to slow):

1. **KISS** — is there unnecessary complexity? Simplify first.
2. **Single Responsibility** — does each unit do one thing? Split if not.
3. **Separation of Concerns** — is logic in the right layer? Move if not.
4. **DRY (rule of three)** — is there real duplication? Extract if 3+.
5. **YAGNI** — is there speculative code? Remove it.
6. **Open/Closed** — will adding a variant require editing existing code? Refactor if so.
7. **Dependency Inversion** — can you swap dependencies for testing? Fix coupling if not.
8. **Interface Segregation** — are consumers forced to depend on things they don't use? Narrow the interface.
9. **Liskov** — can subtypes substitute their base? Fix contract violations.
10. **Coupling/Cohesion** — are modules independent and focused? Reorganize if not.
