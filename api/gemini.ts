import { GoogleGenAI } from "@google/genai";

// Types duplicated from ../types.ts to avoid build issues in serverless environment.
enum Sender {
  User = 'user',
  AI = 'ai',
}

interface Message {
  id: string;
  text: string;
  sender: Sender;
  feedback?: string;
}

interface Language {
  code: string;
  name: string;
}

enum Difficulty {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
}

const getSystemInstruction = (language: Language, difficulty: Difficulty): string => `
You are Lin, a friendly and encouraging AI language tutor. You are helping a student practice their ${language.name} skills. The student's level is ${difficulty}.

Your task is to have a natural, engaging conversation with the student.
- Keep your responses relatively short and easy to understand for their level.
- Ask questions to keep the conversation flowing.
- After EACH of the student's messages, you MUST provide feedback.
- Format the feedback clearly and separately from your conversational reply.
- The feedback should gently correct grammar, spelling, and suggest better vocabulary.

Here is the required format for your entire response, with "---" as a separator:
<your conversational reply>
---
**Feedback:**
* [Correction or suggestion 1]
* [Correction or suggestion 2]
`;

// Vercel Edge Function configuration
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const { history, language, difficulty } = await req.json();

    if (!process.env.API_KEY) {
        return new Response(JSON.stringify({ error: 'API_KEY environment variable not set.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    
    if (!history || history.length === 0) {
        return new Response(JSON.stringify({ error: 'Conversation history is empty.' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const historyForSDK = history.slice(0, -1).map((msg: Message) => ({
      role: msg.sender === Sender.User ? 'user' : 'model',
      parts: [{ text: msg.text }],
    }));
    
    const lastMessageText = history[history.length - 1].text;

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: historyForSDK,
        config: {
            systemInstruction: getSystemInstruction(language, difficulty),
        }
    });

    const result = await chat.sendMessage({ message: lastMessageText });
    const fullText = result.text;
    
    const parts = fullText.split('---');
    const reply = parts[0]?.trim() || "I'm sorry, I didn't understand that.";
    const feedback = parts[1]?.trim();

    return new Response(JSON.stringify({ reply, feedback }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error("Error in Gemini API call:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: 'Failed to get response from AI.', details: errorMessage }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
