import { render, screen } from '@testing-library/angular';
import { PortfolioSummaryComponent } from './portfolio-summary.component';
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
      quantity: 0.04,
      cost_basis: 62000,
      current_price: 68475,
      value: 2739,
      daily_change_percent: 2.15,
    },
  ],
  total_value: 47230,
  daily_change: 312.5,
  daily_change_percent: 0.67,
};

describe('PortfolioSummaryComponent', () => {
  it('should render total value', async () => {
    await render(PortfolioSummaryComponent, {
      inputs: { portfolio: mockPortfolio },
    });
    expect(screen.getByText('$47,230')).toBeTruthy();
  });

  it('should render daily change', async () => {
    await render(PortfolioSummaryComponent, {
      inputs: { portfolio: mockPortfolio },
    });
    expect(screen.getByText('+$312.50 today')).toBeTruthy();
    expect(screen.getByText('+0.67%')).toBeTruthy();
  });

  it('should render bar chart bars for each holding plus placeholders', async () => {
    const { container } = await render(PortfolioSummaryComponent, {
      inputs: { portfolio: mockPortfolio },
    });
    const columns = container.querySelectorAll('.bar-column');
    // 2 real + 5 placeholder (padded to minimum of 7)
    expect(columns.length).toBe(7);
    const placeholders = container.querySelectorAll('.bar-column.bar-placeholder');
    expect(placeholders.length).toBe(5);
    // Real bars should have ticker labels
    const labels = container.querySelectorAll('.bar-label');
    expect(labels.length).toBe(2);
  });

  it('should show gain styling for positive change', async () => {
    const { container } = await render(PortfolioSummaryComponent, {
      inputs: { portfolio: mockPortfolio },
    });
    const badge = container.querySelector('.change-badge');
    expect(badge?.classList.contains('gain')).toBe(true);
  });
});
