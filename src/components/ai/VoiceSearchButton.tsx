"use client";
import { useState } from "react";
import { Mic, Loader2 } from "lucide-react";

interface VoiceSearchButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export default function VoiceSearchButton({
  onTranscript,
  className = "",
}: VoiceSearchButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  const startBrowserRecognition = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice search is not supported in this browser yet.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      setIsBusy(true);
    };
    recognition.onerror = () => {
      setIsListening(false);
      setIsBusy(false);
    };
    recognition.onend = () => {
      setIsListening(false);
      setIsBusy(false);
    };
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      onTranscript(transcript);
    };

    recognition.start();
  };

  const handleClick = () => {
    if (isListening || isBusy) return;
    startBrowserRecognition();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30 hover:from-violet-700 hover:to-indigo-700 transition-all w-11 h-11 ${className}`}
      aria-label="Voice search"
    >
      {isBusy || isListening ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Mic size={18} />
      )}
    </button>
  );
}

"use client";
import { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';

interface VoiceSearchButtonProps {
  onTranscript: (text: string) => void;
  className?: string;
}

export default function VoiceSearchButton({ onTranscript, className = '' }: VoiceSearchButtonProps) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Voice search is not supported in your browser. Please use Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsListening(false);
      setIsProcessing(true);
      onTranscript(transcript);
      setTimeout(() => setIsProcessing(false), 500);
    };

    recognition.onerror = () => {
      setIsListening(false);
      setIsProcessing(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, [onTranscript]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return (
    <button
      type="button"
      onClick={isListening ? stopListening : startListening}
      className={`p-3 rounded-full transition-all duration-300 ${
        isListening
          ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/40'
          : isProcessing
          ? 'bg-violet-500 text-white'
          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-violet-100 dark:hover:bg-violet-900/30'
      } ${className}`}
      title={isListening ? 'Stop listening' : 'Voice search'}
    >
      {isProcessing ? (
        <Loader2 size={20} className="animate-spin" />
      ) : isListening ? (
        <MicOff size={20} />
      ) : (
        <Mic size={20} />
      )}
    </button>
  );
}
