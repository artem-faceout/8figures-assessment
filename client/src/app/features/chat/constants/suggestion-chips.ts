import type { ChatMode, Persona, SuggestionChip } from '@app/core/models/chat.model';

const CHIPS: Record<string, SuggestionChip[]> = {
  onboarding_beginner: [
    { label: 'I own some stocks' },
    { label: 'I have crypto' },
    { label: 'Help me get started' },
    { label: 'What should I invest in?' },
  ],
  onboarding_experienced: [
    { label: 'Here are my holdings' },
    { label: 'Import from spreadsheet' },
    { label: 'I hold ETFs and stocks' },
  ],
  common: [
    { label: 'Portfolio health check' },
    { label: 'Risk analysis' },
    { label: 'Top performers' },
    { label: 'Diversification report' },
  ],
  asset: [
    { label: 'Recent performance' },
    { label: 'Compare to sector' },
    { label: "What's the outlook?" },
    { label: 'Position sizing' },
  ],
};

export function getSuggestionChips(mode: ChatMode, persona: Persona): SuggestionChip[] {
  if (mode === 'onboarding') {
    return CHIPS[`onboarding_${persona}`];
  }
  return CHIPS[mode];
}
