import { Language, Difficulty, Message } from '../types';

export const sendMessageToAI = async (
  history: Message[],
  language: Language,
  difficulty: Difficulty
): Promise<{ reply: string; feedback?: string }> => {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ history, language, difficulty }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("API Error:", errorData);
      throw new Error(errorData.error || 'The AI service failed to respond.');
    }

    const data = await response.json();
    return { reply: data.reply, feedback: data.feedback };

  } catch (error) {
    console.error("Error sending message to AI service:", error);
    return { reply: "Sorry, I encountered an error. Please try again." };
  }
};
