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
    path: 'tabs',
    loadComponent: () =>
      import('./layouts/tabs/tabs.layout').then(m => m.TabsLayout),
    canActivate: [onboardingGuard],
    children: [
      {
        path: 'dashboard',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/dashboard/dashboard.page').then(
                m => m.DashboardPage
              ),
          },
          {
            path: 'asset/:ticker',
            loadComponent: () =>
              import('./features/asset-detail/asset-detail.page').then(
                m => m.AssetDetailPage
              ),
          },
        ],
      },
      {
        path: 'chat',
        loadComponent: () =>
          import('./features/chat/chat.page').then(m => m.ChatPage),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: 'chat',
    redirectTo: 'tabs/chat',
    pathMatch: 'full',
  },
  {
    path: '',
    redirectTo: 'onboarding',
    pathMatch: 'full',
  },
];
