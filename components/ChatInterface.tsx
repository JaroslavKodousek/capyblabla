import React, { useState, useEffect, useRef } from 'react';
import { Message as MessageType, ConversationPartner } from '../types';
import Message from './Message';
import IconButton from './IconButton';
import Spinner from './Spinner';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import CapybaraLogo from './CapybaraLogo';

interface ChatInterfaceProps {
  messages: MessageType[];
  onSendMessage: (text: string) => void;
  isAiTyping: boolean;
  selectedLanguage: string;
  selectedPartner: ConversationPartner;
  isAiSpeaking: boolean;
  onSkipAiVoice: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isAiTyping, selectedLanguage, selectedPartner, isAiSpeaking, onSkipAiVoice, onToggleSidebar, isSidebarOpen }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wasListeningRef = useRef(false);

  const { isListening, transcript, startListening, stopListening, hasRecognitionSupport, clearTranscript } = useSpeechRecognition(selectedLanguage);

  useEffect(() => {
    setInputText(transcript);
    // Scroll input to the end to always show the last spoken words
    if (inputRef.current) {
      inputRef.current.scrollLeft = inputRef.current.scrollWidth;
    }
  }, [transcript]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // When listening stops (either by button click or timeout), send the message.
  useEffect(() => {
    if (wasListeningRef.current && !isListening && transcript.trim()) {
      onSendMessage(transcript);
      clearTranscript();
    }
    wasListeningRef.current = isListening;
  }, [isListening, transcript, onSendMessage, clearTranscript]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim() && !isListening) {
      onSendMessage(inputText);
      setInputText('');
      if (transcript) {
        clearTranscript();
      }
    }
  };
  
  const handleVoiceClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-slate-900">
      <header className="p-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center gap-4">
        {!isSidebarOpen && (
            <IconButton onClick={onToggleSidebar} aria-label="Open settings">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </IconButton>
        )}
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Chat with {selectedPartner}</h2>
      </header>
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 && !isAiTyping && (
          <div className="text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center h-full">
            <div className="max-w-md">
                <CapybaraLogo className="w-56 h-56 mx-auto" />
                <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-6">Welcome to CapyBlaBla!</h3>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                  Choose your partner, language, and a conversation topic from the sidebar to begin.
                </p>
            </div>
          </div>
        )}
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
        {isAiTyping && (
           <div className="flex items-start gap-3 my-4 justify-start">
              <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 flex-shrink-0">AI</div>
              <div className="bg-white dark:bg-slate-700 text-slate-800 rounded-2xl rounded-bl-none p-4 border border-slate-200 dark:border-slate-600">
                <Spinner className="w-6 h-6 text-sky-500" />
              </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isListening ? "Listening... click mic to stop and send" : "Type your message..."}
            className="flex-1 p-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-slate-100 rounded-full focus:outline-none focus:ring-2 focus:ring-sky-500 transition"
            disabled={isAiTyping || isListening || messages.length === 0 || isAiSpeaking}
          />
          {isAiSpeaking ? (
             <button
              type="button"
              onClick={onSkipAiVoice}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-full bg-amber-500 text-white font-semibold hover:bg-amber-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
              disabled={!isAiSpeaking}
              aria-label="Stop text to speech"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h12v12H6V6z" />
              </svg>
              <span>Stop</span>
            </button>
          ) : (
            <>
              {hasRecognitionSupport && (
                <IconButton type="button" onClick={handleVoiceClick} disabled={isAiTyping || messages.length === 0} className={isListening ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-slate-100 dark:bg-slate-700'}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </IconButton>
              )}
              <IconButton type="submit" disabled={!inputText.trim() || isAiTyping || isListening || messages.length === 0} className="bg-orange-500 text-white hover:bg-orange-600 disabled:bg-orange-300">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" transform="rotate(90)">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                 </svg>
              </IconButton>
            </>
          )}
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;