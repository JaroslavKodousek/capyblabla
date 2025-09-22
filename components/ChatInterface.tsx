import React, { useState, useEffect, useRef } from 'react';
import { Message as MessageType } from '../types';
import Message from './Message';
import IconButton from './IconButton';
import Spinner from './Spinner';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface ChatInterfaceProps {
  messages: MessageType[];
  onSendMessage: (text: string) => void;
  isAiTyping: boolean;
  selectedLanguage: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, isAiTyping, selectedLanguage }) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isListening, transcript, startListening, stopListening, hasRecognitionSupport } = useSpeechRecognition(selectedLanguage);

  useEffect(() => {
    if (transcript) {
      setInputText(transcript);
    }
  }, [transcript]);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText);
      setInputText('');
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
    <div className="flex flex-col h-full bg-gray-50">
      <header className="p-4 border-b border-gray-200 bg-white">
        <h2 className="text-xl font-semibold text-gray-800 text-center md:text-left">AI Tutor Session</h2>
      </header>
      <div className="flex-1 overflow-y-auto p-6">
        {messages.length === 0 && !isAiTyping && (
          <div className="text-center text-gray-500 mt-10">
            <p>Select a conversation starter or type your own message to begin.</p>
          </div>
        )}
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
        {isAiTyping && (
           <div className="flex items-start gap-3 my-4 justify-start">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 flex-shrink-0">AI</div>
              <div className="bg-white text-gray-800 rounded-2xl rounded-bl-none p-4 border border-gray-200">
                <Spinner className="w-6 h-6 text-blue-500" />
              </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isListening ? "Listening..." : "Type your message..."}
            className="flex-1 p-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            disabled={isAiTyping || isListening}
          />
          {hasRecognitionSupport && (
            <IconButton type="button" onClick={handleVoiceClick} disabled={isAiTyping} className={isListening ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-gray-100'}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </IconButton>
          )}
          <IconButton type="submit" disabled={!inputText.trim() || isAiTyping} className="bg-blue-500 text-white hover:bg-blue-600 disabled:bg-blue-300">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
             </svg>
          </IconButton>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;