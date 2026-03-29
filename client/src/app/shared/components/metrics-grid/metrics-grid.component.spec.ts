import { render, screen } from '@testing-library/angular';
import { MetricsGridComponent } from './metrics-grid.component';
import type { ApiAssetMetrics } from '@app/core/models/portfolio.model';

const mockMetrics: ApiAssetMetrics = {
  ticker: 'AAPL',
  pe_ratio: 32.1,
  market_cap: '$3.04T',
  day_range_low: 195.2,
  day_range_high: 199.1,
  volume: '45.2M',
};

describe('MetricsGridComponent', () => {
  it('should render all four metrics', async () => {
    await render(MetricsGridComponent, {
      inputs: { metrics: mockMetrics, loading: false },
    });
    expect(screen.getByText('32.1')).toBeTruthy();
    expect(screen.getByText('$3.04T')).toBeTruthy();
    expect(screen.getByText('$195.20 — $199.10')).toBeTruthy();
    expect(screen.getByText('45.2M')).toBeTruthy();
  });

  it('should show N/A for null pe_ratio', async () => {
    const nopeMetrics = { ...mockMetrics, pe_ratio: null };
    await render(MetricsGridComponent, {
      inputs: { metrics: nopeMetrics, loading: false },
    });
    expect(screen.getByText('N/A')).toBeTruthy();
  });

  it('should show skeleton when loading', async () => {
    const { container } = await render(MetricsGridComponent, {
      inputs: { metrics: null, loading: true },
    });
    const skeletons = container.querySelectorAll('ion-skeleton-text');
    expect(skeletons.length).toBeGreaterThan(0);
  });
});
