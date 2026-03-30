import { render, screen } from '@testing-library/angular';
import { TourOverlayComponent } from './tour-overlay.component';
import { TourService } from '@app/core/services/tour.service';
import { TOUR_STEPS } from '@app/core/models/tour.model';

/**
 * Helper to set up the DOM with data-tour target elements
 * that have known positions via mocked getBoundingClientRect.
 */
function createTourTargets(): void {
  TOUR_STEPS.forEach(step => {
    const el = document.createElement('div');
    el.setAttribute('data-tour', step.target);
    el.getBoundingClientRect = () => ({
      top: 100,
      left: 20,
      bottom: 160,
      right: 340,
      width: 320,
      height: 60,
      x: 20,
      y: 100,
      toJSON: () => ({}),
    });
    document.body.appendChild(el);
  });
}

function removeTourTargets(): void {
  document
    .querySelectorAll('[data-tour]')
    .forEach(el => el.remove());
}

/**
 * Flush the scheduled rect calculation.
 * The component uses requestAnimationFrame + setTimeout(100ms).
 * Jest fake timers handle setTimeout; we mock rAF to run callbacks immediately.
 */
async function flushRectCalculation(fixture: { detectChanges: () => void }): Promise<void> {
  // Advance past rAF + 100ms delay + potential retries
  jest.advanceTimersByTime(300);
  fixture.detectChanges();
  // Allow any promises to resolve
  await Promise.resolve();
  fixture.detectChanges();
}

describe('TourOverlayComponent', () => {
  let tourService: TourService;

  beforeEach(() => {
    jest.useFakeTimers();
    // Mock requestAnimationFrame to execute callback immediately via setTimeout(0)
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      return setTimeout(cb, 0) as unknown as number;
    });
    localStorage.clear();
    createTourTargets();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
    localStorage.clear();
    removeTourTargets();
  });

  async function setup() {
    const { fixture } = await render(TourOverlayComponent);
    tourService = fixture.debugElement.injector.get(TourService);
    return { fixture };
  }

  it('should not show any tooltip when tour is inactive', async () => {
    await setup();
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('should show tooltip with step text when tour is active', async () => {
    const { fixture } = await setup();
    tourService.start();
    fixture.detectChanges();
    await flushRectCalculation(fixture);

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip).toBeTruthy();
    expect(tooltip.textContent).toContain(TOUR_STEPS[0].text);
  });

  it('should show "Next" button on non-last steps', async () => {
    const { fixture } = await setup();
    tourService.start();
    fixture.detectChanges();
    await flushRectCalculation(fixture);

    expect(screen.getByText('Next')).toBeTruthy();
  });

  it('should show "Got it" button on the last step', async () => {
    const { fixture } = await setup();
    tourService.start();
    fixture.detectChanges();
    await flushRectCalculation(fixture);

    // Advance to last step
    for (let i = 0; i < TOUR_STEPS.length - 1; i++) {
      tourService.next();
      fixture.detectChanges();
      await flushRectCalculation(fixture);
    }

    expect(screen.getByText('Got it')).toBeTruthy();
  });

  it('should advance step when Next button is clicked', async () => {
    const { fixture } = await setup();
    tourService.start();
    fixture.detectChanges();
    await flushRectCalculation(fixture);

    screen.getByText('Next').click();
    fixture.detectChanges();
    await flushRectCalculation(fixture);

    expect(tourService.currentStep()).toBe(1);
    expect(screen.getByRole('tooltip').textContent).toContain(
      TOUR_STEPS[1].text
    );
  });

  it('should dismiss tour when Got it button is clicked', async () => {
    const { fixture } = await setup();
    tourService.start();
    fixture.detectChanges();
    await flushRectCalculation(fixture);

    for (let i = 0; i < TOUR_STEPS.length - 1; i++) {
      tourService.next();
      fixture.detectChanges();
      await flushRectCalculation(fixture);
    }

    screen.getByText('Got it').click();
    fixture.detectChanges();

    expect(tourService.tourActive()).toBe(false);
    expect(screen.queryByRole('tooltip')).toBeNull();
  });

  it('should skip step when target element is not found', async () => {
    // Remove the insight-card target
    document.querySelector('[data-tour="insight-card"]')?.remove();

    const { fixture } = await setup();
    tourService.start();
    fixture.detectChanges();
    await flushRectCalculation(fixture);

    // Step 0 should work fine (portfolio-summary exists)
    expect(screen.getByRole('tooltip').textContent).toContain(
      TOUR_STEPS[0].text
    );

    // Advance -- step 1 target is missing, should skip to step 2 after retries
    screen.getByText('Next').click();
    fixture.detectChanges();
    // Need extra time for retry logic (up to 3 retries * 200ms * retryCount)
    jest.advanceTimersByTime(2000);
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();
    // Flush the scheduled calculation for the skipped-to step
    await flushRectCalculation(fixture);

    expect(tourService.currentStep()).toBe(2);
    expect(screen.getByRole('tooltip').textContent).toContain(
      TOUR_STEPS[2].text
    );
  });

  it('should have aria-live polite on tooltip', async () => {
    const { fixture } = await setup();
    tourService.start();
    fixture.detectChanges();
    await flushRectCalculation(fixture);

    const tooltip = screen.getByRole('tooltip');
    expect(tooltip.getAttribute('aria-live')).toBe('polite');
  });

  it('should advance when backdrop is clicked', async () => {
    const { fixture } = await setup();
    tourService.start();
    fixture.detectChanges();
    await flushRectCalculation(fixture);

    const backdrop = fixture.nativeElement.querySelector(
      '.tour-backdrop'
    ) as HTMLElement;
    backdrop.click();
    fixture.detectChanges();
    await flushRectCalculation(fixture);

    expect(tourService.currentStep()).toBe(1);
  });

  it('should render backdrop with clip-path when active', async () => {
    const { fixture } = await setup();
    tourService.start();
    fixture.detectChanges();
    await flushRectCalculation(fixture);

    const backdrop = fixture.nativeElement.querySelector(
      '.tour-backdrop'
    ) as HTMLElement;
    expect(backdrop).toBeTruthy();
    expect(backdrop.style.clipPath).toContain('polygon');
  });

  it('should dismiss tour when all targets are missing', async () => {
    removeTourTargets();

    const { fixture } = await setup();
    tourService.start();
    fixture.detectChanges();
    // Need extra time for retry logic on all steps
    jest.advanceTimersByTime(5000);
    fixture.detectChanges();
    await Promise.resolve();
    fixture.detectChanges();

    expect(tourService.tourActive()).toBe(false);
  });
});
