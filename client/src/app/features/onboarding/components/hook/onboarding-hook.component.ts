import { ChangeDetectionStrategy, Component, output } from '@angular/core';
import { AmbientGlowComponent } from '@app/shared/components/ambient-glow/ambient-glow.component';

@Component({
  selector: 'app-onboarding-hook',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AmbientGlowComponent],
  templateUrl: './onboarding-hook.component.html',
  styleUrl: './onboarding-hook.component.scss',
})
export class OnboardingHookComponent {
  readonly continue = output<void>();

  onContinue(): void {
    this.continue.emit();
  }
}
