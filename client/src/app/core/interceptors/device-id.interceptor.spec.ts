import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { deviceIdInterceptor } from './device-id.interceptor';
import { DeviceService } from '@app/core/services/device.service';

describe('deviceIdInterceptor', () => {
  let httpClient: HttpClient;
  let httpTesting: HttpTestingController;
  const mockDeviceId = 'test-device-id-1234';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([deviceIdInterceptor])),
        provideHttpClientTesting(),
        {
          provide: DeviceService,
          useValue: { deviceId: () => mockDeviceId },
        },
      ],
    });

    httpClient = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should add X-Device-ID header to API requests', () => {
    httpClient.get('/api/v1/portfolio').subscribe();

    const req = httpTesting.expectOne('/api/v1/portfolio');
    expect(req.request.headers.get('X-Device-ID')).toBe(mockDeviceId);
    req.flush({});
  });

  it('should not add header to non-API requests', () => {
    httpClient.get('/assets/image.png').subscribe();

    const req = httpTesting.expectOne('/assets/image.png');
    expect(req.request.headers.has('X-Device-ID')).toBe(false);
    req.flush({});
  });
});
