# Skill: Angular Testing Patterns

## When to use
When writing tests for Angular components, services, or pipes. Uses Jest + Testing Library.

## Setup
- Test runner: Jest with `jest-preset-angular`
- Component testing: `@testing-library/angular` (behavior-focused)
- Assertions: `@testing-library/jest-dom` (DOM matchers)
- Test files: alongside source — `feature.component.spec.ts` next to `feature.component.ts`

## Component Tests

### Senior pattern: test behavior, not implementation

```typescript
import { render, screen } from '@testing-library/angular';
import { DashboardComponent } from './dashboard.component';
import { PortfolioService } from '@app/core/services/portfolio.service';
import { of } from 'rxjs';

const mockHoldings = [
  { ticker: 'AAPL', name: 'Apple Inc.', marketValue: 10250, gainLoss: 450, gainLossPercent: 4.59 },
  { ticker: 'GOOGL', name: 'Alphabet', marketValue: 5200, gainLoss: -120, gainLossPercent: -2.26 },
];

describe('DashboardComponent', () => {
  const mockPortfolioService = {
    getHoldings: jest.fn().mockReturnValue(of(mockHoldings)),
  };

  async function setup() {
    return render(DashboardComponent, {
      providers: [
        { provide: PortfolioService, useValue: mockPortfolioService },
      ],
    });
  }

  it('should display all holdings', async () => {
    await setup();
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('GOOGL')).toBeInTheDocument();
  });

  it('should show gain in green', async () => {
    await setup();
    const gain = screen.getByText('+4.59%');
    expect(gain).toHaveClass('gain');
  });

  it('should show loss in red', async () => {
    await setup();
    const loss = screen.getByText('-2.26%');
    expect(loss).toHaveClass('loss');
  });

  it('should display loading skeleton initially', async () => {
    mockPortfolioService.getHoldings.mockReturnValue(new Observable()); // never resolves
    await setup();
    expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
  });
});
```

### Key rules
- Use `screen.getByText`, `screen.getByRole`, `screen.getByTestId` — NOT `fixture.debugElement.query`
- Mock services via providers, not by modifying component internals
- Test what the user sees: text content, visibility, interactions
- Use `userEvent` for interactions (clicks, typing):
  ```typescript
  import userEvent from '@testing-library/user-event';
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: /send/i }));
  ```

## Service Tests

```typescript
import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { PortfolioService } from './portfolio.service';

describe('PortfolioService', () => {
  let service: PortfolioService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        PortfolioService,
      ],
    });
    service = TestBed.inject(PortfolioService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should fetch holdings from API', () => {
    const mockData = { holdings: [], totalValue: 0 };

    service.getHoldings().subscribe((data) => {
      expect(data).toEqual(mockData);
    });

    const req = httpMock.expectOne('/api/v1/portfolio');
    expect(req.request.method).toBe('GET');
    req.flush(mockData);
  });

  it('should handle API errors', () => {
    service.getHoldings().subscribe({
      error: (err) => {
        expect(err.status).toBe(500);
      },
    });

    const req = httpMock.expectOne('/api/v1/portfolio');
    req.flush('Server error', { status: 500, statusText: 'Internal Server Error' });
  });
});
```

## Pipe Tests

Pipes are pure functions — simplest to test:

```typescript
import { CurrencyFormatPipe } from './currency-format.pipe';

describe('CurrencyFormatPipe', () => {
  const pipe = new CurrencyFormatPipe();

  it('should format positive values', () => {
    expect(pipe.transform(1234.5)).toBe('$1,234.50');
  });

  it('should format zero', () => {
    expect(pipe.transform(0)).toBe('$0.00');
  });

  it('should format large numbers with commas', () => {
    expect(pipe.transform(1234567.89)).toBe('$1,234,567.89');
  });
});
```

## Test Organization

```
src/app/
├── core/services/
│   ├── portfolio.service.ts
│   └── portfolio.service.spec.ts      ← alongside source
├── features/dashboard/
│   ├── dashboard.component.ts
│   └── dashboard.component.spec.ts    ← alongside source
└── shared/pipes/
    ├── currency-format.pipe.ts
    └── currency-format.pipe.spec.ts   ← alongside source
```

## Checklist
- [ ] Every component has a spec file
- [ ] Tests use Testing Library (`render`, `screen`) not raw TestBed queries
- [ ] Services tested with `HttpTestingController`
- [ ] Pipes tested as plain functions
- [ ] No testing of implementation details (signal internals, private methods)
- [ ] Loading, error, and empty states all tested
- [ ] `jest --coverage` shows >80% on business logic
