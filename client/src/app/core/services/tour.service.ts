import { computed, Injectable, signal } from '@angular/core';
import {
  TOUR_STEPS,
  TOUR_STORAGE_KEY,
  type TourStep,
} from '@app/core/models/tour.model';

@Injectable({ providedIn: 'root' })
export class TourService {
  private readonly _tourActive = signal(false);
  private readonly _currentStep = signal(0);

  readonly tourActive = this._tourActive.asReadonly();
  readonly currentStep = this._currentStep.asReadonly();

  readonly currentStepConfig = computed<TourStep>(
    () => TOUR_STEPS[this._currentStep()]
  );

  readonly isLastStep = computed(
    () => this._currentStep() === TOUR_STEPS.length - 1
  );

  /** Check if the tour should be shown (not yet completed). */
  shouldShowTour(): boolean {
    try {
      return localStorage.getItem(TOUR_STORAGE_KEY) !== 'true';
    } catch {
      return false;
    }
  }

  /** Start the tour from the beginning. */
  start(): void {
    this._currentStep.set(0);
    this._tourActive.set(true);
  }

  /** Jump directly to a specific step index. */
  skipTo(index: number): void {
    if (!this._tourActive()) return;

    if (index >= TOUR_STEPS.length) {
      this.dismiss();
    } else {
      this._currentStep.set(index);
    }
  }

  /** Advance to the next step, or dismiss if on the last step. */
  next(): void {
    if (!this._tourActive()) return;

    if (this.isLastStep()) {
      this.dismiss();
    } else {
      this._currentStep.update(s => s + 1);
    }
  }

  /** End the tour and persist completion. */
  dismiss(): void {
    this._tourActive.set(false);
    try {
      localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    } catch {
      // Storage unavailable -- signal state is still correct
    }
  }
}
