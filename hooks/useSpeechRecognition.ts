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
  const isStoppingRef = useRef(false); // Track if we're in the process of stopping

  const stopListening = useCallback(() => {
    if (isStoppingRef.current) return; // Prevent multiple stop calls
    isStoppingRef.current = true;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('Error stopping recognition:', err);
      }
      recognitionRef.current = null;
    }
    setIsListening(false);

    // Reset the stopping flag after a short delay
    setTimeout(() => {
      isStoppingRef.current = false;
    }, 100);
  }, []);

  const startListening = useCallback(() => {
    if (isListening || isStoppingRef.current) {
      return; // Don't start if already listening or in process of stopping
    }

    if (!SpeechRecognition) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    // Force cleanup of any previous instance to prevent bugs.
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch (err) {
        console.warn('Error aborting previous recognition:', err);
      }
      recognitionRef.current = null;
    }

    setTranscript('');
    setError(null);

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      // Mobile-optimized settings to prevent duplication
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = lang;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        // Only process if we're still actively listening
        if (!recognitionRef.current || isStoppingRef.current) {
          return;
        }

        // Get only the final result from the last result index
        const lastResultIndex = event.results.length - 1;
        if (lastResultIndex >= 0 && event.results[lastResultIndex].isFinal) {
          const finalTranscript = event.results[lastResultIndex][0].transcript;
          setTranscript(finalTranscript.trim());
        }
      };

      recognition.onend = () => {
        // Only update state if we haven't manually stopped
        if (!isStoppingRef.current) {
          setIsListening(false);
          recognitionRef.current = null;
        }
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
      isStoppingRef.current = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (err) {
          console.warn('Cleanup error:', err);
        }
      }
    };
  }, []);

  return { isListening, transcript, error, startListening, stopListening, hasRecognitionSupport: !!SpeechRecognition, clearTranscript };
};