import type { ChatMode } from '@app/core/models/chat.model';

const ONBOARDING_PHRASES = [
  'Getting to know your portfolio...',
  'Setting things up...',
  'Mapping out your investments...',
  'Putting the pieces together...',
  'Building your profile...',
];

const COMMON_PHRASES = [
  'Analyzing your portfolio...',
  'Crunching the numbers...',
  'Reviewing your holdings...',
  'Digging into the data...',
  'Checking the details...',
];

const ASSET_PHRASES = [
  'Looking into {TICKER}...',
  'Pulling up {TICKER} details...',
  'Researching {TICKER}...',
  'Analyzing {TICKER} performance...',
];

const PHRASES: Record<ChatMode, string[]> = {
  onboarding: ONBOARDING_PHRASES,
  common: COMMON_PHRASES,
  asset: ASSET_PHRASES,
};

export function getRandomThinkingPhrase(mode: ChatMode, ticker?: string): string {
  const pool = PHRASES[mode];
  const phrase = pool[Math.floor(Math.random() * pool.length)];
  return ticker ? phrase.replace('{TICKER}', ticker) : phrase;
}
