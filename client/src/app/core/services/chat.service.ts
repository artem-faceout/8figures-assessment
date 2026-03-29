import { Injectable, inject, signal, computed, NgZone } from '@angular/core';
import { environment } from '@env/environment';
import { PortfolioService } from './portfolio.service';
import { DeviceService } from './device.service';
import { getInitialGreeting } from '@app/features/chat/constants/initial-greetings';
import { getRandomThinkingPhrase } from '@app/features/chat/constants/thinking-phrases';
import type {
  ChatConfig,
  ChatMessage,
  ApiChatRequest,
  ApiChatMessage,
  ApiPortfolio,
} from '@app/core/models/chat.model';

interface SSEEvent {
  type: string;
  data: Record<string, unknown>;
}

interface PortfolioParseResult {
  hasPortfolio: boolean;
  cleanContent: string;
  portfolio?: ApiPortfolio;
}

const EMPTY_PORTFOLIO: ApiPortfolio = {
  holdings: [],
  total_value: 0,
  daily_change: 0,
  daily_change_percent: 0,
};

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly portfolioService = inject(PortfolioService);
  private readonly deviceService = inject(DeviceService);
  private readonly ngZone = inject(NgZone);

  private readonly _messages = signal<ChatMessage[]>([]);
  private readonly _isStreaming = signal(false);
  private readonly _isPortfolioReady = signal(false);
  private readonly _thinkingPhrase = signal('');
  private config: ChatConfig | null = null;
  private abortController: AbortController | null = null;
  private fullStreamContent = '';

  readonly messages = this._messages.asReadonly();
  readonly isStreaming = this._isStreaming.asReadonly();
  readonly isPortfolioReady = this._isPortfolioReady.asReadonly();
  readonly thinkingPhrase = this._thinkingPhrase.asReadonly();
  readonly canSend = computed(() => !this._isStreaming() && !this._isPortfolioReady());

  init(config: ChatConfig): void {
    this.config = config;
    this._messages.set([]);
    this._isStreaming.set(false);
    this._isPortfolioReady.set(false);
    this._thinkingPhrase.set('');
  }

  addInitialGreeting(): void {
    if (!this.config) return;
    const content = getInitialGreeting(
      this.config.mode,
      this.config.persona,
      this.config.asset?.ticker
    );
    this._messages.update(msgs => [
      ...msgs,
      {
        role: 'assistant',
        content,
        timestamp: new Date(),
        isStreaming: false,
        isPortfolioReady: false,
      },
    ]);
  }

  addUserMessage(content: string): void {
    this._messages.update(msgs => [
      ...msgs,
      {
        role: 'user',
        content,
        timestamp: new Date(),
        isStreaming: false,
        isPortfolioReady: false,
      },
    ]);
  }

  async sendMessage(content: string): Promise<void> {
    if (!this.config || this._isStreaming() || this._isPortfolioReady()) return;

    this.addUserMessage(content);
    this._isStreaming.set(true);
    this._thinkingPhrase.set(
      getRandomThinkingPhrase(this.config.mode, this.config.asset?.ticker)
    );

    this.fullStreamContent = '';

    // Add placeholder assistant message
    this._messages.update(msgs => [
      ...msgs,
      {
        role: 'assistant',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
        isPortfolioReady: false,
      },
    ]);

    const body = this.buildRequestBody();
    this.abortController = new AbortController();

    try {
      const response = await fetch(`${environment.apiUrl}/api/v1/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-ID': this.deviceService.deviceId(),
        },
        body: JSON.stringify(body),
        signal: this.abortController.signal,
      });

      if (!response.ok || !response.body) {
        throw new Error(`HTTP ${response.status}`);
      }

      await this.processStream(response.body);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        this.updateLastAssistantMessage(
          'Sorry, something went wrong. Please try again.',
          false
        );
      }
    } finally {
      this._isStreaming.set(false);
      this._thinkingPhrase.set('');
      this.abortController = null;
    }
  }

  cancelStream(): void {
    this.abortController?.abort();
  }

  buildRequestBody(): ApiChatRequest {
    const messages: ApiChatMessage[] = this._messages()
      .map(m => ({ role: m.role, content: m.content }))
      .filter(m => m.content.length > 0);

    const portfolio = this.portfolioService.portfolio() ?? EMPTY_PORTFOLIO;

    return {
      mode: this.config!.mode,
      persona: this.config!.persona,
      messages,
      portfolio,
      asset: this.config!.asset ?? null,
    };
  }

  parseSSE(text: string): SSEEvent[] {
    const events: SSEEvent[] = [];
    const blocks = text.split('\n\n').filter(b => b.trim());

    for (const block of blocks) {
      const lines = block.split('\n');
      let type = '';
      let data = '';

      for (const line of lines) {
        if (line.startsWith('event: ')) {
          type = line.slice(7);
        } else if (line.startsWith('data: ')) {
          data = line.slice(6);
        }
      }

      if (type && data) {
        try {
          events.push({ type, data: JSON.parse(data) as Record<string, unknown> });
        } catch {
          // Skip malformed events
        }
      }
    }

    return events;
  }

  parsePortfolioReady(text: string): PortfolioParseResult {
    const markerIndex = text.indexOf('[PORTFOLIO_READY]');
    if (markerIndex === -1) {
      return { hasPortfolio: false, cleanContent: text };
    }

    const cleanContent = text.substring(0, markerIndex).trim();
    const dataMatch = text.match(/<portfolio_data>\s*([\s\S]*?)\s*<\/portfolio_data>/);

    if (dataMatch) {
      try {
        const portfolio = JSON.parse(dataMatch[1]) as ApiPortfolio;
        return { hasPortfolio: true, cleanContent, portfolio };
      } catch {
        return { hasPortfolio: true, cleanContent };
      }
    }

    return { hasPortfolio: true, cleanContent };
  }

  private async processStream(body: ReadableStream<Uint8Array>): Promise<void> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let tokenBuffer = '';
    let rafPending = false;

    const flushTokens = (): void => {
      if (!tokenBuffer) return;
      const tokens = tokenBuffer;
      tokenBuffer = '';
      rafPending = false;

      this.ngZone.run(() => {
        this._thinkingPhrase.set('');
        this.appendToLastAssistantMessage(tokens);
      });
    };

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = this.parseSSE(buffer);

        // Keep any incomplete event at the end of buffer
        const lastDoubleNewline = buffer.lastIndexOf('\n\n');
        if (lastDoubleNewline !== -1) {
          buffer = buffer.substring(lastDoubleNewline + 2);
        }

        for (const event of events) {
          if (event.type === 'token') {
            tokenBuffer += (event.data as { content: string }).content;
            if (!rafPending) {
              rafPending = true;
              requestAnimationFrame(flushTokens);
            }
          } else if (event.type === 'done') {
            flushTokens();
            this.finalizeAssistantMessage();
          } else if (event.type === 'error') {
            flushTokens();
            const errorMsg = (event.data as { message: string }).message;
            this.updateLastAssistantMessage(`Error: ${errorMsg}`, false);
          }
        }
      }

      // Flush remaining tokens
      if (tokenBuffer) {
        flushTokens();
      }
    } finally {
      reader.releaseLock();
    }
  }

  private appendToLastAssistantMessage(text: string): void {
    this.fullStreamContent += text;

    // Only show content before [PORTFOLIO_READY] marker
    const markerIndex = this.fullStreamContent.indexOf('[PORTFOLIO_READY]');
    const displayContent = markerIndex !== -1
      ? this.fullStreamContent.substring(0, markerIndex).trim()
      : this.fullStreamContent;

    this._messages.update(msgs => {
      const updated = [...msgs];
      const last = updated[updated.length - 1];
      if (last?.role === 'assistant') {
        updated[updated.length - 1] = { ...last, content: displayContent };
      }
      return updated;
    });
  }

  private updateLastAssistantMessage(content: string, isStreaming: boolean): void {
    this._messages.update(msgs => {
      const updated = [...msgs];
      const last = updated[updated.length - 1];
      if (last?.role === 'assistant') {
        updated[updated.length - 1] = { ...last, content, isStreaming };
      }
      return updated;
    });
  }

  private finalizeAssistantMessage(): void {
    const msgs = this._messages();
    const last = msgs[msgs.length - 1];
    if (!last || last.role !== 'assistant') return;

    // Parse from full accumulated content (includes marker + JSON that was hidden from display)
    const parseResult = this.parsePortfolioReady(this.fullStreamContent || last.content);

    if (parseResult.hasPortfolio && parseResult.portfolio) {
      this.portfolioService.setPortfolio(parseResult.portfolio);
      this._isPortfolioReady.set(true);

      this.savePortfolioToServer(parseResult.portfolio);

      this._messages.update(allMsgs => {
        const updated = [...allMsgs];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: parseResult.cleanContent,
          isStreaming: false,
          isPortfolioReady: true,
        };
        return updated;
      });
    } else {
      this._messages.update(allMsgs => {
        const updated = [...allMsgs];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          isStreaming: false,
        };
        return updated;
      });
    }
  }

  private async savePortfolioToServer(portfolio: ApiPortfolio): Promise<void> {
    try {
      await fetch(`${environment.apiUrl}/api/v1/portfolio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Device-ID': this.deviceService.deviceId(),
        },
        body: JSON.stringify(portfolio),
      });
    } catch {
      // Server save failed — local cache is the fallback
    }
  }
}
