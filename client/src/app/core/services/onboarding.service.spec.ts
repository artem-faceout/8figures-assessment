import { TestBed } from '@angular/core/testing';
import { OnboardingService } from './onboarding.service';
import { OnboardingStep, STORAGE_KEYS } from '@app/core/models/onboarding.model';
import { Preferences } from '@capacitor/preferences';

jest.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: jest.fn(),
    set: jest.fn(),
    remove: jest.fn(),
  },
}));

const mockPreferences = jest.mocked(Preferences);

describe('OnboardingService', () => {
  let service: OnboardingService;

  beforeEach(() => {
    jest.clearAllMocks();
    mockPreferences.get.mockResolvedValue({ value: null });
    mockPreferences.set.mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      providers: [OnboardingService],
    });
    service = TestBed.inject(OnboardingService);
  });

  describe('initial state', () => {
    it('should start at Hook step', () => {
      expect(service.currentStep()).toBe(OnboardingStep.Hook);
    });

    it('should have no investment profile', () => {
      expect(service.investmentProfile()).toBeNull();
    });

    it('should not be complete', () => {
      expect(service.isComplete()).toBe(false);
    });
  });

  describe('navigation', () => {
    it('should advance to next step', () => {
      service.nextStep();
      expect(service.currentStep()).toBe(OnboardingStep.Promise);
    });

    it('should not advance past Paywall', () => {
      service.nextStep(); // Promise
      service.nextStep(); // Bridge
      service.nextStep(); // Paywall
      service.nextStep(); // should stay at Paywall
      expect(service.currentStep()).toBe(OnboardingStep.Paywall);
    });

    it('should go back one step', () => {
      service.nextStep(); // Promise
      service.nextStep(); // Bridge
      service.nextStep(); // Paywall
      service.previousStep();
      expect(service.currentStep()).toBe(OnboardingStep.Bridge);
    });

    it('should not go back before Hook', () => {
      service.previousStep();
      expect(service.currentStep()).toBe(OnboardingStep.Hook);
    });
  });

  describe('investment profile', () => {
    it('should set and persist investment profile', async () => {
      await service.setInvestmentProfile('experienced');
      expect(service.investmentProfile()).toBe('experienced');
      expect(mockPreferences.set).toHaveBeenCalledWith({
        key: STORAGE_KEYS.investmentProfile,
        value: 'experienced',
      });
    });

    it('should allow changing profile selection', async () => {
      await service.setInvestmentProfile('experienced');
      await service.setInvestmentProfile('beginner');
      expect(service.investmentProfile()).toBe('beginner');
    });
  });

  describe('complete onboarding', () => {
    it('should mark onboarding as complete and set trial status', async () => {
      await service.setInvestmentProfile('beginner');
      await service.completeOnboarding();

      expect(service.isComplete()).toBe(true);
      expect(mockPreferences.set).toHaveBeenCalledWith({
        key: STORAGE_KEYS.onboardingComplete,
        value: 'true',
      });
      expect(mockPreferences.set).toHaveBeenCalledWith({
        key: STORAGE_KEYS.subscriptionStatus,
        value: 'trial',
      });
    });
  });

  describe('checkOnboardingStatus', () => {
    it('should return true when onboarding was previously completed', async () => {
      mockPreferences.get.mockImplementation(async ({ key }) => {
        if (key === STORAGE_KEYS.onboardingComplete) return { value: 'true' };
        if (key === STORAGE_KEYS.investmentProfile) return { value: 'experienced' };
        return { value: null };
      });

      const complete = await service.checkOnboardingStatus();
      expect(complete).toBe(true);
      expect(service.isComplete()).toBe(true);
      expect(service.investmentProfile()).toBe('experienced');
    });

    it('should return false when onboarding was not completed', async () => {
      mockPreferences.get.mockResolvedValue({ value: null });

      const complete = await service.checkOnboardingStatus();
      expect(complete).toBe(false);
      expect(service.isComplete()).toBe(false);
    });
  });
});
