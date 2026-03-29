import { TestBed } from '@angular/core/testing';
import { DeviceService } from './device.service';

const mockGet = jest.fn();
const mockSet = jest.fn();

jest.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: (...args: unknown[]) => mockGet(...args),
    set: (...args: unknown[]) => mockSet(...args),
  },
}));

describe('DeviceService', () => {
  let service: DeviceService;

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({});
    service = TestBed.inject(DeviceService);
  });

  it('should generate a UUID v4 format device ID', () => {
    const id = service.deviceId();
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    );
  });

  it('should return the same ID on subsequent calls', () => {
    const id1 = service.deviceId();
    const id2 = service.deviceId();
    expect(id1).toBe(id2);
  });

  it('should load persisted ID on init', async () => {
    const persistedId = 'aaaaaaaa-bbbb-4ccc-9ddd-eeeeeeeeeeee';
    mockGet.mockResolvedValue({ value: persistedId });

    await service.init();

    expect(service.deviceId()).toBe(persistedId);
  });

  it('should persist new ID to Capacitor Preferences', async () => {
    mockGet.mockResolvedValue({ value: null });

    await service.init();

    expect(mockSet).toHaveBeenCalledWith({
      key: '8f_device_id',
      value: service.deviceId(),
    });
  });
});
