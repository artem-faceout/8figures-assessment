export enum OnboardingStep {
  Hook = 0,
  Promise = 1,
  Bridge = 2,
  Paywall = 3,
}

export type InvestmentProfile = 'experienced' | 'beginner';

export type SubscriptionStatus = 'trial' | 'active' | 'none';

export const ONBOARDING_TOTAL_STEPS = 3; // Hook, Promise, Bridge (paywall has no indicator)

export const STORAGE_KEYS = {
  onboardingComplete: '8f_onboarding_complete',
  investmentProfile: '8f_investment_profile',
  subscriptionStatus: '8f_subscription_status',
  deviceId: '8f_device_id',
} as const;
