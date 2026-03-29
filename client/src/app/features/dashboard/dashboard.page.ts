import {
  ChangeDetectionStrategy,
  Component,
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
import { PortfolioSummaryComponent } from '@app/shared/components/portfolio-summary/portfolio-summary.component';
import { InsightCardComponent } from '@app/shared/components/insight-card/insight-card.component';
import { HoldingRowComponent } from '@app/shared/components/holding-row/holding-row.component';

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
  ],
  templateUrl: './dashboard.page.html',
  styleUrl: './dashboard.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage implements OnInit {
  private readonly router = inject(Router);
  protected readonly portfolioService = inject(PortfolioService);

  constructor() {
    addIcons({ sparkles });
  }

  ngOnInit(): void {
    this.portfolioService.fetchInsight();
  }

  onHoldingTap(ticker: string): void {
    this.router.navigate(['/tabs/dashboard/asset', ticker]);
  }

  onFabTap(): void {
    this.router.navigate(['/tabs/chat']);
  }
}
