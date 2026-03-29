import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonCard,
  IonCardContent,
  IonIcon,
  IonSkeletonText,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { sparkles, chevronForward } from 'ionicons/icons';
import type { ApiPortfolioInsight } from '@app/core/models/portfolio.model';

@Component({
  selector: 'app-insight-card',
  standalone: true,
  imports: [
    CommonModule,
    IonCard,
    IonCardContent,
    IonIcon,
    IonSkeletonText,
  ],
  templateUrl: './insight-card.component.html',
  styleUrl: './insight-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InsightCardComponent {
  insight = input<ApiPortfolioInsight | null>(null);
  loading = input(false);
  error = input(false);

  constructor() {
    addIcons({ sparkles, chevronForward });
  }
}
