import { render, screen } from '@testing-library/angular';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { DashboardPage } from './dashboard.page';
import { PortfolioService } from '@app/core/services/portfolio.service';
import type { ApiPortfolio } from '@app/core/models/chat.model';

const mockPortfolio: ApiPortfolio = {
  holdings: [
    {
      ticker: 'AAPL',
      name: 'Apple Inc.',
      exchange: 'NASDAQ',
      quantity: 50,
      cost_basis: 175.2,
      current_price: 198.45,
      value: 9922.5,
      daily_change_percent: 1.24,
    },
  ],
  total_value: 47230,
  daily_change: 312.5,
  daily_change_percent: 0.67,
};

describe('DashboardPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should render portfolio summary and holdings', async () => {
    const { fixture } = await render(DashboardPage, {
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'tabs/dashboard/asset/:ticker', component: DashboardPage },
          { path: 'tabs/chat', component: DashboardPage },
        ]),
      ],
    });

    const service = fixture.debugElement.injector.get(PortfolioService);
    service.setPortfolio(mockPortfolio);
    fixture.detectChanges();

    expect(screen.getByText('$47,230')).toBeTruthy();
    expect(screen.getByText('AAPL')).toBeTruthy();
    expect(screen.getByText('HOLDINGS')).toBeTruthy();
  });

  it('should show empty state without portfolio', async () => {
    await render(DashboardPage, {
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });

    expect(screen.getByText('No holdings yet')).toBeTruthy();
  });
});
