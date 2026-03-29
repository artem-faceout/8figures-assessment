import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { DeviceService } from '@app/core/services/device.service';

export const deviceIdInterceptor: HttpInterceptorFn = (req, next) => {
  if (!req.url.includes('/api/')) {
    return next(req);
  }

  const deviceService = inject(DeviceService);
  const cloned = req.clone({
    setHeaders: { 'X-Device-ID': deviceService.deviceId() },
  });

  return next(cloned);
};
