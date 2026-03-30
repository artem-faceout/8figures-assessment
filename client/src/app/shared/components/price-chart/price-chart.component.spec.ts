import { render, screen } from '@testing-library/angular';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { PriceChartComponent } from './price-chart.component';
import type { ApiPricePoint } from '@app/core/models/portfolio.model';

const mockPoints: ApiPricePoint[] = [
  { timestamp: '2026-03-01T16:00:00Z', price: 190 },
  { timestamp: '2026-03-02T16:00:00Z', price: 192 },
  { timestamp: '2026-03-03T16:00:00Z', price: 195 },
  { timestamp: '2026-03-04T16:00:00Z', price: 198 },
];

describe('PriceChartComponent', () => {
  it('should render SVG path with data', async () => {
    const { container } = await render(PriceChartComponent, {
      inputs: { points: mockPoints, loading: false, error: false },
      providers: [provideNoopAnimations()],
    });
    const path = container.querySelector('path[stroke]');
    expect(path).toBeTruthy();
    expect(path?.getAttribute('d')).toBeTruthy();
  });

  it('should show skeleton when loading', async () => {
    const { container } = await render(PriceChartComponent, {
      inputs: { points: [], loading: true, error: false },
      providers: [provideNoopAnimations()],
    });
    expect(container.querySelector('ion-skeleton-text')).toBeTruthy();
  });

  it('should show error state', async () => {
    await render(PriceChartComponent, {
      inputs: { points: [], loading: false, error: true },
      providers: [provideNoopAnimations()],
    });
    expect(screen.getByText('Unable to load chart')).toBeTruthy();
  });

  it('should not render with fewer than 2 points', async () => {
    const { container } = await render(PriceChartComponent, {
      inputs: {
        points: [{ timestamp: '2026-03-01T16:00:00Z', price: 190 }],
        loading: false,
        error: false,
      },
      providers: [provideNoopAnimations()],
    });
    expect(container.querySelector('svg')).toBeFalsy();
  });
});
