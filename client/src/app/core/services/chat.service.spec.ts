import { TestBed } from '@angular/core/testing';
import { ChatService } from './chat.service';
import { DeviceService } from './device.service';
import type { ChatConfig } from '@app/core/models/chat.model';

describe('ChatService', () => {
  let service: ChatService;

  const config: ChatConfig = {
    mode: 'onboarding',
    persona: 'beginner',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: DeviceService,
          useValue: { deviceId: () => 'test-device-id' },
        },
      ],
    });
    service = TestBed.inject(ChatService);
  });

  it('should initialize with empty messages', () => {
    service.init(config);
    expect(service.messages().length).toBe(0);
  });

  it('should add initial greeting on init', () => {
    service.init(config);
    service.addInitialGreeting();
    const msgs = service.messages();
    expect(msgs.length).toBe(1);
    expect(msgs[0].role).toBe('assistant');
    expect(msgs[0].isStreaming).toBe(false);
  });

  it('should add user message', () => {
    service.init(config);
    service.addUserMessage('Hello');
    const msgs = service.messages();
    expect(msgs.length).toBe(1);
    expect(msgs[0].role).toBe('user');
    expect(msgs[0].content).toBe('Hello');
  });

  it('should detect [PORTFOLIO_READY] marker', () => {
    const text =
      'Here is your portfolio!\n\n[PORTFOLIO_READY]\n<portfolio_data>\n{"holdings":[],"total_value":0,"daily_change":0,"daily_change_percent":0}\n</portfolio_data>';
    const result = service.parsePortfolioReady(text);
    expect(result.hasPortfolio).toBe(true);
    expect(result.cleanContent).toBe('Here is your portfolio!');
    expect(result.portfolio).toBeDefined();
    expect(result.portfolio!.holdings).toEqual([]);
  });

  it('should return no portfolio when marker absent', () => {
    const text = 'Just a normal response';
    const result = service.parsePortfolioReady(text);
    expect(result.hasPortfolio).toBe(false);
    expect(result.cleanContent).toBe('Just a normal response');
  });

  it('should parse SSE text into events', () => {
    const sseText =
      'event: token\ndata: {"content":"Hello"}\n\nevent: token\ndata: {"content":" world"}\n\nevent: done\ndata: {}\n\n';
    const events = service.parseSSE(sseText);
    expect(events).toEqual([
      { type: 'token', data: { content: 'Hello' } },
      { type: 'token', data: { content: ' world' } },
      { type: 'done', data: {} },
    ]);
  });

  it('should build request body from current state', () => {
    service.init(config);
    service.addUserMessage('test');
    const body = service.buildRequestBody();
    expect(body.mode).toBe('onboarding');
    expect(body.persona).toBe('beginner');
    expect(body.messages.length).toBe(1);
    expect(body.portfolio).toBeDefined();
  });

  it('should track isStreaming state', () => {
    service.init(config);
    expect(service.isStreaming()).toBe(false);
  });

  it('should track isPortfolioReady state', () => {
    service.init(config);
    expect(service.isPortfolioReady()).toBe(false);
  });

  it('should track canSend computed', () => {
    service.init(config);
    expect(service.canSend()).toBe(true);
  });
});
