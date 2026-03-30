/** Tour step configuration for the dashboard guided tour. */
export interface TourStep {
  /** Value of `data-tour` attribute on the target element */
  readonly target: string;
  /** Tooltip body text shown to the user */
  readonly text: string;
  /** Tooltip placement relative to the highlighted element */
  readonly position: 'above' | 'below';
}

/** Ordered tour steps matching the dashboard layout */
export const TOUR_STEPS: readonly TourStep[] = [
  {
    target: 'portfolio-summary',
    text: 'Your portfolio at a glance \u2014 total value, daily change, and overall gain.',
    position: 'below',
  },
  {
    target: 'insight-card',
    text: 'AI-generated insights about your portfolio, refreshed daily.',
    position: 'below',
  },
  {
    target: 'holding-row',
    text: 'Tap any holding to see detailed performance and metrics.',
    position: 'below',
  },
  {
    target: 'chat-fab',
    text: 'Ask the AI anything about your investments.',
    position: 'above',
  },
] as const;

/** localStorage key for tour completion flag */
export const TOUR_STORAGE_KEY = '8f_tour_completed';
