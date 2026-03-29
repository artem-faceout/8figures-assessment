import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonSkeletonText } from '@ionic/angular/standalone';
import type { ApiPricePoint } from '@app/core/models/portfolio.model';

@Component({
  selector: 'app-price-chart',
  standalone: true,
  imports: [CommonModule, IonSkeletonText],
  templateUrl: './price-chart.component.html',
  styleUrl: './price-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PriceChartComponent {
  points = input<ApiPricePoint[]>([]);
  loading = input(false);
  error = input(false);

  private readonly WIDTH = 340;
  private readonly HEIGHT = 160;
  private readonly PADDING = 8;

  svgPath = computed(() => {
    const pts = this.points();
    if (pts.length < 2) return '';

    const prices = pts.map(p => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const range = maxPrice - minPrice || 1;

    const usableW = this.WIDTH - this.PADDING * 2;
    const usableH = this.HEIGHT - this.PADDING * 2;

    const coords = prices.map((price, i) => ({
      x: this.PADDING + (i / (prices.length - 1)) * usableW,
      y: this.PADDING + (1 - (price - minPrice) / range) * usableH,
    }));

    // Smooth bezier curve
    let d = `M ${coords[0].x},${coords[0].y}`;
    for (let i = 1; i < coords.length; i++) {
      const prev = coords[i - 1];
      const curr = coords[i];
      const cpx1 = prev.x + (curr.x - prev.x) / 3;
      const cpx2 = prev.x + ((curr.x - prev.x) * 2) / 3;
      d += ` C ${cpx1},${prev.y} ${cpx2},${curr.y} ${curr.x},${curr.y}`;
    }

    return d;
  });

  fillPath = computed(() => {
    const path = this.svgPath();
    if (!path) return '';
    const usableW = this.WIDTH - this.PADDING * 2;
    const lastX = this.PADDING + usableW;
    const firstX = this.PADDING;
    return `${path} L ${lastX},${this.HEIGHT} L ${firstX},${this.HEIGHT} Z`;
  });

  viewBox = `0 0 ${this.WIDTH} ${this.HEIGHT}`;
}
