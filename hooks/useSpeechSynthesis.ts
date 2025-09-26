
import { useState, useEffect, useCallback } from 'react';

export const useSpeechSynthesis = () => {
  const [speaking, setSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setSupported(true);
      
      const handleVoicesChanged = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);
      };

      // Voices are loaded asynchronously. We need to listen for the event.
      window.speechSynthesis.onvoiceschanged = handleVoicesChanged;
      handleVoicesChanged(); // Also call it directly in case they are already available.
      
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
        window.speechSynthesis.cancel();
      };
    }
  }, []);

  const speak = useCallback((text: string, lang: string, voice: SpeechSynthesisVoice | null, rate: number) => {
    if (!supported) return;
    
    // Ensure any ongoing speech is stopped before starting a new one.
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;

    // Find the best voice if one isn't provided or if the provided one is not available.
    // This makes the function more robust against timing issues.
    let voiceToUse = voice;
    if (!voiceToUse) {
      const languageVoices = voices.filter(v => v.lang.startsWith(lang));
      voiceToUse = languageVoices.find(v => v.default) || languageVoices[0] || null;
    }
    
    if (voiceToUse) {
      utterance.voice = voiceToUse;
    } else {
      console.warn(`No voice found for language: ${lang}. Using browser default.`);
    }
    
    utterance.onstart = () => {
      setSpeaking(true);
    };
    
    utterance.onend = () => {
      setSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error("SpeechSynthesis Error:", event.error);
      setSpeaking(false);
    };

    // Use a timeout to ensure cancel has finished before speaking.
    setTimeout(() => {
        window.speechSynthesis.speak(utterance);
    }, 100);

  }, [supported, voices]);

  const cancel = useCallback(() => {
    if (supported) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, [supported]);

  return { speak, cancel, speaking, supported, voices };
};
