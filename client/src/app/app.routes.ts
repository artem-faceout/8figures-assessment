import { Routes } from '@angular/router';
import { onboardingGuard } from '@app/core/guards/onboarding.guard';
import { onboardingRedirectGuard } from '@app/core/guards/onboarding.guard';

export const routes: Routes = [
  {
    path: 'onboarding',
    loadComponent: () =>
      import('./features/onboarding/onboarding.page').then(m => m.OnboardingPage),
    canActivate: [onboardingRedirectGuard],
  },
  {
    path: 'chat',
    loadComponent: () =>
      import('./features/chat/chat.page').then(m => m.ChatPage),
  },
  {
    path: 'home',
    loadComponent: () =>
      import('./features/onboarding/components/home-placeholder.component').then(m => m.HomePlaceholderComponent),
    canActivate: [onboardingGuard],
  },
  {
    path: '',
    redirectTo: 'onboarding',
    pathMatch: 'full',
  },
];
