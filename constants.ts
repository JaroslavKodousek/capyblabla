
import { Language, Difficulty, ConversationPartner } from './types';

export const LANGUAGES: Language[] = [
  { code: 'en-US', name: 'English (US)', flag: '🇺🇸' },
  { code: 'de-DE', name: 'German', flag: '🇩🇪' },
  { code: 'cs-CZ', name: 'Czech', flag: '🇨🇿' },
  { code: 'pl-PL', name: 'Polish', flag: '🇵🇱' },
];

export const DIFFICULTIES: Difficulty[] = [
  Difficulty.Beginner,
  Difficulty.Intermediate,
  Difficulty.Advanced,
];

export const CONVERSATION_PARTNERS: ConversationPartner[] = [
  ConversationPartner.Friend,
  ConversationPartner.Teacher,
  ConversationPartner.Colleague,
];

export const TOPICS: string[] = [
  'Small Talk',
  'Travel',
  'Technology',
  'Food',
  'History',
  'Business',
  'AI',
  'Geocaching',
  'Politics',
  'Crypto',
];