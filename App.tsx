import React, { useState, useEffect, useMemo } from 'react';
import SettingsPanel from './components/SettingsPanel';
import ChatInterface from './components/ChatInterface';
import { Message, Sender, Language, Difficulty, ConversationPartner } from './types';
import { LANGUAGES, DIFFICULTIES, CONVERSATION_PARTNERS } from './constants';
import * as geminiService from './services/geminiService';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import CapybaraLogo from './components/CapybaraLogo';
import ThemeSwitcher from './components/ThemeSwitcher';
import IconButton from './components/IconButton';

type ChatFlowState = 'CONFIG_PARTNER' | 'CONFIG_LANGUAGE' | 'CONFIG_DIFFICULTY' | 'CONFIG_TOPIC' | 'CHATTING';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(LANGUAGES[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(Difficulty.Advanced);
  const [selectedPartner, setSelectedPartner] = useState<ConversationPartner>(CONVERSATION_PARTNERS[0]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [speakingRate, setSpeakingRate] = useState(1.2);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const [chatFlowState, setChatFlowState] = useState<ChatFlowState>('CONFIG_PARTNER');

  const { speak, voices, speaking, cancel } = useSpeechSynthesis();

  const languageVoices = useMemo(() => 
    voices.filter(v => v.lang.startsWith(selectedLanguage.code)), 
    [voices, selectedLanguage.code]
  );

  useEffect(() => {
    if (languageVoices.length > 0) {
      const preferredVoice = languageVoices.find(v => v.default) || languageVoices[0];
      setSelectedVoice(preferredVoice);
    } else {
      setSelectedVoice(null);
    }
  }, [languageVoices]);

  const handleResetConversation = () => {
    setMessages([]);
    setSelectedTopic(null);
    cancel(); // Stop any ongoing speech
    setChatFlowState('CONFIG_PARTNER');
  };

  const handlePartnerChange = (partner: ConversationPartner) => {
    setSelectedPartner(partner);
    setChatFlowState('CONFIG_LANGUAGE');
  };
  
  const handleLanguageChange = (language: Language) => {
    setSelectedLanguage(language);
    setChatFlowState('CONFIG_DIFFICULTY');
  };

  const handleDifficultyChange = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
  };
  
  const handleConfirmDifficulty = () => {
    setChatFlowState('CONFIG_TOPIC');
  };
  
  const handleGoBack = () => {
    if (chatFlowState === 'CONFIG_LANGUAGE') {
      setChatFlowState('CONFIG_PARTNER');
    } else if (chatFlowState === 'CONFIG_DIFFICULTY') {
      setChatFlowState('CONFIG_LANGUAGE');
    } else if (chatFlowState === 'CONFIG_TOPIC') {
      setChatFlowState('CONFIG_DIFFICULTY');
    }
  };

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic);
  };

  const handleStartConversation = async () => {
    if (!selectedTopic) return;

    setMessages([]); // Ensure chat is clear
    // Do not close sidebar on mobile by default, user can choose to
    // setIsSidebarOpen(false); 

    // Switch to chat view immediately and show loading state
    setChatFlowState('CHATTING');
    setIsAiTyping(true);

    cancel(); // Stop any previous speech before starting new one

    try {
      const { reply, feedback } = await geminiService.sendMessageToAI(
        [],
        selectedLanguage,
        selectedDifficulty,
        selectedPartner,
        selectedTopic
      );
      const aiMessage: Message = { id: Date.now().toString(), text: reply, sender: Sender.AI, feedback };
      setMessages([aiMessage]);
      speak(reply, selectedLanguage.code, selectedVoice, speakingRate);
    } catch (error) {
      console.error("Failed to start new session:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I couldn't start our conversation. Please try a different topic or try again.",
        sender: Sender.AI
      };
      setMessages([errorMessage]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), text, sender: Sender.User };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsAiTyping(true);

    try {
      const { reply, feedback } = await geminiService.sendMessageToAI(updatedMessages, selectedLanguage, selectedDifficulty, selectedPartner, selectedTopic);
      const aiMessage: Message = { id: (Date.now() + 1).toString(), text: reply, sender: Sender.AI, feedback };
      setMessages(prev => [...prev, aiMessage]);
      speak(reply, selectedLanguage.code, selectedVoice, speakingRate);
    } catch (error) {
      console.error(error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, an error occurred. Please try again.",
        sender: Sender.AI
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const settingsPanelProps = {
    selectedLanguage,
    onLanguageChange: handleLanguageChange,
    selectedDifficulty,
    onDifficultyChange: handleDifficultyChange,
    onConfirmDifficulty: handleConfirmDifficulty,
    selectedPartner,
    onPartnerChange: handlePartnerChange,
    voices: languageVoices,
    selectedVoice,
    onVoiceChange: setSelectedVoice,
    speakingRate,
    onRateChange: setSpeakingRate,
    selectedTopic,
    onTopicSelect: handleTopicSelect,
    onStartConversation: handleStartConversation,
    isAiSpeaking: speaking,
    chatFlowState,
    onResetConversation: handleResetConversation,
    onGoBack: handleGoBack,
  };

  return (
    <div className="h-screen w-screen bg-slate-100 dark:bg-slate-900 font-sans antialiased overflow-y-auto md:overflow-hidden">
      {chatFlowState !== 'CHATTING' ? (
        <div className="flex flex-col items-center justify-center min-h-full p-4 relative">
          <div className="absolute top-4 right-4 z-10">
            <ThemeSwitcher />
          </div>
          <div className="w-full max-w-lg mx-auto bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden animate-fade-in">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-col items-center text-center gap-3">
              <CapybaraLogo className="w-16 h-16" />
              <div>
                <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Welcome to CapyBlaBla</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure your session to start chatting</p>
              </div>
            </div>
            <SettingsPanel {...settingsPanelProps} />
          </div>
        </div>
      ) : (
        <div className="h-full w-full relative">
          {isSidebarOpen && (
            <div
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                aria-hidden="true"
            ></div>
          )}

          <aside className={`fixed inset-y-0 left-0 z-30 flex-shrink-0 w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CapybaraLogo className="w-12 h-12" />
                  <div>
                    <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">CapyBlaBla</h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Your Capybara Tutor</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <ThemeSwitcher />
                  <IconButton onClick={() => setIsSidebarOpen(false)} aria-label="Close settings">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                  </IconButton>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                 <SettingsPanel {...settingsPanelProps} />
              </div>
            </div>
          </aside>

          <main className={`flex-1 flex flex-col h-full transition-all duration-300 ease-in-out ${isSidebarOpen ? 'md:ml-80' : 'ml-0'}`}>
            <ChatInterface
              messages={messages}
              onSendMessage={handleSendMessage}
              isAiTyping={isAiTyping}
              selectedLanguage={selectedLanguage.code}
              selectedPartner={selectedPartner}
              isAiSpeaking={speaking}
              onSkipAiVoice={cancel}
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />
          </main>
        </div>
      )}
    </div>
  );
};

export default App;