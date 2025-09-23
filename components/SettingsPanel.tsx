import React, { useState } from 'react';
import { Language, Difficulty, ConversationPartner } from '../types';
import { LANGUAGES, DIFFICULTIES, CONVERSATION_PARTNERS, TOPICS } from '../constants';

interface SettingsPanelProps {
  selectedLanguage: Language;
  onLanguageChange: (language: Language) => void;
  selectedDifficulty: Difficulty;
  onDifficultyChange: (difficulty: Difficulty) => void;
  onConfirmDifficulty: () => void;
  selectedPartner: ConversationPartner;
  onPartnerChange: (partner: ConversationPartner) => void;
  voices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
  onVoiceChange: (voice: SpeechSynthesisVoice | null) => void;
  speakingRate: number;
  onRateChange: (rate: number) => void;
  selectedTopic: string | null;
  onTopicSelect: (topic: string) => void;
  isAiSpeaking: boolean;
  chatFlowState: 'CONFIG_PARTNER' | 'CONFIG_LANGUAGE' | 'CONFIG_DIFFICULTY' | 'CONFIG_TOPIC' | 'CHATTING';
  onResetConversation: () => void;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  selectedLanguage,
  onLanguageChange,
  selectedDifficulty,
  onDifficultyChange,
  onConfirmDifficulty,
  selectedPartner,
  onPartnerChange,
  voices,
  selectedVoice,
  onVoiceChange,
  speakingRate,
  onRateChange,
  selectedTopic,
  onTopicSelect,
  isAiSpeaking,
  chatFlowState,
  onResetConversation,
}) => {
  const [isVoiceSettingsOpen, setIsVoiceSettingsOpen] = useState(false);

  const handleDiffChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onDifficultyChange(e.target.value as Difficulty);
  };

  const handleVoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const voice = voices.find(v => v.name === e.target.value);
    onVoiceChange(voice || null);
  };
  
  const renderStep = (title: string, children: React.ReactNode) => (
    <div className="animate-fade-in">
      <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4 text-center">{title}</h3>
      {children}
    </div>
  );

  const steps = ['Partner', 'Language', 'Difficulty', 'Topic'];
  const stepConfig: { [key in SettingsPanelProps['chatFlowState']]?: number } = {
    CONFIG_PARTNER: 0,
    CONFIG_LANGUAGE: 1,
    CONFIG_DIFFICULTY: 2,
    CONFIG_TOPIC: 3,
  };
  const currentStepIndex = stepConfig[chatFlowState];

  const ProgressBar = () => {
    if (typeof currentStepIndex === 'undefined') return null;

    return (
      <div className="mb-8">
        <div className="flex items-start">
          {steps.map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center text-center w-20">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors duration-300 ${
                    index <= currentStepIndex
                      ? 'bg-sky-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {index < currentStepIndex ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                <p
                  className={`text-xs mt-2 font-medium transition-colors duration-300 ${
                    index <= currentStepIndex ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {step}
                </p>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`flex-1 h-1 mt-3.5 transition-colors duration-500 ${
                    index < currentStepIndex ? 'bg-sky-500' : 'bg-slate-200 dark:bg-slate-700'
                  }`}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };


  const renderContent = () => {
    switch (chatFlowState) {
      case 'CONFIG_PARTNER':
        return renderStep('Step 1: Choose your Partner', (
          <div className="grid grid-cols-1 gap-2">
            {CONVERSATION_PARTNERS.map(partner => (
              <button
                key={partner}
                onClick={() => onPartnerChange(partner)}
                className={`p-3 text-center text-sm rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 ${
                  selectedPartner === partner
                    ? 'bg-sky-500 text-white border-sky-500 shadow'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                }`}
              >
                {partner}
              </button>
            ))}
          </div>
        ));
      case 'CONFIG_LANGUAGE':
        return renderStep('Step 2: Choose your Language', (
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
        ));
      case 'CONFIG_DIFFICULTY':
        return renderStep('Step 3: Choose Difficulty', (
           <div className="space-y-4">
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
            <button
              onClick={onConfirmDifficulty}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-sky-500"
            >
              <span>Confirm</span>
            </button>
           </div>
        ));
      case 'CONFIG_TOPIC':
        return renderStep('Step 4: Choose a Topic', (
          <div className="flex flex-wrap gap-2 justify-center">
            {TOPICS.map(topic => (
              <button
                key={topic}
                onClick={() => onTopicSelect(topic)}
                className={`px-3 py-1.5 text-sm rounded-full border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 ${
                  selectedTopic === topic
                    ? 'bg-sky-500 text-white border-sky-500'
                    : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                }`}
              >
                {topic}
              </button>
            ))}
          </div>
        ));
      case 'CHATTING':
        return (
          <div className="space-y-6">
            <button
              onClick={onResetConversation}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg bg-sky-500 text-white font-semibold hover:bg-sky-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-800 focus:ring-sky-500"
            >
             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              <span>Start New Chat</span>
            </button>
             <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <button
                onClick={() => setIsVoiceSettingsOpen(!isVoiceSettingsOpen)}
                className="flex justify-between items-center w-full text-left font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 focus:outline-none"
              >
                <span>Advanced Voice Settings</span>
                <svg
                  className={`w-5 h-5 transition-transform duration-200 ${isVoiceSettingsOpen ? 'transform rotate-180' : ''}`}
                  fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              {isVoiceSettingsOpen && (
                <div className={`mt-4 space-y-4 transition-opacity ${isAiSpeaking ? 'opacity-50' : ''}`}>
                  <fieldset disabled={isAiSpeaking}>
                    <div>
                      <label htmlFor="voice" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Voice</label>
                      <select id="voice" value={selectedVoice?.name || ''} onChange={handleVoiceChange} disabled={voices.length === 0}
                        className="w-full p-3 bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {voices.length > 0 ? voices.map(voice => (
                          <option key={voice.name} value={voice.name}>{voice.name}</option>
                        )) : <option value="">No voices available</option>}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="rate" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Speaking Rate ({speakingRate.toFixed(1)})</label>
                      <input type="range" id="rate" min="0.5" max="2" step="0.1" value={speakingRate} onChange={(e) => onRateChange(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-sky-500 disabled:cursor-not-allowed"
                      />
                    </div>
                  </fieldset>
                </div>
              )}
            </div>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className="p-6">
       {chatFlowState !== 'CHATTING' && <ProgressBar />}
       {renderContent()}
    </div>
  );
};

export default SettingsPanel;