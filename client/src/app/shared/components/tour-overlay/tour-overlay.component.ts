import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { TourService } from '@app/core/services/tour.service';
import { TOUR_STEPS } from '@app/core/models/tour.model';

interface TargetRect {
  top: number;
  left: number;
  width: number;
  height: number;
  bottom: number;
  right: number;
}

const CUTOUT_PADDING = 8;
const CUTOUT_RADIUS = 8;

@Component({
  selector: 'app-tour-overlay',
  standalone: true,
  templateUrl: './tour-overlay.component.html',
  styleUrl: './tour-overlay.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TourOverlayComponent {
  protected readonly tourService = inject(TourService);
  private readonly destroyRef = inject(DestroyRef);

  /** Rect of the current target element (null if not found). */
  protected readonly targetRect = signal<TargetRect | null>(null);

  /** CSS clip-path value for the backdrop cutout. */
  protected readonly clipPath = computed(() => {
    const rect = this.targetRect();
    if (!rect) return 'none';
    return this.buildClipPath(rect);
  });

  /** Tooltip positioning styles. */
  protected readonly tooltipStyle = computed(() => {
    const rect = this.targetRect();
    const step = this.tourService.currentStepConfig();
    if (!rect) return {};

    const centerX = rect.left + rect.width / 2;

    if (step.position === 'above') {
      return {
        bottom: `${window.innerHeight - rect.top + CUTOUT_PADDING + 12}px`,
        left: `${centerX}px`,
        transform: 'translateX(-50%)',
      };
    }
    // below
    return {
      top: `${rect.bottom + CUTOUT_PADDING + 12}px`,
      left: `${centerX}px`,
      transform: 'translateX(-50%)',
    };
  });

  protected readonly caretPosition = computed(() => {
    return this.tourService.currentStepConfig().position;
  });

  private resizeHandler: (() => void) | null = null;
  private resizeTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    // Recalculate rect when step changes (effect in constructor = injection context)
    effect(() => {
      const active = this.tourService.tourActive();
      const step = this.tourService.currentStep();
      if (active) {
        this.calculateRect(step);
      }
    });

    // Set up resize listener with debounce to avoid layout thrashing
    this.resizeHandler = () => {
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }
      this.resizeTimeout = setTimeout(() => {
        if (this.tourService.tourActive()) {
          this.calculateRect(this.tourService.currentStep());
        }
      }, 150);
    };
    window.addEventListener('resize', this.resizeHandler);

    this.destroyRef.onDestroy(() => {
      if (this.resizeHandler) {
        window.removeEventListener('resize', this.resizeHandler);
      }
      if (this.resizeTimeout) {
        clearTimeout(this.resizeTimeout);
      }
    });
  }

  protected onBackdropClick(): void {
    this.tourService.next();
  }

  protected onActionClick(event: Event): void {
    event.stopPropagation();
    this.tourService.next();
  }

  private calculateRect(stepIndex: number): void {
    const step = TOUR_STEPS[stepIndex];
    if (!step) return;

    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (!el) {
      // Target not found -- skip this step
      this.skipToNextAvailableStep(stepIndex);
      return;
    }

    const domRect = el.getBoundingClientRect();
    this.targetRect.set({
      top: domRect.top,
      left: domRect.left,
      width: domRect.width,
      height: domRect.height,
      bottom: domRect.bottom,
      right: domRect.right,
    });
  }

  private skipToNextAvailableStep(fromIndex: number): void {
    for (let i = fromIndex + 1; i < TOUR_STEPS.length; i++) {
      const el = document.querySelector(
        `[data-tour="${TOUR_STEPS[i].target}"]`
      );
      if (el) {
        this.tourService.skipTo(i);
        return;
      }
    }
    // No remaining targets found -- dismiss
    this.tourService.dismiss();
  }

  private buildClipPath(rect: TargetRect): string {
    const p = CUTOUT_PADDING;
    const r = CUTOUT_RADIUS;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    const t = rect.top - p;
    const l = rect.left - p;
    const b = rect.bottom + p;
    const ri = rect.right + p;

    return `polygon(
      0 0, ${vw}px 0, ${vw}px ${vh}px, 0 ${vh}px, 0 0,
      ${l + r}px ${t}px,
      ${l}px ${t + r}px,
      ${l}px ${b - r}px,
      ${l + r}px ${b}px,
      ${ri - r}px ${b}px,
      ${ri}px ${b - r}px,
      ${ri}px ${t + r}px,
      ${ri - r}px ${t}px,
      ${l + r}px ${t}px
    )`;
  }
}
