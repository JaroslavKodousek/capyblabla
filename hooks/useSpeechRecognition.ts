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

interface UseSpeechRecognitionOptions {
  silenceTimeoutMs?: number; // Time in milliseconds to wait before stopping due to silence
}

export const useSpeechRecognition = (lang: string, options: UseSpeechRecognitionOptions = {}) => {
  const { silenceTimeoutMs = 5000 } = options; // Default 5 seconds

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const isStoppingRef = useRef(false); // Track if we're in the process of stopping
  const silenceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSpeechTimeRef = useRef<number>(0);

  const clearSilenceTimeout = useCallback(() => {
    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  }, []);

  const setSilenceTimeout = useCallback(() => {
    clearSilenceTimeout();
    silenceTimeoutRef.current = setTimeout(() => {
      if (isListening && recognitionRef.current) {
        console.log(`Stopping recognition due to ${silenceTimeoutMs}ms of silence`);
        stopListening();
      }
    }, silenceTimeoutMs);
  }, [silenceTimeoutMs, isListening]);

  const stopListening = useCallback(() => {
    if (isStoppingRef.current) return; // Prevent multiple stop calls
    isStoppingRef.current = true;

    clearSilenceTimeout();

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
  }, [clearSilenceTimeout]);

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

    clearSilenceTimeout();
    setTranscript('');
    setError(null);
    lastSpeechTimeRef.current = Date.now();

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      // Enable continuous mode and interim results for better silence detection
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        // Only process if we're still actively listening
        if (!recognitionRef.current || isStoppingRef.current) {
          return;
        }

        let finalTranscript = '';
        let interimTranscript = '';

        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;

          if (result.isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Update transcript with final results
        if (finalTranscript) {
          setTranscript(prev => (prev + finalTranscript).trim());
          lastSpeechTimeRef.current = Date.now();
          // Reset silence timeout when we get speech
          setSilenceTimeout();
        }

        // If we have any speech (final or interim), reset the silence timer
        if (finalTranscript || interimTranscript.trim()) {
          lastSpeechTimeRef.current = Date.now();
          setSilenceTimeout();
        }
      };

      recognition.onend = () => {
        clearSilenceTimeout();
        // Only update state if we haven't manually stopped
        if (!isStoppingRef.current) {
          setIsListening(false);
          recognitionRef.current = null;
        }
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        clearSilenceTimeout();

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

      // Set initial silence timeout
      setSilenceTimeout();

    } catch (err) {
      console.error("Speech Recognition initialization failed:", err);
      setError("Failed to initialize speech recognition. This browser may not be fully compatible.");
      stopListening();
    }
  }, [lang, isListening, stopListening, setSilenceTimeout]);

  const clearTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      isStoppingRef.current = true;
      clearSilenceTimeout();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (err) {
          console.warn('Cleanup error:', err);
        }
      }
    };
  }, [clearSilenceTimeout]);

  return { 
    isListening, 
    transcript, 
    error, 
    startListening, 
    stopListening, 
    hasRecognitionSupport: !!SpeechRecognition, 
    clearTranscript 
  };
};