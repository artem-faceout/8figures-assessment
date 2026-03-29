import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { OnboardingService } from '@app/core/services/onboarding.service';
import { type InvestmentProfile } from '@app/core/models/onboarding.model';
import { AmbientGlowComponent } from '@app/shared/components/ambient-glow/ambient-glow.component';

@Component({
  selector: 'app-onboarding-bridge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AmbientGlowComponent],
  templateUrl: './onboarding-bridge.component.html',
  styleUrl: './onboarding-bridge.component.scss',
})
export class OnboardingBridgeComponent {
  private readonly onboardingService = inject(OnboardingService);

  readonly continue = output<void>();
  readonly selectedProfile = signal<InvestmentProfile | null>(null);

  constructor() {
    const existing = this.onboardingService.investmentProfile();
    if (existing) {
      this.selectedProfile.set(existing);
    }
  }

  async selectProfile(profile: InvestmentProfile): Promise<void> {
    this.selectedProfile.set(profile);
    await this.onboardingService.setInvestmentProfile(profile);
  }

  onContinue(): void {
    if (this.selectedProfile()) {
      this.continue.emit();
    }
  }
}
