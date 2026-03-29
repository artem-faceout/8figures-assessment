import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-page-indicator',
  standalone: true,
  templateUrl: './page-indicator.component.html',
  styleUrl: './page-indicator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageIndicatorComponent {
  totalSteps = input.required<number>();
  currentStep = input.required<number>();

  steps = computed(() => Array.from({ length: this.totalSteps() }, (_, i) => i));
}
