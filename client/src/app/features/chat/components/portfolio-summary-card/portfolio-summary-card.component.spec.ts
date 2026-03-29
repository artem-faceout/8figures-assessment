import { render, screen } from '@testing-library/angular';
import { PortfolioSummaryCardComponent } from './portfolio-summary-card.component';
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
    {
      ticker: 'BTC',
      name: 'Bitcoin',
      exchange: 'CRYPTO',
      quantity: 0.5,
      cost_basis: 42000,
      current_price: 67000,
      value: 33500,
      daily_change_percent: -2.1,
    },
  ],
  total_value: 43422.5,
  daily_change: 312.5,
  daily_change_percent: 0.73,
};

describe('PortfolioSummaryCardComponent', () => {
  it('should display total portfolio value', async () => {
    await render(PortfolioSummaryCardComponent, {
      inputs: { portfolio: mockPortfolio },
    });
    expect(screen.getByText(/\$43,423/)).toBeTruthy();
  });

  it('should list holdings with tickers', async () => {
    await render(PortfolioSummaryCardComponent, {
      inputs: { portfolio: mockPortfolio },
    });
    expect(screen.getByText('AAPL')).toBeTruthy();
    expect(screen.getByText('BTC')).toBeTruthy();
  });

  it('should show CTA button', async () => {
    await render(PortfolioSummaryCardComponent, {
      inputs: { portfolio: mockPortfolio },
    });
    expect(screen.getByText(/See your dashboard/)).toBeTruthy();
  });

  it('should emit ctaClick on button tap', async () => {
    const { fixture } = await render(PortfolioSummaryCardComponent, {
      inputs: { portfolio: mockPortfolio },
    });
    const spy = jest.fn();
    fixture.componentInstance.ctaClick.subscribe(spy);

    const button = screen.getByText(/See your dashboard/);
    button.click();
    expect(spy).toHaveBeenCalled();
  });
});
