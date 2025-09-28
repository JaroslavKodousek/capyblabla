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
  const shouldRestartRef = useRef(false); // Track if we should restart after onend
  const finalTranscriptRef = useRef(''); // Store accumulated final transcript

  const stopListening = useCallback(() => {
    if (isStoppingRef.current) return; // Prevent multiple stop calls
    isStoppingRef.current = true;
    shouldRestartRef.current = false; // Don't restart when manually stopping

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (err) {
        console.warn('Error stopping recognition:', err);
      }
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

    // Only clear transcript and final transcript when manually starting (not restarting)
    if (!shouldRestartRef.current) {
      setTranscript('');
      finalTranscriptRef.current = '';
    }
    setError(null);
    shouldRestartRef.current = true; // Enable auto-restart

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      // Continuous recording settings
      recognition.continuous = true; // Enable continuous recording
      recognition.interimResults = true; // Show interim results for better UX
      recognition.lang = lang;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        // Only process if we're still actively listening
        if (!recognitionRef.current || isStoppingRef.current) {
          return;
        }

        let interimTranscript = '';
        let finalTranscript = finalTranscriptRef.current;

        // Process all results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;

          if (result.isFinal) {
            finalTranscript += transcript + ' ';
            finalTranscriptRef.current = finalTranscript;
          } else {
            interimTranscript += transcript;
          }
        }

        // Update the displayed transcript (final + interim)
        const displayTranscript = (finalTranscript + interimTranscript).trim();
        setTranscript(displayTranscript);
      };

      recognition.onend = () => {
        // Auto-restart recognition if it wasn't manually stopped and we should continue
        if (shouldRestartRef.current && !isStoppingRef.current) {
          setTimeout(() => {
            if (shouldRestartRef.current && !isStoppingRef.current) {
              try {
                const newRecognition = new SpeechRecognition();
                recognitionRef.current = newRecognition;

                // Apply same settings
                newRecognition.continuous = true;
                newRecognition.interimResults = true;
                newRecognition.lang = lang;
                newRecognition.onresult = recognition.onresult;
                newRecognition.onend = recognition.onend;
                newRecognition.onerror = recognition.onerror;

                newRecognition.start();
              } catch (err) {
                console.error("Failed to restart recognition:", err);
                setIsListening(false);
                shouldRestartRef.current = false;
              }
            }
          }, 100); // Small delay before restart
        } else {
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
          shouldRestartRef.current = false; // Don't restart on permission errors
        } else if (event.error === 'no-speech') {
          // Don't show error for no-speech, just continue listening
          return;
        } else if (event.error === 'network') {
          errorMessage = "A network error occurred with the speech recognition service. Please check your internet connection.";
        } else if (event.error === 'audio-capture') {
          errorMessage = "Failed to capture audio. Please ensure your microphone is connected and not in use by another application.";
          shouldRestartRef.current = false; // Don't restart on audio capture errors
        }

        // Only stop listening for critical errors
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed' || event.error === 'audio-capture') {
          setError(errorMessage);
          stopListening();
        }
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
    finalTranscriptRef.current = '';
  }, []);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      isStoppingRef.current = true;
      shouldRestartRef.current = false;
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