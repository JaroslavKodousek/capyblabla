import { useState, useRef, useCallback } from 'react';

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

export const useSpeechRecognition = (lang: string) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const startListening = useCallback(() => {
    if (isListening || recognitionRef.current) {
      return; // Already listening or an instance exists, do nothing.
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    setTranscript('');
    setError(null);

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition; // Store the instance in the ref
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;
  
      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let finalTranscript = '';
        let interimTranscript = '';
        // To prevent duplication bugs on some mobile browsers, we rebuild the entire
        // transcript from the results list each time an event is received.
        for (let i = 0; i < event.results.length; ++i) {
          const transcriptPart = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPart;
          } else {
            interimTranscript += transcriptPart;
          }
        }
        setTranscript(finalTranscript + interimTranscript);
      };
  
      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null; // Clean up ref on end
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
        setIsListening(false);
        recognitionRef.current = null; // Clean up ref on error
      };

      recognition.start();
      setIsListening(true);

    } catch (err) {
      console.error("Speech Recognition initialization failed:", err);
      setError("Failed to initialize speech recognition. This browser may not be fully compatible.");
    }
  }, [isListening, lang]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      // onend will handle state changes and cleanup
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  const hasRecognitionSupport = !!(typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition));

  return { isListening, transcript, error, startListening, stopListening, hasRecognitionSupport, clearTranscript };
};
