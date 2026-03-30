import { TOUR_STEPS, TOUR_STORAGE_KEY, type TourStep } from './tour.model';

describe('Tour Model', () => {
  it('should define exactly 4 tour steps', () => {
    expect(TOUR_STEPS).toHaveLength(4);
  });

  it('should have portfolio-summary as the first step targeting below', () => {
    const step: TourStep = TOUR_STEPS[0];
    expect(step.target).toBe('portfolio-summary');
    expect(step.position).toBe('below');
    expect(step.text).toBeTruthy();
  });

  it('should have chat-fab as the last step targeting above', () => {
    const step: TourStep = TOUR_STEPS[3];
    expect(step.target).toBe('chat-fab');
    expect(step.position).toBe('above');
  });

  it('should have unique targets for each step', () => {
    const targets = TOUR_STEPS.map(s => s.target);
    expect(new Set(targets).size).toBe(targets.length);
  });

  it('should define the correct localStorage key', () => {
    expect(TOUR_STORAGE_KEY).toBe('8f_tour_completed');
  });
});
