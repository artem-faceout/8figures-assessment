import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonCard, IonCardContent } from '@ionic/angular/standalone';
import type { ApiPortfolio } from '@app/core/models/chat.model';

@Component({
  selector: 'app-portfolio-summary',
  standalone: true,
  imports: [CommonModule, IonCard, IonCardContent],
  templateUrl: './portfolio-summary.component.html',
  styleUrl: './portfolio-summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioSummaryComponent {
  portfolio = input.required<ApiPortfolio>();

  formattedTotal = computed(() =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(this.portfolio().total_value)
  );

  formattedChange = computed(() => {
    const change = this.portfolio().daily_change;
    const sign = change >= 0 ? '+' : '';
    return `${sign}$${Math.abs(change).toFixed(2)} today`;
  });

  formattedPercent = computed(() => {
    const pct = this.portfolio().daily_change_percent;
    const sign = pct >= 0 ? '+' : '';
    return `${sign}${pct.toFixed(2)}%`;
  });

  isPositive = computed(() => this.portfolio().daily_change_percent >= 0);

  barData = computed(() => {
    const holdings = this.portfolio().holdings ?? [];
    if (holdings.length === 0) return [];
    const maxVal = Math.max(...holdings.map(h => h.value));
    return holdings.map(h => ({
      ticker: h.ticker,
      heightPercent: maxVal > 0 ? (h.value / maxVal) * 100 : 0,
      isHighest: h.value === maxVal,
    }));
  });
}
