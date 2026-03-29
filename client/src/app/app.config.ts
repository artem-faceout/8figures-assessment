import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app.routes';
import { deviceIdInterceptor } from '@app/core/interceptors/device-id.interceptor';
import { DeviceService } from '@app/core/services/device.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideAnimations(),
    provideIonicAngular(),
    provideHttpClient(withInterceptors([deviceIdInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: (deviceService: DeviceService) => () => deviceService.init(),
      deps: [DeviceService],
      multi: true,
    },
  ],
};
