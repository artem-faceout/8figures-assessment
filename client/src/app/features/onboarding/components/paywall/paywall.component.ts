import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { OnboardingService } from '@app/core/services/onboarding.service';
import { AmbientGlowComponent } from '@app/shared/components/ambient-glow/ambient-glow.component';
import { IonToast } from '@ionic/angular/standalone';

interface PaywallFeature {
  icon: string;
  label: string;
}

@Component({
  selector: 'app-paywall',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AmbientGlowComponent, IonToast],
  templateUrl: './paywall.component.html',
  styleUrl: './paywall.component.scss',
})
export class PaywallComponent {
  private readonly onboardingService = inject(OnboardingService);

  readonly back = output<void>();
  readonly complete = output<void>();
  readonly isPurchasing = signal(false);
  readonly showRestoreToast = signal(false);

  readonly features: PaywallFeature[] = [
    { icon: 'assets/onboarding/feature-icons/audit.svg', label: 'Real-time AI Portfolio Audits' },
    { icon: 'assets/onboarding/feature-icons/magic-wand.svg', label: 'Unlimited Magic Wand Interactions' },
    { icon: 'assets/onboarding/feature-icons/insights.svg', label: 'Priority Market Insights' },
    { icon: 'assets/onboarding/feature-icons/early-access.svg', label: 'Early Access to New Models' },
  ];

  onBack(): void {
    this.back.emit();
  }

  async onStartTrial(): Promise<void> {
    this.isPurchasing.set(true);

    // Mock purchase delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    await this.onboardingService.completeOnboarding();
    this.isPurchasing.set(false);
    this.complete.emit();
  }

  onRestorePurchase(): void {
    this.showRestoreToast.set(true);
  }
}
