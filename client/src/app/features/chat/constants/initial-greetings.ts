import type { ChatMode, Persona } from '@app/core/models/chat.model';

type GreetingKey = `${ChatMode}_${Persona}`;

const GREETINGS: Record<GreetingKey, string> = {
  onboarding_beginner:
    "Welcome! Tell me what you're interested in \u2014 stocks, crypto, ETFs \u2014 and I'll help you get started. Even 'I have no idea' is a perfect place to begin.",
  onboarding_experienced:
    "Welcome! Tell me what you're holding \u2014 stocks, ETFs, crypto \u2014 and I'll set up your dashboard. You can be as detailed as you want. Try something like: 'I have 50 shares of AAPL, some VOO, and about $10K in Bitcoin.'",
  common_beginner:
    'Hey! What would you like to know about your portfolio?',
  common_experienced:
    'What would you like to analyze about your portfolio?',
  asset_beginner:
    'What would you like to know about your {TICKER} position?',
  asset_experienced:
    'What would you like to analyze about {TICKER}?',
};

export function getInitialGreeting(mode: ChatMode, persona: Persona, ticker?: string): string {
  const key: GreetingKey = `${mode}_${persona}`;
  const greeting = GREETINGS[key];
  return ticker ? greeting.replace('{TICKER}', ticker) : greeting;
}
