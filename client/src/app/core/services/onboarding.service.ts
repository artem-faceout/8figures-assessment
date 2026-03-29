import { Injectable, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import {
  type InvestmentProfile,
  OnboardingStep,
  STORAGE_KEYS,
} from '@app/core/models/onboarding.model';

@Injectable({ providedIn: 'root' })
export class OnboardingService {
  readonly currentStep = signal<OnboardingStep>(OnboardingStep.Hook);
  readonly investmentProfile = signal<InvestmentProfile | null>(null);
  readonly isComplete = signal(false);

  nextStep(): void {
    const current = this.currentStep();
    if (current < OnboardingStep.Paywall) {
      this.currentStep.set(current + 1);
    }
  }

  previousStep(): void {
    const current = this.currentStep();
    if (current > OnboardingStep.Hook) {
      this.currentStep.set(current - 1);
    }
  }

  async setInvestmentProfile(profile: InvestmentProfile): Promise<void> {
    this.investmentProfile.set(profile);
    await Preferences.set({
      key: STORAGE_KEYS.investmentProfile,
      value: profile,
    });
  }

  async completeOnboarding(): Promise<void> {
    this.isComplete.set(true);
    await Preferences.set({
      key: STORAGE_KEYS.onboardingComplete,
      value: 'true',
    });
    await Preferences.set({
      key: STORAGE_KEYS.subscriptionStatus,
      value: 'trial',
    });
  }

  async checkOnboardingStatus(): Promise<boolean> {
    try {
      const { value: complete } = await Preferences.get({
        key: STORAGE_KEYS.onboardingComplete,
      });

      if (complete === 'true') {
        this.isComplete.set(true);

        const { value: profile } = await Preferences.get({
          key: STORAGE_KEYS.investmentProfile,
        });
        if (profile === 'experienced' || profile === 'beginner') {
          this.investmentProfile.set(profile);
        }

        return true;
      }
    } catch {
      // Preferences may fail in browser without Capacitor runtime — treat as incomplete
    }

    return false;
  }
}
