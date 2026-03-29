import { TestBed } from '@angular/core/testing';
import { Router, type UrlTree } from '@angular/router';

import { OnboardingService } from '@app/core/services/onboarding.service';
import { onboardingGuard, onboardingRedirectGuard } from './onboarding.guard';

describe('onboardingGuard', () => {
  const mockUrlTree = {} as UrlTree;
  const mockService = {
    checkOnboardingStatus: jest.fn(),
  };
  const mockRouter = {
    createUrlTree: jest.fn().mockReturnValue(mockUrlTree),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        { provide: OnboardingService, useValue: mockService },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  it('should return true when onboarding is complete', async () => {
    mockService.checkOnboardingStatus.mockResolvedValue(true);

    const result = await TestBed.runInInjectionContext(() => onboardingGuard({} as never, {} as never));

    expect(result).toBe(true);
    expect(mockRouter.createUrlTree).not.toHaveBeenCalled();
  });

  it('should redirect to /onboarding when onboarding is not complete', async () => {
    mockService.checkOnboardingStatus.mockResolvedValue(false);

    const result = await TestBed.runInInjectionContext(() => onboardingGuard({} as never, {} as never));

    expect(result).toBe(mockUrlTree);
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/onboarding']);
  });
});

describe('onboardingRedirectGuard', () => {
  const mockUrlTree = {} as UrlTree;
  const mockService = {
    checkOnboardingStatus: jest.fn(),
  };
  const mockRouter = {
    createUrlTree: jest.fn().mockReturnValue(mockUrlTree),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [
        { provide: OnboardingService, useValue: mockService },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  it('should redirect to / when onboarding is already complete', async () => {
    mockService.checkOnboardingStatus.mockResolvedValue(true);

    const result = await TestBed.runInInjectionContext(() => onboardingRedirectGuard({} as never, {} as never));

    expect(result).toBe(mockUrlTree);
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/home']);
  });

  it('should return true when onboarding is not complete', async () => {
    mockService.checkOnboardingStatus.mockResolvedValue(false);

    const result = await TestBed.runInInjectionContext(() => onboardingRedirectGuard({} as never, {} as never));

    expect(result).toBe(true);
    expect(mockRouter.createUrlTree).not.toHaveBeenCalled();
  });
});
