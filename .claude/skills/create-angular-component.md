# Skill: Create Angular Component

## When to use
When creating any new Angular component for the app.

## Steps
1. Determine if this is a feature component (in `features/`) or shared component (in `shared/components/`)
2. Generate with: `ng generate component <path> --standalone`
3. Always use standalone components (no NgModules)
4. Use `inject()` for dependency injection, not constructor
5. Use Signals for local state
6. Use Ionic components for all UI elements
7. Create corresponding `.model.ts` if component needs custom types
8. Add route in `app.routes.ts` if it's a page-level component

## Template
```typescript
import { Component, inject, signal } from '@angular/core';
import { IonHeader, IonContent, IonTitle, /* ... */ } from '@ionic/angular/standalone';

@Component({
  selector: 'app-feature-name',
  standalone: true,
  imports: [IonHeader, IonContent, IonTitle],
  templateUrl: './feature-name.component.html',
  styleUrls: ['./feature-name.component.scss']
})
export class FeatureNameComponent {
  private readonly someService = inject(SomeService);

  someState = signal<SomeType | null>(null);
}
```

## Checklist after creation

- [ ] No `any` types
- [ ] Ionic components used (not raw HTML)
- [ ] Component is standalone
- [ ] Uses `inject()` not constructor DI
- [ ] Mobile-friendly touch targets (44x44pt minimum)
