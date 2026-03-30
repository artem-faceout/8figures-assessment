import { render, screen } from '@testing-library/angular';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { DashboardPage } from './dashboard.page';
import { PortfolioService } from '@app/core/services/portfolio.service';
import { TourService } from '@app/core/services/tour.service';
import { TOUR_STORAGE_KEY } from '@app/core/models/tour.model';
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

const defaultProviders = [
  provideHttpClient(),
  provideHttpClientTesting(),
  provideRouter([
    { path: 'dashboard/asset/:ticker', component: DashboardPage },
    { path: 'chat', component: DashboardPage },
  ]),
];

describe('DashboardPage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should render portfolio summary and holdings', async () => {
    const { fixture } = await render(DashboardPage, {
      providers: defaultProviders,
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

  describe('guided tour', () => {
    it('should start tour when portfolio is loaded and tour not yet completed', async () => {
      const { fixture } = await render(DashboardPage, {
        providers: defaultProviders,
      });

      const portfolioService =
        fixture.debugElement.injector.get(PortfolioService);
      const tourService = fixture.debugElement.injector.get(TourService);

      portfolioService.setPortfolio(mockPortfolio);
      fixture.detectChanges();

      // Tour should have started
      expect(tourService.tourActive()).toBe(true);
    });

    it('should not start tour when tour was already completed', async () => {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');

      const { fixture } = await render(DashboardPage, {
        providers: defaultProviders,
      });

      const portfolioService =
        fixture.debugElement.injector.get(PortfolioService);
      const tourService = fixture.debugElement.injector.get(TourService);

      portfolioService.setPortfolio(mockPortfolio);
      fixture.detectChanges();

      expect(tourService.tourActive()).toBe(false);
    });

    it('should not start tour when portfolio is not loaded', async () => {
      const { fixture } = await render(DashboardPage, {
        providers: defaultProviders,
      });

      const tourService = fixture.debugElement.injector.get(TourService);
      fixture.detectChanges();

      expect(tourService.tourActive()).toBe(false);
    });

    it('should render tour overlay when tour is active', async () => {
      const { fixture } = await render(DashboardPage, {
        providers: defaultProviders,
      });

      const portfolioService =
        fixture.debugElement.injector.get(PortfolioService);
      portfolioService.setPortfolio(mockPortfolio);
      fixture.detectChanges();

      // The tour overlay component should render a tooltip
      expect(screen.getByRole('tooltip')).toBeTruthy();
    });

    it('should add data-tour attributes to key elements', async () => {
      const { fixture } = await render(DashboardPage, {
        providers: defaultProviders,
      });

      const portfolioService =
        fixture.debugElement.injector.get(PortfolioService);
      portfolioService.setPortfolio(mockPortfolio);
      fixture.detectChanges();

      const nativeEl = fixture.nativeElement as HTMLElement;
      expect(
        nativeEl.querySelector('[data-tour="portfolio-summary"]')
      ).toBeTruthy();
      expect(
        nativeEl.querySelector('[data-tour="insight-card"]')
      ).toBeTruthy();
      expect(
        nativeEl.querySelector('[data-tour="holding-row"]')
      ).toBeTruthy();
      expect(
        nativeEl.querySelector('[data-tour="chat-fab"]')
      ).toBeTruthy();
    });
  });
});
