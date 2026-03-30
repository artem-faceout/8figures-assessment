import { HttpClient } from '@angular/common/http';
import { computed, Injectable, signal, inject } from '@angular/core';
import type { ApiPortfolio, ApiHolding } from '@app/core/models/chat.model';
import type {
  ApiPriceHistory,
  ApiPortfolioInsight,
  ApiAssetMetrics,
  ApiTimeRange,
  ApiResponse,
} from '@app/core/models/portfolio.model';
import { Observable, map } from 'rxjs';
import { environment } from '@env/environment';

const STORAGE_KEY = '8f_portfolio';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly http = inject(HttpClient);
  private readonly _portfolio = signal<ApiPortfolio | null>(null);
  private readonly _insight = signal<ApiPortfolioInsight | null>(null);
  private readonly _insightLoading = signal(false);
  private readonly _insightError = signal(false);

  readonly portfolio = this._portfolio.asReadonly();
  readonly hasPortfolio = computed(() => this._portfolio() !== null);
  readonly holdings = computed(() => this._portfolio()?.holdings ?? []);

  readonly insight = this._insight.asReadonly();
  readonly insightLoading = this._insightLoading.asReadonly();
  readonly insightError = this._insightError.asReadonly();

  constructor() {
    this.loadFromStorage();
    this.fetchPortfolio();
  }

  getHoldingByTicker(ticker: string): ApiHolding | undefined {
    return this.holdings().find(
      h => h.ticker.toUpperCase() === ticker.toUpperCase()
    );
  }

  getHistory(
    ticker: string,
    range: ApiTimeRange = '1M'
  ): Observable<ApiPriceHistory> {
    return this.http
      .get<ApiResponse<ApiPriceHistory>>(
        `${environment.apiUrl}/api/v1/portfolio/${ticker}/history`,
        { params: { range } }
      )
      .pipe(map(res => res.data));
  }

  getMetrics(ticker: string): Observable<ApiAssetMetrics> {
    return this.http
      .get<ApiResponse<ApiAssetMetrics>>(
        `${environment.apiUrl}/api/v1/portfolio/${ticker}/metrics`
      )
      .pipe(map(res => res.data));
  }

  fetchInsight(): void {
    if (this._insight() || this._insightLoading()) return;

    this._insightLoading.set(true);
    this._insightError.set(false);

    this.http
      .get<ApiResponse<ApiPortfolioInsight>>(
        `${environment.apiUrl}/api/v1/portfolio/insight`
      )
      .subscribe({
        next: res => {
          this._insight.set(res.data);
          this._insightLoading.set(false);
        },
        error: () => {
          this._insightError.set(true);
          this._insightLoading.set(false);
        },
      });
  }

  fetchPortfolio(): void {
    this.http
      .get<ApiResponse<ApiPortfolio>>(
        `${environment.apiUrl}/api/v1/portfolio`
      )
      .pipe(map(res => res.data))
      .subscribe({
        next: portfolio => {
          this._portfolio.set(portfolio);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
          } catch {
            // Storage full or unavailable
          }
        },
        error: () => {
          // API failed — keep localStorage data if available
        },
      });
  }

  setPortfolio(portfolio: ApiPortfolio): void {
    this._portfolio.set(portfolio);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
    } catch {
      // Storage full or unavailable — signal still has the data
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this._portfolio.set(JSON.parse(stored) as ApiPortfolio);
      }
    } catch {
      // Corrupt data — start fresh
    }
  }
}
