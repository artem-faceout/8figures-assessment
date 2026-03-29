import { render, screen } from '@testing-library/angular';
import { InsightCardComponent } from './insight-card.component';
import type { ApiPortfolioInsight } from '@app/core/models/portfolio.model';

const mockInsight: ApiPortfolioInsight = {
  ticker: 'NVDA',
  asset_name: 'NVIDIA Corporation',
  headline: 'NVDA MOMENTUM ALERT',
  body: 'NVIDIA is up 4.2% following the latest earnings report.',
};

describe('InsightCardComponent', () => {
  it('should render insight content', async () => {
    await render(InsightCardComponent, {
      inputs: { insight: mockInsight, loading: false, error: false },
    });
    expect(screen.getByText('NVDA MOMENTUM ALERT')).toBeTruthy();
    expect(
      screen.getByText('NVIDIA is up 4.2% following the latest earnings report.')
    ).toBeTruthy();
  });

  it('should show skeleton when loading', async () => {
    const { container } = await render(InsightCardComponent, {
      inputs: { insight: null, loading: true, error: false },
    });
    expect(container.querySelector('ion-skeleton-text')).toBeTruthy();
  });

  it('should show error state', async () => {
    await render(InsightCardComponent, {
      inputs: { insight: null, loading: false, error: true },
    });
    expect(screen.getByText('Insight unavailable')).toBeTruthy();
  });
});
