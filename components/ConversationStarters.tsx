
import React from 'react';
import { CONVERSATION_STARTERS } from '../constants';

interface ConversationStartersProps {
  onStarterClick: (starter: string) => void;
  disabled: boolean;
}

const ConversationStarters: React.FC<ConversationStartersProps> = ({ onStarterClick, disabled }) => {
  return (
    <div className="p-6">
      <h3 className="text-lg font-semibold text-gray-700 mb-4">Conversation Starters</h3>
      <div className="space-y-3">
        {CONVERSATION_STARTERS.map((starter, index) => (
          <button
            key={index}
            onClick={() => onStarterClick(starter)}
            disabled={disabled}
            className="w-full text-left p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {starter}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ConversationStarters;
