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
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.page').then(m => m.DashboardPage),
    canActivate: [onboardingGuard],
  },
  {
    path: 'dashboard/asset/:ticker',
    loadComponent: () =>
      import('./features/asset-detail/asset-detail.page').then(
        m => m.AssetDetailPage
      ),
    canActivate: [onboardingGuard],
  },
  {
    path: 'chat',
    loadComponent: () =>
      import('./features/chat/chat.page').then(m => m.ChatPage),
  },
  {
    path: '',
    redirectTo: 'onboarding',
    pathMatch: 'full',
  },
];
