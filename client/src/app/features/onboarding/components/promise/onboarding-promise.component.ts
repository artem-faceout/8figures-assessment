import { ChangeDetectionStrategy, Component, output } from '@angular/core';

@Component({
  selector: 'app-onboarding-promise',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './onboarding-promise.component.html',
  styleUrl: './onboarding-promise.component.scss',
})
export class OnboardingPromiseComponent {
  readonly continue = output<void>();

  onContinue(): void {
    this.continue.emit();
  }
}
