import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardContent } from '@ionic/angular/standalone';
import type { ApiHolding } from '@app/core/models/chat.model';

@Component({
  selector: 'app-position-card',
  standalone: true,
  imports: [CommonModule, IonCard, IonCardContent],
  templateUrl: './position-card.component.html',
  styleUrl: './position-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PositionCardComponent {
  holding = input.required<ApiHolding>();

  totalGain = computed(() => {
    const h = this.holding();
    return (h.current_price - h.cost_basis) * h.quantity;
  });

  totalGainPercent = computed(() => {
    const h = this.holding();
    if (h.cost_basis === 0) return 0;
    return ((h.current_price - h.cost_basis) / h.cost_basis) * 100;
  });

  isGain = computed(() => this.totalGain() >= 0);

  formattedGain = computed(() => {
    const gain = this.totalGain();
    const sign = gain >= 0 ? '+' : '';
    return `${sign}$${Math.abs(gain).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  });

  formattedGainPercent = computed(() => {
    const pct = this.totalGainPercent();
    const sign = pct >= 0 ? '+' : '';
    return `(${sign}${pct.toFixed(2)}%)`;
  });

  formattedCostBasis = computed(() =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(this.holding().cost_basis)
  );

  formattedValue = computed(() =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(this.holding().value)
  );
}
