import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard,
  IonCardContent,
  IonSkeletonText,
} from '@ionic/angular/standalone';
import type { ApiAssetMetrics } from '@app/core/models/portfolio.model';

@Component({
  selector: 'app-metrics-grid',
  standalone: true,
  imports: [CommonModule, IonCard, IonCardContent, IonSkeletonText],
  templateUrl: './metrics-grid.component.html',
  styleUrl: './metrics-grid.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MetricsGridComponent {
  metrics = input<ApiAssetMetrics | null>(null);
  loading = input(false);

  peRatio = computed(() => {
    const m = this.metrics();
    return m?.pe_ratio != null ? m.pe_ratio.toFixed(1) : 'N/A';
  });

  dayRange = computed(() => {
    const m = this.metrics();
    if (!m) return '';
    return `$${m.day_range_low.toFixed(2)} — $${m.day_range_high.toFixed(2)}`;
  });
}
