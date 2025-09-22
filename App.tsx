import React, { useState, useEffect, useCallback } from 'react';
import SettingsPanel from './components/SettingsPanel';
import ConversationStarters from './components/ConversationStarters';
import ChatInterface from './components/ChatInterface';
import { Message, Sender, Language, Difficulty } from './types';
import { LANGUAGES, DIFFICULTIES } from './constants';
import * as geminiService from './services/geminiService';
import { useSpeechSynthesis } from './hooks/useSpeechSynthesis';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(LANGUAGES[0]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>(DIFFICULTIES[0]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const [speakingRate, setSpeakingRate] = useState(1);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const { speak, voices } = useSpeechSynthesis();

  const languageVoices = voices.filter(v => v.lang.startsWith(selectedLanguage.code));

  useEffect(() => {
    // When language or available voices change, set a default voice for the new language
    if (languageVoices.length > 0) {
      const preferredVoice = languageVoices.find(v => v.default) || languageVoices[0];
      setSelectedVoice(preferredVoice);
    } else {
      setSelectedVoice(null);
    }
  }, [selectedLanguage.code, voices]);


  const resetChat = useCallback(() => {
    setMessages([]);
  }, []);

  useEffect(() => {
    resetChat();
  }, [selectedLanguage, selectedDifficulty]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { id: Date.now().toString(), text, sender: Sender.User };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsAiTyping(true);

    try {
      const { reply, feedback } = await geminiService.sendMessageToAI(updatedMessages, selectedLanguage, selectedDifficulty);
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
    <div className="h-screen w-screen bg-gray-100 flex font-sans antialiased overflow-hidden">
      {/* Sidebar */}
      <aside className={`absolute md:relative z-20 flex-shrink-0 w-80 bg-gray-50 border-r border-gray-200 transition-transform duration-300 ease-in-out md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-800">Lingua AI</h1>
            <p className="text-sm text-gray-500">Your Personal Language Tutor</p>
          </div>
          <div className="flex-1 overflow-y-auto">
             <SettingsPanel
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              selectedDifficulty={selectedDifficulty}
              onDifficultyChange={setSelectedDifficulty}
              voices={languageVoices}
              selectedVoice={selectedVoice}
              onVoiceChange={setSelectedVoice}
              speakingRate={speakingRate}
              onRateChange={setSpeakingRate}
            />
            <div className="border-t border-gray-200">
              <ConversationStarters onStarterClick={handleSendMessage} disabled={isAiTyping} />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative">
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className={`md:hidden absolute top-4 z-30 p-2 bg-white rounded-md shadow-md transition-all duration-300 ease-in-out ${isSidebarOpen ? 'left-[21rem]' : 'left-4'}`}
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
        >
           {isSidebarOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
           ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 12h-8" />
            </svg>
           )}
        </button>
        <ChatInterface
          messages={messages}
          onSendMessage={handleSendMessage}
          isAiTyping={isAiTyping}
          selectedLanguage={selectedLanguage.code}
        />
      </main>
    </div>
  );
};

export default App;
