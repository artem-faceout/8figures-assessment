import { render, screen } from '@testing-library/angular';
import { PositionCardComponent } from './position-card.component';
import type { ApiHolding } from '@app/core/models/chat.model';

const mockHolding: ApiHolding = {
  ticker: 'AAPL',
  name: 'Apple Inc.',
  exchange: 'NASDAQ',
  quantity: 50,
  cost_basis: 175.2,
  current_price: 198.45,
  value: 9922.5,
  daily_change_percent: 1.24,
};

describe('PositionCardComponent', () => {
  it('should render shares and avg cost', async () => {
    await render(PositionCardComponent, {
      inputs: { holding: mockHolding },
    });
    expect(screen.getByText('50')).toBeTruthy();
    expect(screen.getByText('$175.20')).toBeTruthy();
  });

  it('should render total value', async () => {
    await render(PositionCardComponent, {
      inputs: { holding: mockHolding },
    });
    expect(screen.getByText('$9,922.50')).toBeTruthy();
  });

  it('should compute and render total gain', async () => {
    await render(PositionCardComponent, {
      inputs: { holding: mockHolding },
    });
    // (198.45 - 175.20) * 50 = 1162.50
    expect(screen.getByText('+$1,162.50')).toBeTruthy();
    // (198.45 - 175.20) / 175.20 * 100 = 13.27%
    expect(screen.getByText('(+13.27%)')).toBeTruthy();
  });

  it('should show loss styling for negative gain', async () => {
    const lossHolding = {
      ...mockHolding,
      current_price: 160.0,
      value: 8000,
    };
    const { container } = await render(PositionCardComponent, {
      inputs: { holding: lossHolding },
    });
    const gainValues = container.querySelectorAll('.cell-value.loss');
    expect(gainValues.length).toBeGreaterThan(0);
  });
});
