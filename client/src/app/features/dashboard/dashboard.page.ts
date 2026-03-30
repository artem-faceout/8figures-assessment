import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonFab,
  IonFabButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { sparkles } from 'ionicons/icons';
import { PortfolioService } from '@app/core/services/portfolio.service';
import { TourService } from '@app/core/services/tour.service';
import { PortfolioSummaryComponent } from '@app/shared/components/portfolio-summary/portfolio-summary.component';
import { InsightCardComponent } from '@app/shared/components/insight-card/insight-card.component';
import { HoldingRowComponent } from '@app/shared/components/holding-row/holding-row.component';
import { TourOverlayComponent } from '@app/shared/components/tour-overlay/tour-overlay.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    IonContent,
    IonFab,
    IonFabButton,
    IonIcon,
    PortfolioSummaryComponent,
    InsightCardComponent,
    HoldingRowComponent,
    TourOverlayComponent,
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage implements OnInit {
  private readonly router = inject(Router);
  protected readonly portfolioService = inject(PortfolioService);
  protected readonly tourService = inject(TourService);

  constructor() {
    addIcons({ sparkles });

    // Start tour when portfolio becomes available and tour hasn't been completed
    effect(() => {
      const portfolio = this.portfolioService.portfolio();
      if (portfolio && this.tourService.shouldShowTour() && !this.tourService.tourActive()) {
        this.tourService.start();
      }
    });
  }

  ngOnInit(): void {
    this.portfolioService.fetchInsight();
  }

  onHoldingTap(ticker: string): void {
    this.router.navigate(['/dashboard/asset', ticker]);
  }

  onFabTap(): void {
    this.router.navigate(['/chat']);
  }
}
