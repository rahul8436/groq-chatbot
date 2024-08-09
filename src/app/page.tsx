'use client';

import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import axios from 'axios';
import SuggestionCards from '../components/SuggestionCards';
import TypewriterEffect from '../components/TypewriterEffect';
import CodeBlock from '../components/CodeBlock';
import { FaUser, FaRobot } from 'react-icons/fa';

export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    setMessages((prev) => [...prev, { role: 'user', content: input }]);
    setInput('');

    try {
      const response = await axios.post('/api/chat', { message: input });
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: response.data.response },
      ]);
    } catch (error) {
      console.error('Error:', error);
    }

    setIsLoading(false);
  };

  const renderMessage = (message: { role: string; content: string }) => {
    if (message.role === 'user') {
      return <span>{message.content}</span>;
    }

    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(message.content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(
          <TypewriterEffect
            key={`text-${lastIndex}`}
            text={message.content.slice(lastIndex, match.index)}
          />
        );
      }
      parts.push(
        <CodeBlock
          key={`code-${match.index}`}
          language={match[1] || 'text'}
          value={match[2]}
        />
      );
      lastIndex = match.index + match[0].length;
    }

    if (lastIndex < message.content.length) {
      parts.push(
        <TypewriterEffect
          key={`text-${lastIndex}`}
          text={message.content.slice(lastIndex)}
        />
      );
    }

    return <>{parts}</>;
  };

  return (
    <div className='flex h-screen bg-gray-900 text-white'>
      <Head>
        <title>CoderHelper</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className='flex-grow flex flex-col'>
        {/* <div className='flex items-center p-4 border-b border-gray-700 bg-gray-800'>
          <h1 className='text-lg font-bold'>CoderHelper</h1>
        </div> */}
        <div className='flex-grow overflow-y-auto p-6 space-y-4'>
          {messages.length === 0 ? (
            <SuggestionCards />
          ) : (
            messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start space-x-4 ${
                  message.role === 'user' ? 'justify-end' : ''
                } animate-slide-in`}
              >
                {message.role === 'user' ? (
                  <FaUser className='text-blue-500' size={24} />
                ) : (
                  <FaRobot className='text-green-500' size={24} />
                )}
                <div
                  className={`max-w-xs md:max-w-md p-4 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-right'
                      : 'bg-gray-700 text-left'
                  }`}
                >
                  {renderMessage(message)}
                </div>
              </div>
            ))
          )}
          {isLoading && <div className='text-center'>Thinking...</div>}
          <div ref={messagesEndRef} />
        </div>
        <form
          onSubmit={handleSubmit}
          className='p-4 border-t border-gray-700 bg-gray-800'
        >
          <div className='flex items-center bg-gray-700 rounded-lg'>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className='flex-grow p-3 bg-transparent focus:outline-none resize-none h-10 max-h-40 rounded-md'
              placeholder='Message CoderHelper...'
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button
              type='submit'
              className='p-3 text-gray-400 hover:text-white focus:outline-none'
              disabled={isLoading}
            >
              <svg
                xmlns='http://www.w3.org/2000/svg'
                fill='none'
                viewBox='0 0 24 24'
                stroke='currentColor'
                className='h-5 w-5'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M13 5l7 7-7 7M5 5l7 7-7 7'
                />
              </svg>
            </button>
          </div>
        </form>
      </main>
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}
