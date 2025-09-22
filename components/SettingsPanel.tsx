
import React from 'react';
import { Language, Difficulty } from '../types';
import { LANGUAGES, DIFFICULTIES } from '../constants';

interface SettingsPanelProps {
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
  selectedDifficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  onVoiceChange: (voice: SpeechSynthesisVoice | null) => void;
  speakingRate: number;
  onRateChange: (rate: number) => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  selectedLanguage,
  onLanguageChange,
  selectedDifficulty,
  onDifficultyChange,
  voices,
  selectedVoice,
  onVoiceChange,
  speakingRate,
  onRateChange,
}) => {
  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lang = LANGUAGES.find(l => l.code === e.target.value);
    if (lang) onLanguageChange(lang);
  };

  const handleDiffChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onDifficultyChange(e.target.value as Difficulty);
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const voice = voices.find(v => v.name === e.target.value);
    onVoiceChange(voice || null);
  };
  
  return (
    <div className="p-6 space-y-6">
      <div>
        <label htmlFor="language" className="block text-sm font-medium text-gray-600 mb-2">
          Language
        </label>
        <select
          id="language"
          value={selectedLanguage.code}
          onChange={handleLangChange}
          className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        >
          {LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code}>{lang.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="difficulty" className="block text-sm font-medium text-gray-600 mb-2">
          Difficulty
        </label>
        <select
          id="difficulty"
          value={selectedDifficulty}
          onChange={handleDiffChange}
          className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        >
          {DIFFICULTIES.map(diff => (
            <option key={diff} value={diff}>{diff}</option>
          ))}
        </select>
      </div>
       <div>
        <label htmlFor="voice" className="block text-sm font-medium text-gray-600 mb-2">
          Voice
        </label>
        <select
          id="voice"
          value={selectedVoice?.name || ''}
          onChange={handleVoiceChange}
          disabled={voices.length === 0}
          className="w-full p-3 bg-white text-gray-900 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition disabled:opacity-50"
        >
          {voices.length > 0 ? (
            voices.map(voice => (
              <option key={voice.name} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))
          ) : (
            <option value="">No voices available for this language</option>
          )}
        </select>
      </div>
      <div>
        <label htmlFor="rate" className="block text-sm font-medium text-gray-600 mb-2">
          Speaking Rate ({speakingRate.toFixed(1)})
        </label>
        <input
          type="range"
          id="rate"
          min="0.5"
          max="2"
          step="0.1"
          value={speakingRate}
          onChange={(e) => onRateChange(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>
    </div>
  );
};

export default SettingsPanel;
