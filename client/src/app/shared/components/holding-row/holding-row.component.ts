import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonItem,
  IonAvatar,
  IonLabel,
  IonNote,
} from '@ionic/angular/standalone';
import type { ApiHolding } from '@app/core/models/chat.model';

const TICKER_COLORS: Record<string, string> = {
  A: '#ef4444',
  B: '#f97316',
  C: '#eab308',
  D: '#22c55e',
  E: '#06b6d4',
  F: '#3b82f6',
  G: '#8b5cf6',
  H: '#ec4899',
  I: '#14b8a6',
  J: '#f59e0b',
  K: '#10b981',
  L: '#6366f1',
  M: '#a855f7',
  N: '#f7931a',
  O: '#0ea5e9',
  V: '#7c3aed',
};

@Component({
  selector: 'app-holding-row',
  standalone: true,
  imports: [CommonModule, IonItem, IonAvatar, IonLabel, IonNote],
  templateUrl: './holding-row.component.html',
  styleUrl: './holding-row.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HoldingRowComponent {
  holding = input.required<ApiHolding>();
  tapped = output<string>();

  avatarColor = computed(() => {
    const letter = this.holding().ticker.charAt(0).toUpperCase();
    return TICKER_COLORS[letter] ?? '#f7931a';
  });

  avatarLetter = computed(() => this.holding().ticker.charAt(0).toUpperCase());

  formattedValue = computed(() =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(this.holding().value)
  );

  changeClass = computed(() =>
    this.holding().daily_change_percent >= 0 ? 'gain' : 'loss'
  );

  formattedChange = computed(() => {
    const pct = this.holding().daily_change_percent;
    const sign = pct >= 0 ? '+' : '';
    return `${sign}${pct.toFixed(2)}%`;
  });

  onTap(): void {
    this.tapped.emit(this.holding().ticker);
  }
}
