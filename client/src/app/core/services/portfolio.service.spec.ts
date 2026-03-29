import { TestBed } from '@angular/core/testing';
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

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(PortfolioService);
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
});
