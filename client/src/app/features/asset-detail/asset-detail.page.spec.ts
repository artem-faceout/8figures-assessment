import { render, screen } from '@testing-library/angular';
import { provideHttpClient } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { AssetDetailPage } from './asset-detail.page';
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
  total_value: 9922.5,
  daily_change: 122.5,
  daily_change_percent: 1.25,
};

const mockRoute = {
  snapshot: {
    paramMap: {
      get: (key: string) => (key === 'ticker' ? 'AAPL' : null),
    },
  },
};

describe('AssetDetailPage', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('8f_portfolio', JSON.stringify(mockPortfolio));
  });

  it('should render asset name and price', async () => {
    const { fixture } = await render(AssetDetailPage, {
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'tabs/dashboard', component: AssetDetailPage },
          { path: 'tabs/chat', component: AssetDetailPage },
        ]),
        { provide: ActivatedRoute, useValue: mockRoute },
      ],
    });

    fixture.detectChanges();

    const httpTesting = TestBed.inject(HttpTestingController);

    // Flush metrics request
    const metricsReq = httpTesting.expectOne(r =>
      r.url.includes('/portfolio/AAPL/metrics')
    );
    metricsReq.flush({
      data: {
        ticker: 'AAPL',
        pe_ratio: 32.1,
        market_cap: '$3.04T',
        day_range_low: 195.2,
        day_range_high: 199.1,
        volume: '45.2M',
      },
      meta: {},
    });

    // Flush history request
    const historyReq = httpTesting.expectOne(r =>
      r.url.includes('/portfolio/AAPL/history')
    );
    historyReq.flush({
      data: {
        ticker: 'AAPL',
        range: '1M',
        points: [
          { timestamp: '2026-03-01T16:00:00Z', price: 190 },
          { timestamp: '2026-03-02T16:00:00Z', price: 198 },
        ],
      },
      meta: {},
    });

    fixture.detectChanges();

    expect(screen.getByText('Apple Inc.')).toBeTruthy();
    expect(screen.getByText('$198.45')).toBeTruthy();
    expect(screen.getByText('+1.24%')).toBeTruthy();
  });
});
