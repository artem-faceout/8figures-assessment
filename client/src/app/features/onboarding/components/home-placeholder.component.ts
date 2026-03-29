import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home-placeholder',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar],
  template: `
    <ion-header>
      <ion-toolbar>
        <ion-title>8Figures</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content class="ion-padding">
      <div class="placeholder">
        <p class="emoji">&#x1F680;</p>
        <h2>Welcome to 8Figures</h2>
        <p class="subtitle">AI Chat coming soon — this is a placeholder after onboarding.</p>
      </div>
    </ion-content>
  `,
  styles: [`
    .placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      text-align: center;
    }
    .emoji { font-size: 4rem; margin: 0; }
    h2 {
      font-family: var(--font-heading);
      font-weight: 700;
      color: var(--color-text-white);
      margin: 1rem 0 0.5rem;
    }
    .subtitle {
      color: var(--color-text-secondary);
      font-size: 0.875rem;
    }
  `],
})
export class HomePlaceholderComponent {}
