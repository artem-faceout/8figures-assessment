import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, tap, catchError, EMPTY, Subject } from 'rxjs';
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonContent,
  IonButton,
  IonIcon,
  IonAvatar,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { sparkles } from 'ionicons/icons';
import { PortfolioService } from '@app/core/services/portfolio.service';
import { PriceChartComponent } from '@app/shared/components/price-chart/price-chart.component';
import { MetricsGridComponent } from '@app/shared/components/metrics-grid/metrics-grid.component';
import { PositionCardComponent } from '@app/shared/components/position-card/position-card.component';
import type { ApiHolding } from '@app/core/models/chat.model';
import type {
  ApiPriceHistory,
  ApiAssetMetrics,
  ApiTimeRange,
} from '@app/core/models/portfolio.model';

const TIME_RANGES: ApiTimeRange[] = ['1W', '1M', '3M', '1Y', 'ALL'];

@Component({
  selector: 'app-asset-detail',
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonContent,
    IonButton,
    IonIcon,
    IonAvatar,
    PriceChartComponent,
    MetricsGridComponent,
    PositionCardComponent,
  ],
  templateUrl: './asset-detail.page.html',
  styleUrl: './asset-detail.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AssetDetailPage implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly portfolioService = inject(PortfolioService);
  private readonly destroyRef = inject(DestroyRef);

  readonly timeRanges = TIME_RANGES;

  readonly holding = signal<ApiHolding | null>(null);
  readonly metrics = signal<ApiAssetMetrics | null>(null);
  readonly metricsLoading = signal(true);
  readonly history = signal<ApiPriceHistory | null>(null);
  readonly historyLoading = signal(true);
  readonly historyError = signal(false);
  readonly selectedRange = signal<ApiTimeRange>('1M');

  private readonly rangeChange$ = new Subject<ApiTimeRange>();

  readonly formattedPrice = computed(() => {
    const h = this.holding();
    if (!h) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(h.current_price);
  });

  readonly changeClass = computed(() => {
    const h = this.holding();
    if (!h) return '';
    return h.daily_change_percent >= 0 ? 'gain' : 'loss';
  });

  readonly formattedChange = computed(() => {
    const h = this.holding();
    if (!h) return '';
    const pct = h.daily_change_percent;
    const sign = pct >= 0 ? '+' : '';
    return `${sign}${pct.toFixed(2)}%`;
  });

  readonly avatarLetter = computed(() =>
    this.holding()?.ticker.charAt(0).toUpperCase() ?? ''
  );

  constructor() {
    addIcons({ sparkles });
  }

  ngOnInit(): void {
    const ticker = this.route.snapshot.paramMap.get('ticker');
    if (!ticker) {
      this.router.navigate(['/tabs/dashboard']);
      return;
    }

    const holdingData = this.portfolioService.getHoldingByTicker(ticker);
    if (!holdingData) {
      this.router.navigate(['/tabs/dashboard']);
      return;
    }

    this.holding.set(holdingData);

    // Fetch metrics
    this.portfolioService
      .getMetrics(ticker)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: m => {
          this.metrics.set(m);
          this.metricsLoading.set(false);
        },
        error: () => this.metricsLoading.set(false),
      });

    // Fetch initial history + handle range changes
    this.rangeChange$
      .pipe(
        tap(range => {
          this.selectedRange.set(range);
          this.historyLoading.set(true);
          this.historyError.set(false);
        }),
        switchMap(range =>
          this.portfolioService.getHistory(ticker, range).pipe(
            catchError(() => {
              this.historyError.set(true);
              this.historyLoading.set(false);
              return EMPTY;
            })
          )
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(h => {
        this.history.set(h);
        this.historyLoading.set(false);
      });

    this.rangeChange$.next('1M');
  }

  onRangeSelect(range: ApiTimeRange): void {
    if (range !== this.selectedRange()) {
      this.rangeChange$.next(range);
    }
  }

  onAskAi(): void {
    const h = this.holding();
    if (!h) return;
    this.router.navigate(['/tabs/chat'], {
      state: {
        chatConfig: {
          mode: 'asset',
          asset: { ticker: h.ticker, name: h.name },
        },
      },
    });
  }
}
