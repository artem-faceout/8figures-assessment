# Skill: Angular Senior Review

## When to use
After implementing any Angular/Ionic code. This catches patterns that separate senior from junior work.

## Change Detection

- [ ] Components use `changeDetection: ChangeDetectionStrategy.OnPush`
  - **Why:** Default change detection runs on every event across the entire tree. OnPush only re-renders when inputs change or signals update. This is table-stakes for performance-aware Angular.
  - **Exception:** Root `App` component can stay default.
- [ ] No manual `ChangeDetectorRef.detectChanges()` or `markForCheck()` calls
  - **Why:** If you need these, your data flow is wrong. Signals and OnPush should handle it.

## Signals (Angular 21 patterns)

- [ ] Component state uses `signal()`, not plain class properties
- [ ] Derived state uses `computed()`, not getter methods or manual recalculation
  - **Bad:** `get totalValue() { return this.holdings().reduce(...) }`
  - **Good:** `totalValue = computed(() => this.holdings().reduce(...))`
- [ ] `effect()` is used sparingly and only for side effects (logging, localStorage sync)
  - **Why:** Overusing effect() is the new "subscribe to everything" anti-pattern
- [ ] `effect()` includes cleanup via `onCleanup` callback when needed
- [ ] No `BehaviorSubject` used where `signal()` would suffice
  - **When RxJS is correct:** HTTP calls, WebSocket/SSE streams, complex async orchestration
  - **When Signal is correct:** UI state, form state, derived values, component-local state

## Template Patterns (Angular 21)

- [ ] Uses `@if` / `@else` — NOT `*ngIf`
- [ ] Uses `@for` with `track` — NOT `*ngFor` with `trackBy`
  - **Bad:** `*ngFor="let item of items; trackBy: trackById"`
  - **Good:** `@for (item of items; track item.id) { ... }`
- [ ] Uses `@switch` — NOT `ngSwitch`
- [ ] Uses `@defer` for below-the-fold or heavy components
  - **Why:** Built-in lazy loading at the template level — shows you know Angular 21
- [ ] Uses `@loading` and `@placeholder` blocks inside `@defer`
- [ ] No complex expressions in templates — extract to `computed()` signals

## RxJS Discipline

- [ ] HTTP calls use `inject(DestroyRef)` + `takeUntilDestroyed()` for cleanup
  - **Bad:** Manual `ngOnDestroy` + `Subscription` tracking
  - **Good:** `this.http.get(...).pipe(takeUntilDestroyed(this.destroyRef))`
- [ ] No nested subscribes — use `switchMap`, `concatMap`, `mergeMap`
- [ ] No `.subscribe()` in components when `| async` or `toSignal()` works
  - **Best:** `toSignal(this.service.data$)` — converts Observable to Signal
- [ ] Errors handled at the stream level (`catchError`), not in subscribe error callback

## Component Architecture

- [ ] Smart/dumb component separation
  - **Smart (container):** in `features/`, injects services, manages state, passes data down
  - **Dumb (presentational):** in `shared/components/`, receives `input()`, emits `output()`, no service injection
- [ ] Uses `input()` function (signal-based) — NOT `@Input()` decorator
  - **Good:** `holdings = input.required<Holding[]>()`
  - **Bad:** `@Input() holdings: Holding[] = []`
- [ ] Uses `output()` function — NOT `@Output()` + `EventEmitter`
  - **Good:** `holdingSelected = output<Holding>()`
  - **Bad:** `@Output() holdingSelected = new EventEmitter<Holding>()`
- [ ] Components are small — if a component file exceeds ~100 lines, consider splitting
- [ ] No service calls in dumb components — they receive data via inputs

## Services

- [ ] Services use `providedIn: 'root'` unless feature-scoped
- [ ] HTTP calls return `Observable` (not Promise) — let consumers decide when to subscribe
- [ ] Services don't hold UI state — that belongs in the component's signals
- [ ] Error handling uses a consistent pattern (e.g., error interceptor + toast notification)
- [ ] Services are single-responsibility — PortfolioService doesn't also handle chat

## Architectural Principles
- [ ] Run through `skills/architectural-principles.md` — SOLID, KISS, DRY, YAGNI, Separation of Concerns, Coupling/Cohesion

## Routing

- [ ] Feature routes are lazy-loaded via `loadComponent`
  - **Good:** `{ path: 'dashboard', loadComponent: () => import('./features/dashboard/...') }`
  - **Bad:** Direct component reference in routes (eager-loaded)
- [ ] Route guards use functional style (`canActivate: [() => inject(AuthGuard).canActivate()]`)
- [ ] Preloading strategy configured if multiple lazy routes exist

## Forms (if applicable)

- [ ] Typed reactive forms (`FormGroup<{ field: FormControl<string> }>`)
- [ ] No `any` in form value types
- [ ] Validation logic in the form definition, not the template

## Ionic-Specific Senior Patterns

- [ ] Uses `ion-nav` or Angular Router for navigation — not manual DOM manipulation
- [ ] Modal/action sheet presented via controller pattern (`ModalController`), not template ref
- [ ] Infinite scroll uses `ion-infinite-scroll` with proper `complete()` call
- [ ] Platform-specific code uses `Platform` service, not user-agent sniffing
- [ ] Uses Ionic lifecycle hooks (`ionViewWillEnter`, `ionViewDidLeave`) for view-specific logic — not just `ngOnInit`

## Performance

- [ ] Images use lazy loading (`loading="lazy"`)
- [ ] Lists with >20 items use `ion-virtual-scroll` or `@defer`
- [ ] No synchronous heavy computation in signal computations
- [ ] Bundle size checked — no accidental import of entire library (e.g., importing all of `lodash` instead of `lodash/get`)

## What senior Angular looks like (reference)

```typescript
@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonHeader, IonContent, IonList, HoldingCardComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  private readonly portfolioService = inject(PortfolioService);
  private readonly destroyRef = inject(DestroyRef);

  holdings = signal<Holding[]>([]);
  totalValue = computed(() =>
    this.holdings().reduce((sum, h) => sum + h.marketValue, 0)
  );
  isLoading = signal(true);

  constructor() {
    this.portfolioService.getHoldings()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.holdings.set(data);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }
}
```
