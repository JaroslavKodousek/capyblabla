import React, { useState } from 'react';
import { Language, Difficulty, ConversationPartner } from '../types';
import { LANGUAGES, DIFFICULTIES, CONVERSATION_PARTNERS, TOPICS } from '../constants';

interface SettingsPanelProps {
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
  selectedDifficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  selectedPartner: ConversationPartner;
  onPartnerChange: (partner: ConversationPartner) => void;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  onVoiceChange: (voice: SpeechSynthesisVoice | null) => void;
  speakingRate: number;
  onRateChange: (rate: number) => void;
  selectedTopic: string | null;
  onTopicSelect: (topic: string) => void;
  isSessionActive: boolean;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  selectedLanguage,
  onLanguageChange,
  selectedDifficulty,
  onDifficultyChange,
  selectedPartner,
  onPartnerChange,
  voices,
  selectedVoice,
  onVoiceChange,
  speakingRate,
  onRateChange,
  selectedTopic,
  onTopicSelect,
  isSessionActive
}) => {
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);

  const handleDiffChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onDifficultyChange(e.target.value as Difficulty);
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const voice = voices.find(v => v.name === e.target.value);
    onVoiceChange(voice || null);
  };

  return (
    <div className="p-6 space-y-6 text-slate-800 dark:text-slate-200">
      <div>
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
          Partner
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          {CONVERSATION_PARTNERS.map(partner => (
            <button
              key={partner}
              onClick={() => onPartnerChange(partner)}
              className={`p-2 text-center text-sm rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 ${
                selectedPartner === partner
                  ? 'bg-sky-500 text-white border-sky-500 shadow'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
              }`}
            >
              {partner}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
          Language
        </label>
        <div className="grid grid-cols-3 gap-2">
          {LANGUAGES.map(lang => (
            <button
              key={lang.code}
              onClick={() => onLanguageChange(lang)}
              className={`p-3 text-center rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 flex flex-col items-center justify-center h-24 ${
                selectedLanguage.code === lang.code
                  ? 'bg-sky-500 text-white border-sky-500 shadow'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
              }`}
            >
              <span className="text-4xl">{lang.flag}</span>
              <span className="text-xs mt-1 font-medium">{lang.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

       <div>
        <label htmlFor="difficulty" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
          Difficulty
        </label>
        <select
          id="difficulty"
          value={selectedDifficulty}
          onChange={handleDiffChange}
          className="w-full p-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
        >
          {DIFFICULTIES.map(diff => (
            <option key={diff} value={diff}>{diff}</option>
          ))}
        </select>
      </div>

       <div className={isSessionActive ? 'opacity-50' : ''}>
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
          Conversation Topic
        </label>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map(topic => (
            <button
              key={topic}
              onClick={() => onTopicSelect(topic)}
              disabled={isSessionActive}
              className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:cursor-not-allowed ${
                selectedTopic === topic
                  ? 'bg-sky-500 text-white border-sky-500'
                  : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
        <button
          onClick={() => setIsVoiceSettingsOpen(!isVoiceSettingsOpen)}
          className="flex justify-between items-center w-full text-left font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 focus:outline-none"
        >
          <span>Advanced Voice Settings</span>
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${isVoiceSettingsOpen ? 'transform rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </button>
        {isVoiceSettingsOpen && (
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="voice" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                Voice
              </label>
              <select
                id="voice"
                value={selectedVoice?.name || ''}
                onChange={handleVoiceChange}
                disabled={voices.length === 0}
                className="w-full p-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition disabled:opacity-50"
              >
                {voices.length > 0 ? (
                  voices.map(voice => (
                    <option key={voice.name} value={voice.name}>
                      {voice.name}
                    </option>
                  ))
                ) : (
                  <option value="">No voices available</option>
                )}
              </select>
            </div>
            <div>
              <label htmlFor="rate" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
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
                className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-sky-500"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;