import { inject } from '@angular/core';
import { type CanActivateFn, Router } from '@angular/router';

import { OnboardingService } from '@app/core/services/onboarding.service';

export const onboardingGuard: CanActivateFn = async () => {
  const service = inject(OnboardingService);
  const router = inject(Router);

  const complete = await service.checkOnboardingStatus();

  if (complete) {
    return true;
  }

  return router.createUrlTree(['/onboarding']);
};

export const onboardingRedirectGuard: CanActivateFn = async () => {
  const service = inject(OnboardingService);
  const router = inject(Router);

  const complete = await service.checkOnboardingStatus();

  if (complete) {
    return router.createUrlTree(['/home']);
  }

  return true;
};
