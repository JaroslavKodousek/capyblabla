import React, { useState, useEffect, useMemo } from 'react';
import SettingsPanel from './components/SettingsPanel';
import ChatInterface from './components/ChatInterface';
import { Message, Sender, Language, Difficulty, ConversationPartner } from './types';
import { LANGUAGES, DIFFICULTIES, CONVERSATION_PARTNERS } from './constants';
import * as geminiService from './services/geminiService';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import CapybaraLogo from './components/CapybaraLogo';
import ThemeSwitcher from './components/ThemeSwitcher';

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

  const handleTopicSelect = async (topic: string) => {
    setSelectedTopic(topic);
    setMessages([]); // Ensure chat is clear
    setIsAiTyping(true);
    cancel(); // Stop any previous speech before starting new one

    try {
      const { reply, feedback } = await geminiService.sendMessageToAI(
        [],
        selectedLanguage,
        selectedDifficulty,
        selectedPartner,
        topic
      );
      const aiMessage: Message = { id: Date.now().toString(), text: reply, sender: Sender.AI, feedback };
      setMessages([aiMessage]);
      speak(reply, selectedLanguage.code, selectedVoice, speakingRate);
      setChatFlowState('CHATTING');
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

  return (
    <div className="h-screen w-screen bg-slate-100 dark:bg-slate-900 flex font-sans antialiased overflow-hidden">
      <aside className={`absolute md:relative z-20 flex-shrink-0 w-80 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
             <SettingsPanel
              selectedLanguage={selectedLanguage}
              onLanguageChange={handleLanguageChange}
              selectedDifficulty={selectedDifficulty}
              onDifficultyChange={handleDifficultyChange}
              onConfirmDifficulty={handleConfirmDifficulty}
              selectedPartner={selectedPartner}
              onPartnerChange={handlePartnerChange}
              voices={languageVoices}
              selectedVoice={selectedVoice}
              onVoiceChange={setSelectedVoice}
              speakingRate={speakingRate}
              onRateChange={setSpeakingRate}
              selectedTopic={selectedTopic}
              onTopicSelect={handleTopicSelect}
              isAiSpeaking={speaking}
              chatFlowState={chatFlowState}
              onResetConversation={handleResetConversation}
            />
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col relative">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`md:hidden absolute top-4 z-30 p-2 bg-white dark:bg-slate-700 dark:text-slate-200 rounded-md shadow-md transition-all duration-300 ease-in-out ${isSidebarOpen ? 'left-[21rem]' : 'left-4'}`}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
           {isSidebarOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
           ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-4-6h4" />
            </svg>
           )}
        </button>
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isAiTyping={isAiTyping}
          selectedLanguage={selectedLanguage.code}
          selectedPartner={selectedPartner}
          isAiSpeaking={speaking}
          onSkipAiVoice={cancel}
        />
      </main>
    </div>
  );
};

export default App;