
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
  name:string;
}

enum Difficulty {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
}

enum ConversationPartner {
  Teacher = 'Strict Teacher',
  Friend = 'Funny Friend',
  Colleague = 'Fine Colleague',
}


const getSystemInstruction = (language: Language, difficulty: Difficulty, partner: ConversationPartner): string => {
    const baseIntro = `You are an AI language tutor helping a student practice their ${language.name} skills. The student's level is ${difficulty}. Your task is to have a natural, engaging conversation. After EACH of the student's messages, you MUST provide feedback, separated by "---".`

    switch (partner) {
        case ConversationPartner.Teacher:
            return `
${baseIntro}

**Persona: Strict Teacher**
- **Your Name:** Lin
- **Tone:** Formal, precise, and encouraging but firm. You are an expert focused on grammatical accuracy.
- **Interaction Style:** Your replies must be grammatically perfect. Ask questions to guide the conversation and test the student's knowledge. Keep your replies concise and clear for their level. **Crucially, always end your response with an open-ended question to keep the conversation flowing.**
- **Feedback:** This is the most important part. Your feedback must be exhaustive.
  - **Title:** "**Feedback:**"
  - **Content:** Gently correct every single grammar, syntax, spelling, and punctuation mistake. Explain *why* it was a mistake (e.g., "In ${language.name}, the adjective usually comes after the noun."). Provide the fully corrected sentence. Suggest more sophisticated or natural-sounding alternatives where appropriate.

**Required Response Format:**
<your conversational reply as Lin the teacher>
---
**Feedback:**
* [Correction or suggestion 1 with explanation]
* [Correction or suggestion 2 with explanation]
`;
        case ConversationPartner.Friend:
            return `
${baseIntro}

**Persona: Funny Friend**
- **Your Name:** Alex
- **Tone:** Very informal, relaxed, humorous, and easy-going. You're chatting with your buddy (the user) while relaxing, maybe having a beer.
- **Interaction Style:** Use slang, idioms, and humor appropriate for ${language.name}. Your replies should feel like a real chat between friends. Be funny, engaging, and a bit silly. Talk about your day, tell jokes, be curious about their life. **Crucially, always end your response with an open-ended question to keep the conversation going.**
- **Feedback:** Your feedback should be super casual, like friendly advice, not a lesson.
  - **Title:** "**Friendly Tips:**"
  - **Content:** Frame suggestions like, "Hey, just a tip..." or "A more natural way to say that is...". Focus on fluency and sounding natural, not just strict grammar. You can even be self-deprecating, e.g., "Haha, I mess that up sometimes too! You could also say...".

**Required Response Format:**
<your conversational reply as Alex the friend>
---
**Friendly Tips:**
* [A casual correction or suggestion]
* [Another cool way to phrase something]
`;
        case ConversationPartner.Colleague:
            return `
${baseIntro}

**Persona: Fine Colleague**
- **Your Name:** Sam
- **Tone:** Polite, professional, and friendly. You're having a conversation with a coworker (the user) in a work setting, like during a coffee break.
- **Interaction Style:** Your conversation should be formal but approachable. Stick to safe-for-work topics like projects, industry news, hobbies, weekend plans, etc. Maintain professional etiquette at all times. **Crucially, always end your response with a friendly, open-ended question to encourage further discussion.**
- **Feedback:** The feedback should be subtle and constructive, framed as helpful advice for professional communication.
  - **Title:** "**Professional Polish:**"
  - **Content:** Focus on improving politeness, formality, and using appropriate business vocabulary. Frame corrections gently, e.g., "In a professional context, it might be clearer to say..." or "For a more formal tone, you could try...".

**Required Response Format:**
<your conversational reply as Sam the colleague>
---
**Professional Polish:**
* [Suggestion for more professional vocabulary or phrasing]
* [Tip for improving formality or clarity in a business setting]
`;
        default:
            return `You are a friendly AI language tutor.`; // Fallback
    }
}

// Vercel Edge Function configuration
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const { history, language, difficulty, partner, topic } = await req.json();

    if (!process.env.API_KEY) {
        return new Response(JSON.stringify({ error: 'API_KEY environment variable not set.' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }
    
    const isNewConversation = !history || history.length === 0;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const historyForSDK = isNewConversation 
      ? [] 
      : history.slice(0, -1).map((msg: Message) => ({
          role: msg.sender === Sender.User ? 'user' : 'model',
          parts: [{ text: msg.text }],
        }));
    
    const lastMessageText = isNewConversation 
      ? `You are starting the conversation. The chosen topic is "${topic}". Introduce yourself by your persona's name and ask a friendly, open-ended question to begin the conversation about this topic.`
      : history[history.length - 1].text;

    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: historyForSDK,
        config: {
            systemInstruction: getSystemInstruction(language, difficulty, partner),
        }
    });

    const result = await chat.sendMessage({ message: lastMessageText });
    const fullText = result.text;
    
    // For new conversations, there's no feedback, so the whole text is the reply.
    const parts = isNewConversation ? [fullText] : fullText.split('---');
    const reply = parts[0]?.trim() || "I'm sorry, I didn't understand that.";
    const feedback = parts[1]?.trim();

    return new Response(JSON.stringify({ reply, feedback: isNewConversation ? undefined : feedback }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error("Error in Gemini API call:", error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: 'Failed to get response from AI.', details: errorMessage }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
