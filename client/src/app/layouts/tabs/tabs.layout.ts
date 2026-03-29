import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { pieChart, chatbubbleEllipses } from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  standalone: true,
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
  templateUrl: './tabs.layout.html',
  styleUrl: './tabs.layout.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsLayout {
  constructor() {
    addIcons({ pieChart, chatbubbleEllipses });
  }
}
