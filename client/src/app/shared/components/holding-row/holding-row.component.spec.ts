import { render, screen } from '@testing-library/angular';
import userEvent from '@testing-library/user-event';
import { HoldingRowComponent } from './holding-row.component';
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

describe('HoldingRowComponent', () => {
  it('should render ticker and company name', async () => {
    await render(HoldingRowComponent, {
      inputs: { holding: mockHolding },
    });
    expect(screen.getByText('AAPL')).toBeTruthy();
    expect(screen.getByText('Apple Inc.')).toBeTruthy();
  });

  it('should render formatted value', async () => {
    await render(HoldingRowComponent, {
      inputs: { holding: mockHolding },
    });
    expect(screen.getByText('$9,922.50')).toBeTruthy();
  });

  it('should render positive change with gain class', async () => {
    await render(HoldingRowComponent, {
      inputs: { holding: mockHolding },
    });
    const change = screen.getByText('+1.24%');
    expect(change).toBeTruthy();
    expect(change.classList.contains('gain')).toBe(true);
  });

  it('should render negative change with loss class', async () => {
    const lossHolding = { ...mockHolding, daily_change_percent: -2.15 };
    await render(HoldingRowComponent, {
      inputs: { holding: lossHolding },
    });
    const change = screen.getByText('-2.15%');
    expect(change).toBeTruthy();
    expect(change.classList.contains('loss')).toBe(true);
  });

  it('should emit ticker on tap', async () => {
    const tappedSpy = jest.fn();
    await render(HoldingRowComponent, {
      inputs: { holding: mockHolding },
      on: { tapped: tappedSpy },
    });
    const item = screen.getByText('AAPL').closest('ion-item')!;
    await userEvent.click(item);
    expect(tappedSpy).toHaveBeenCalledWith('AAPL');
  });
});
