
import React from 'react';
import { Message as MessageType, Sender } from '../types';

interface MessageProps {
  message: MessageType;
}

const Message: React.FC<MessageProps> = ({ message }) => {
  const isUser = message.sender === Sender.User;

  const renderTextWithLineBreaks = (text: string) => {
    return text.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };
  
  return (
    <div className={`flex items-start gap-3 my-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 dark:text-slate-400 flex-shrink-0">
          AI
        </div>
      )}
      <div className={`max-w-md lg:max-w-2xl p-4 rounded-2xl shadow-sm ${isUser ? 'bg-sky-500 text-white rounded-br-none' : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-bl-none border border-slate-200 dark:border-slate-600'}`}>
        <p className="whitespace-pre-wrap">{renderTextWithLineBreaks(message.text)}</p>
        {message.feedback && (
          <div className="mt-4 pt-3 border-t border-slate-300/50 dark:border-slate-500/50 opacity-90">
            <p className="whitespace-pre-wrap text-sm">{renderTextWithLineBreaks(message.feedback)}</p>
          </div>
        )}
      </div>
       {isUser && (
        <div className="w-10 h-10 rounded-full bg-slate-700 dark:bg-slate-500 flex items-center justify-center font-bold text-white flex-shrink-0">
          You
        </div>
      )}
    </div>
  );
};

export default Message;