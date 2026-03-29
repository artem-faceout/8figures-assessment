import { Injectable, signal } from '@angular/core';
import { Preferences } from '@capacitor/preferences';
import { STORAGE_KEYS } from '@app/core/models/onboarding.model';

@Injectable({ providedIn: 'root' })
export class DeviceService {
  private readonly _deviceId = signal<string>(crypto.randomUUID());

  readonly deviceId = this._deviceId.asReadonly();

  async init(): Promise<void> {
    try {
      const { value } = await Preferences.get({ key: STORAGE_KEYS.deviceId });
      if (value) {
        this._deviceId.set(value);
      } else {
        await Preferences.set({
          key: STORAGE_KEYS.deviceId,
          value: this._deviceId(),
        });
      }
    } catch {
      // Browser without Capacitor — ID stays in memory, that's fine
    }
  }
}
