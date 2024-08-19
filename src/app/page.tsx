'use client';

import { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';
import SuggestionCards from '../components/SuggestionCards';
import TypewriterEffect from '../components/TypewriterEffect';
import CodeBlock from '../components/CodeBlock';
import { FaUser, FaRobot, FaArrowDown } from 'react-icons/fa';
import TextareaAutosize from 'react-textarea-autosize';

export default function Home() {
  const [input, setInput] = useState('');
  const [conversation, setConversation] = useState<
    { role: string; content: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
        setShowScrollButton(scrollHeight - scrollTop > clientHeight + 100);
      };
      scrollContainer.addEventListener('scroll', handleScroll);
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    setIsLoading(true);
    const updatedConversation = [
      ...conversation,
      { role: 'user', content: input },
    ];
    setConversation(updatedConversation);
    setInput('');

    try {
      const response = await axios.post('/api/chat', {
        conversation: updatedConversation,
      });
      setConversation((prev) => [
        ...prev,
        { role: 'assistant', content: response.data.response },
      ]);
    } catch (error) {
      console.error('Error:', error);
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 429) {
          toast.error('Rate limit exceeded. Please try again later.', {
            position: 'bottom-right',
          });
        } else {
          toast.error(
            `An error occurred: ${
              error.response?.data?.message || error.message
            }`,
            {
              position: 'bottom-right',
            }
          );
        }
      } else {
        toast.error('An unexpected error occurred. Please try again.', {
          position: 'bottom-right',
        });
      }
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
    <div className='flex h-screen bg-gradient-to-b from-black via-gray-900 to-gray-800 text-white'>
      <Head>
        <title>CoderHelper</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <main className='flex-grow flex flex-col'>
        <div
          ref={scrollContainerRef}
          className='flex-grow overflow-y-auto p-6 space-y-4 relative'
        >
          {conversation.length === 0 ? (
            <SuggestionCards />
          ) : (
            conversation.map((message, index) => (
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
          {showScrollButton && (
            <button
              onClick={scrollToBottom}
              className='fixed bottom-20 right-8 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-full p-2 shadow-lg transition-all duration-200 ease-in-out'
            >
              <FaArrowDown size={20} />
            </button>
          )}
        </div>
        <form
          onSubmit={handleSubmit}
          className='p-4 border-t border-gray-700 bg-gray-800'
        >
          <div className='flex items-center bg-gray-700 rounded-lg'>
            <TextareaAutosize
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className='flex-grow p-3 bg-transparent focus:outline-none resize-none text-gray-200 rounded-md h-10 max-h-40'
              placeholder='Message CoderHelper...'
              minRows={1}
              maxRows={6} // Adjust this to control how much the input can extend
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
      <Toaster />
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
        body {
          background-color: #000;
          color: #fff;
        }
        .bg-gray-700 {
          background: linear-gradient(145deg, #333, #555);
        }
        .bg-gray-800 {
          background: linear-gradient(145deg, #222, #444);
        }
        .bg-blue-600 {
          background: linear-gradient(145deg, #0066cc, #0055aa);
        }
      `}</style>
    </div>
  );
}
