import { computed, Injectable, signal } from '@angular/core';
import type { ApiPortfolio } from '@app/core/models/chat.model';

const STORAGE_KEY = '8f_portfolio';

@Injectable({ providedIn: 'root' })
export class PortfolioService {
  private readonly _portfolio = signal<ApiPortfolio | null>(null);

  readonly portfolio = this._portfolio.asReadonly();
  readonly hasPortfolio = computed(() => this._portfolio() !== null);

  constructor() {
    this.loadFromStorage();
  }

  setPortfolio(portfolio: ApiPortfolio): void {
    this._portfolio.set(portfolio);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
    } catch {
      // Storage full or unavailable — signal still has the data
    }
  }

  loadFromStorage(): void {
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
