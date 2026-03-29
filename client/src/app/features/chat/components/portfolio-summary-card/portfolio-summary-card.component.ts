import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import type { ApiPortfolio } from '@app/core/models/chat.model';

@Component({
  selector: 'app-portfolio-summary-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CurrencyPipe],
  templateUrl: './portfolio-summary-card.component.html',
  styleUrl: './portfolio-summary-card.component.scss',
})
export class PortfolioSummaryCardComponent {
  readonly portfolio = input.required<ApiPortfolio>();
  readonly ctaClick = output<void>();

  onCtaTap(): void {
    this.ctaClick.emit();
  }
}
