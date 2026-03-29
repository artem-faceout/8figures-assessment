import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { OnboardingService } from '@app/core/services/onboarding.service';
import { OnboardingStep, ONBOARDING_TOTAL_STEPS } from '@app/core/models/onboarding.model';
import type { ChatConfig } from '@app/core/models/chat.model';
import { OnboardingHookComponent } from './components/hook/onboarding-hook.component';
import { OnboardingPromiseComponent } from './components/promise/onboarding-promise.component';
import { OnboardingBridgeComponent } from './components/bridge/onboarding-bridge.component';
import { PaywallComponent } from './components/paywall/paywall.component';
import { PageIndicatorComponent } from '@app/shared/components/page-indicator/page-indicator.component';
import { stepTransition } from './animations/onboarding.animations';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    OnboardingHookComponent,
    OnboardingPromiseComponent,
    OnboardingBridgeComponent,
    PaywallComponent,
    PageIndicatorComponent,
  ],
  animations: [stepTransition],
  templateUrl: './onboarding.page.html',
  styleUrl: './onboarding.page.scss',
})
export class OnboardingPage {
  private readonly onboardingService = inject(OnboardingService);
  private readonly router = inject(Router);

  readonly currentStep = this.onboardingService.currentStep;
  readonly totalSteps = ONBOARDING_TOTAL_STEPS;
  readonly Step = OnboardingStep;

  onContinue(): void {
    if (this.currentStep() === OnboardingStep.Bridge) {
      const persona = this.onboardingService.investmentProfile() ?? 'beginner';
      const config: ChatConfig = { mode: 'onboarding', persona };
      this.router.navigate(['/chat'], { state: config });
    } else {
      this.onboardingService.nextStep();
    }
  }

  onBack(): void {
    this.onboardingService.previousStep();
  }

  async onComplete(): Promise<void> {
    await this.router.navigate(['/tabs/dashboard']);
  }
}
