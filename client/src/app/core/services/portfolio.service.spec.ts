import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { PortfolioService } from './portfolio.service';
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

describe('PortfolioService', () => {
  let service: PortfolioService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PortfolioService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should start with null portfolio', () => {
    expect(service.portfolio()).toBeNull();
  });

  it('should set portfolio and update signal', () => {
    service.setPortfolio(mockPortfolio);
    expect(service.portfolio()).toEqual(mockPortfolio);
  });

  it('should persist portfolio to localStorage', () => {
    service.setPortfolio(mockPortfolio);
    const stored = localStorage.getItem('8f_portfolio');
    expect(stored).toBeTruthy();
    expect(JSON.parse(stored!)).toEqual(mockPortfolio);
  });

  it('should load portfolio from localStorage on init', () => {
    localStorage.setItem('8f_portfolio', JSON.stringify(mockPortfolio));
    service.loadFromStorage();
    expect(service.portfolio()).toEqual(mockPortfolio);
  });

  it('should have hasPortfolio computed signal', () => {
    expect(service.hasPortfolio()).toBe(false);
    service.setPortfolio(mockPortfolio);
    expect(service.hasPortfolio()).toBe(true);
  });

  it('should return holdings from portfolio', () => {
    expect(service.holdings()).toEqual([]);
    service.setPortfolio(mockPortfolio);
    expect(service.holdings().length).toBe(1);
  });

  it('should find holding by ticker', () => {
    service.setPortfolio(mockPortfolio);
    expect(service.getHoldingByTicker('AAPL')?.name).toBe('Apple Inc.');
    expect(service.getHoldingByTicker('aapl')?.name).toBe('Apple Inc.');
    expect(service.getHoldingByTicker('FAKE')).toBeUndefined();
  });

  it('should fetch price history', () => {
    const mockHistory = {
      ticker: 'AAPL',
      range: '1M' as const,
      points: [{ timestamp: '2026-03-01T16:00:00Z', price: 190.0 }],
    };

    service.getHistory('AAPL', '1M').subscribe(data => {
      expect(data.ticker).toBe('AAPL');
      expect(data.points.length).toBe(1);
    });

    const req = httpTesting.expectOne(
      r =>
        r.url.includes('/portfolio/AAPL/history') &&
        r.params.get('range') === '1M'
    );
    req.flush({ data: mockHistory, meta: { timestamp: '2026-03-30T10:00:00Z' } });
  });

  it('should fetch asset metrics', () => {
    const mockMetrics = {
      ticker: 'AAPL',
      pe_ratio: 32.1,
      market_cap: '$3.04T',
      day_range_low: 195.2,
      day_range_high: 199.1,
      volume: '45.2M',
    };

    service.getMetrics('AAPL').subscribe(data => {
      expect(data.ticker).toBe('AAPL');
      expect(data.pe_ratio).toBe(32.1);
    });

    const req = httpTesting.expectOne(r =>
      r.url.includes('/portfolio/AAPL/metrics')
    );
    req.flush({ data: mockMetrics, meta: { timestamp: '2026-03-30T10:00:00Z' } });
  });

  it('should fetch insight and cache it', () => {
    const mockInsight = {
      ticker: 'AAPL',
      asset_name: 'Apple Inc.',
      headline: 'AAPL STRONG MOMENTUM',
      body: 'Apple is showing strength.',
    };

    expect(service.insightLoading()).toBe(false);
    service.fetchInsight();
    expect(service.insightLoading()).toBe(true);

    const req = httpTesting.expectOne(r =>
      r.url.includes('/portfolio/insight')
    );
    req.flush({ data: mockInsight, meta: { timestamp: '2026-03-30T10:00:00Z' } });

    expect(service.insight()).toEqual(mockInsight);
    expect(service.insightLoading()).toBe(false);

    // Second call should not trigger another request (cached)
    service.fetchInsight();
    httpTesting.expectNone(r => r.url.includes('/portfolio/insight'));
  });

  it('should handle insight fetch error', () => {
    service.fetchInsight();

    const req = httpTesting.expectOne(r =>
      r.url.includes('/portfolio/insight')
    );
    req.flush('error', { status: 500, statusText: 'Server Error' });

    expect(service.insightError()).toBe(true);
    expect(service.insightLoading()).toBe(false);
  });
});
