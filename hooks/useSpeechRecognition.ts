
import { useState, useRef, useCallback, useEffect } from 'react';

// FIX: Add missing Web Speech API type definitions to resolve TypeScript errors.
// These types are not included by default in TypeScript's DOM library and are necessary
// for the SpeechRecognition API to be recognized.
declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }

  interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onend: () => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
  }

  interface SpeechRecognitionEvent extends Event {
    readonly resultIndex: number;
    readonly results: SpeechRecognitionResultList;
  }

  interface SpeechRecognitionResultList {
    readonly length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
  }

  interface SpeechRecognitionResult {
    readonly isFinal: boolean;
    readonly length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
  }

  interface SpeechRecognitionAlternative {
    readonly transcript: string;
    readonly confidence: number;
  }

  interface SpeechRecognitionErrorEvent extends Event {
    readonly error: string;
    readonly message: string;
  }
}

const SpeechRecognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

export const useSpeechRecognition = (lang: string) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  const startListening = useCallback(() => {
    if (isListening) {
      stopListening();
      return;
    }

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    // Force cleanup of any previous instance to prevent bugs.
    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }
    
    setTranscript('');
    setError(null);
    
    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      // Setting continuous to false is more reliable on mobile to prevent duplication bugs.
      // The browser will automatically stop recognition after a pause in speech.
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = lang;
  
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
            finalTranscript += event.results[i][0].transcript;
        }
        setTranscript(finalTranscript);
      };
  
      recognition.onend = () => {
        setIsListening(false);
        // Do not nullify the ref here, let stopListening handle it
      };
      
      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        let errorMessage = `An unknown error occurred: ${event.error}.`;
        if (event.message) {
            errorMessage += ` Message: ${event.message}`;
        }
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          errorMessage = "Microphone permission was denied. Please allow microphone access in your browser's settings and refresh the page.";
        } else if (event.error === 'no-speech') {
          errorMessage = "No speech was detected. Please check your microphone and try again.";
        } else if (event.error === 'network') {
          errorMessage = "A network error occurred with the speech recognition service. Please check your internet connection.";
        } else if (event.error === 'audio-capture') {
          errorMessage = "Failed to capture audio. Please ensure your microphone is connected and not in use by another application.";
        }
        
        setError(errorMessage);
        stopListening();
      };

      recognition.start();
      setIsListening(true);

    } catch (err) {
      console.error("Speech Recognition initialization failed:", err);
      setError("Failed to initialize speech recognition. This browser may not be fully compatible.");
      stopListening();
    }
  }, [lang, isListening, stopListening]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
  }, []);
  
  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  return { isListening, transcript, error, startListening, stopListening, hasRecognitionSupport: !!SpeechRecognition, clearTranscript };
};
