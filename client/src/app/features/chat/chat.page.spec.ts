import { render, screen } from '@testing-library/angular';
import { ChatPage } from './chat.page';
import { ChatService } from '@app/core/services/chat.service';
import { PortfolioService } from '@app/core/services/portfolio.service';
import { OnboardingService } from '@app/core/services/onboarding.service';
import { DeviceService } from '@app/core/services/device.service';
import { Router } from '@angular/router';
import { ModalController } from '@ionic/angular/standalone';
import { signal } from '@angular/core';

describe('ChatPage', () => {
  const mockMessages = signal([
    {
      role: 'assistant' as const,
      content: 'Welcome!',
      timestamp: new Date(),
      isStreaming: false,
      isPortfolioReady: false,
    },
  ]);

  const mockChatService = {
    messages: mockMessages,
    isStreaming: signal(false),
    isPortfolioReady: signal(false),
    thinkingPhrase: signal(''),
    canSend: signal(true),
    init: jest.fn(),
    addInitialGreeting: jest.fn(),
    sendMessage: jest.fn(),
    cancelStream: jest.fn(),
  };

  const mockPortfolioService = {
    portfolio: signal(null),
    hasPortfolio: signal(false),
    setPortfolio: jest.fn(),
    loadFromStorage: jest.fn(),
  };

  const mockOnboardingService = {
    investmentProfile: signal('beginner' as const),
    currentStep: signal(2),
    nextStep: jest.fn(),
  };

  const mockRouter = {
    navigate: jest.fn(),
    getCurrentNavigation: () => ({
      extras: {
        state: { mode: 'onboarding', persona: 'beginner' },
      },
    }),
  };

  const providers = [
    { provide: ChatService, useValue: mockChatService },
    { provide: PortfolioService, useValue: mockPortfolioService },
    { provide: OnboardingService, useValue: mockOnboardingService },
    { provide: DeviceService, useValue: { deviceId: () => 'test' } },
    { provide: Router, useValue: mockRouter },
    { provide: ModalController, useValue: { dismiss: jest.fn() } },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render header with AI Assistant title', async () => {
    await render(ChatPage, { providers });
    expect(screen.getByText('AI Assistant')).toBeTruthy();
  });

  it('should display SYSTEM ONLINE status', async () => {
    await render(ChatPage, { providers });
    expect(screen.getByText('SYSTEM ONLINE')).toBeTruthy();
  });

  it('should display initial greeting message', async () => {
    await render(ChatPage, { providers });
    expect(screen.getByText('Welcome!')).toBeTruthy();
  });

  it('should render input field with placeholder', async () => {
    await render(ChatPage, { providers });
    const input = screen.getByPlaceholderText('Ask anything about your vault...');
    expect(input).toBeTruthy();
  });

  it('should init chat service on mount', async () => {
    await render(ChatPage, { providers });
    expect(mockChatService.init).toHaveBeenCalled();
    expect(mockChatService.addInitialGreeting).toHaveBeenCalled();
  });
});
