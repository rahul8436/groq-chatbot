'use client';

import { useEffect, useRef, useState } from 'react';
import { FaMicrophone, FaStop } from 'react-icons/fa';

interface SpeechToTextProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export default function SpeechToText({
  onTranscript,
  disabled,
}: SpeechToTextProps) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!isListening) return;
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      onTranscript(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();

    return () => {
      recognition.stop();
    };
  }, [isListening, onTranscript]);

  return (
    <button
      type='button'
      onClick={() => setIsListening((prev) => !prev)}
      disabled={disabled}
      className={`p-2 rounded ${
        isListening ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700'
      }`}
      title={isListening ? 'Stop recording' : 'Start voice input'}
    >
      {isListening ? <FaStop /> : <FaMicrophone />}
    </button>
  );
}
