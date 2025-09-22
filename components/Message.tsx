
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
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500 flex-shrink-0">
          AI
        </div>
      )}
      <div className={`max-w-md lg:max-w-2xl p-4 rounded-2xl ${isUser ? 'bg-blue-500 text-white rounded-br-none' : 'bg-white text-gray-800 rounded-bl-none border border-gray-200'}`}>
        <p className="whitespace-pre-wrap">{renderTextWithLineBreaks(message.text)}</p>
        {message.feedback && (
          <div className="mt-4 pt-3 border-t border-gray-300 opacity-90">
            <p className="whitespace-pre-wrap text-sm">{renderTextWithLineBreaks(message.feedback)}</p>
          </div>
        )}
      </div>
       {isUser && (
        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center font-bold text-white flex-shrink-0">
          You
        </div>
      )}
    </div>
  );
};

export default Message;
