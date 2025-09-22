
import { Language, Difficulty } from './types';

export const LANGUAGES: Language[] = [
  { code: 'en-US', name: 'English (US)' },
  { code: 'es-ES', name: 'Spanish' },
  { code: 'fr-FR', name: 'French' },
  { code: 'de-DE', name: 'German' },
  { code: 'it-IT', name: 'Italian' },
  { code: 'ja-JP', name: 'Japanese' },
];

export const DIFFICULTIES: Difficulty[] = [
  Difficulty.Beginner,
  Difficulty.Intermediate,
  Difficulty.Advanced,
];

export const CONVERSATION_STARTERS: string[] = [
  'What did you do last weekend?',
  'Tell me about your favorite hobby.',
  'What is the best movie you have seen recently?',
  'If you could travel anywhere, where would you go?',
  'What are your plans for tomorrow?',
  'Describe your dream job.',
];
