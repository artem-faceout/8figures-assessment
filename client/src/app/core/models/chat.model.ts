import type { components } from './api.generated';

// Re-export server types for convenience
export type ApiChatMessage = components['schemas']['ChatMessage'];
export type ApiChatRequest = components['schemas']['ChatRequest'];
export type ApiPortfolio = components['schemas']['Portfolio'];
export type ApiHolding = components['schemas']['Holding'];
export type ApiAssetContext = components['schemas']['AssetContext'];

export type ChatMode = 'onboarding' | 'common' | 'asset';
export type Persona = 'beginner' | 'experienced';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming: boolean;
  isPortfolioReady: boolean;
}

export interface ChatConfig {
  mode: ChatMode;
  persona: Persona;
  asset?: { ticker: string; name: string };
}

export interface SuggestionChip {
  label: string;
}

export interface ThinkingPhrase {
  text: string;
}
