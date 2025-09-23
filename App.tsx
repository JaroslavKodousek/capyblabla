
import React, { useState, useEffect } from 'react';
import SettingsPanel from './components/SettingsPanel';
import ChatInterface from './components/ChatInterface';
import { Message, Sender, Language, Difficulty, ConversationPartner } from './types';
import { LANGUAGES, DIFFICULTIES, CONVERSATION_PARTNERS } from './constants';
import * as geminiService from './services/geminiService';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';
import CapybaraLogo from './components/CapybaraLogo';
import ThemeSwitcher from './components/ThemeSwitcher';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(LANGUAGES[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(DIFFICULTIES[0]);
  const [selectedPartner, setSelectedPartner] = useState<ConversationPartner>(CONVERSATION_PARTNERS[0]);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [speakingRate, setSpeakingRate] = useState(1);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const { speak, voices } = useSpeechSynthesis();

  const languageVoices = voices.filter(v => v.lang.startsWith(selectedLanguage.code));

  useEffect(() => {
    if (languageVoices.length > 0) {
      const preferredVoice = languageVoices.find(v => v.default) || languageVoices[0];
      setSelectedVoice(preferredVoice);
    } else {
      setSelectedVoice(null);
    }
  }, [selectedLanguage.code, voices, languageVoices]);

  // Reset chat and topic when primary settings change, forcing a new topic selection
  useEffect(() => {
    setMessages([]);
    setSelectedTopic(null);
  }, [selectedLanguage, selectedDifficulty, selectedPartner]);

  // Handler to start a new session when a topic is selected
  const handleTopicSelect = async (topic: string) => {
    setSelectedTopic(topic);
    setMessages([]); // Ensure chat is clear
    setIsAiTyping(true);

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
    } catch (error) {
      console.error("Failed to start new session:", error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm sorry, I couldn't start our conversation. Please try again.",
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
            <ThemeSwitcher />
          </div>
          <div className="flex-1 overflow-y-auto">
             <SettingsPanel
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              selectedDifficulty={selectedDifficulty}
              onDifficultyChange={setSelectedDifficulty}
              selectedPartner={selectedPartner}
              onPartnerChange={setSelectedPartner}
              voices={languageVoices}
              selectedVoice={selectedVoice}
              onVoiceChange={setSelectedVoice}
              speakingRate={speakingRate}
              onRateChange={setSpeakingRate}
              selectedTopic={selectedTopic}
              onTopicSelect={handleTopicSelect}
              isSessionActive={messages.length > 0}
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
        />
      </main>
    </div>
  );
};

export default App;