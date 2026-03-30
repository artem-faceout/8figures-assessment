import { TestBed } from '@angular/core/testing';
import { TourService } from './tour.service';
import { TOUR_STORAGE_KEY, TOUR_STEPS } from '@app/core/models/tour.model';

describe('TourService', () => {
  let service: TourService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({});
    service = TestBed.inject(TourService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('initial state', () => {
    it('should start with tour inactive', () => {
      expect(service.tourActive()).toBe(false);
    });

    it('should start at step 0', () => {
      expect(service.currentStep()).toBe(0);
    });

    it('should expose the current step config', () => {
      expect(service.currentStepConfig()).toEqual(TOUR_STEPS[0]);
    });
  });

  describe('shouldShowTour()', () => {
    it('should return true when tour has not been completed', () => {
      expect(service.shouldShowTour()).toBe(true);
    });

    it('should return false when tour was already completed', () => {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
      // Need a fresh instance to pick up localStorage
      const freshService = TestBed.inject(TourService);
      expect(freshService.shouldShowTour()).toBe(false);
    });
  });

  describe('start()', () => {
    it('should activate the tour and reset to step 0', () => {
      service.start();
      expect(service.tourActive()).toBe(true);
      expect(service.currentStep()).toBe(0);
    });
  });

  describe('next()', () => {
    it('should advance to the next step', () => {
      service.start();
      service.next();
      expect(service.currentStep()).toBe(1);
      expect(service.currentStepConfig()).toEqual(TOUR_STEPS[1]);
    });

    it('should dismiss the tour when called on the last step', () => {
      service.start();
      // Advance through all steps
      for (let i = 0; i < TOUR_STEPS.length - 1; i++) {
        service.next();
      }
      // Now on last step, next should dismiss
      service.next();
      expect(service.tourActive()).toBe(false);
    });

    it('should not advance when tour is inactive', () => {
      service.next();
      expect(service.currentStep()).toBe(0);
    });
  });

  describe('skipTo()', () => {
    it('should jump directly to the specified step', () => {
      service.start();
      service.skipTo(2);
      expect(service.currentStep()).toBe(2);
      expect(service.currentStepConfig()).toEqual(TOUR_STEPS[2]);
    });

    it('should dismiss when index is beyond last step', () => {
      service.start();
      service.skipTo(TOUR_STEPS.length);
      expect(service.tourActive()).toBe(false);
    });

    it('should not change step when tour is inactive', () => {
      service.skipTo(2);
      expect(service.currentStep()).toBe(0);
    });
  });

  describe('dismiss()', () => {
    it('should deactivate the tour', () => {
      service.start();
      service.dismiss();
      expect(service.tourActive()).toBe(false);
    });

    it('should persist completion to localStorage', () => {
      service.start();
      service.dismiss();
      expect(localStorage.getItem(TOUR_STORAGE_KEY)).toBe('true');
    });

    it('should make shouldShowTour return false after dismissal', () => {
      service.start();
      service.dismiss();
      expect(service.shouldShowTour()).toBe(false);
    });
  });

  describe('isLastStep', () => {
    it('should be false on first step', () => {
      service.start();
      expect(service.isLastStep()).toBe(false);
    });

    it('should be true on the last step', () => {
      service.start();
      for (let i = 0; i < TOUR_STEPS.length - 1; i++) {
        service.next();
      }
      expect(service.isLastStep()).toBe(true);
    });
  });
});
