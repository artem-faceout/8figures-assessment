import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-ambient-glow',
  standalone: true,
  template: `
    <div
      [class.glow-animate]="animate()"
      [style.width.px]="size()"
      [style.height.px]="size()"
      [style.background]="color()"
      [style.--glow-opacity]="opacity()"
      [style.opacity]="opacity()"
      [style.filter]="blurStyle()"
      [style.top]="top()"
      [style.left]="left()"
      [style.right]="right()"
      [style.bottom]="bottom()"
      [style.border-radius]="'9999px'"
      [style.position]="'absolute'"
    ></div>
  `,
  styleUrl: './ambient-glow.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AmbientGlowComponent {
  size = input(320);
  color = input('var(--color-accent)');
  opacity = input(0.1);
  blur = input(32);
  top = input<string | null>(null);
  left = input<string | null>(null);
  right = input<string | null>(null);
  bottom = input<string | null>(null);
  animate = input(true);

  blurStyle = computed(() => `blur(${this.blur()}px)`);
}
