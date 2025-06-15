'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import SuggestionCards from '../components/SuggestionCards';
import MarkdownMessage from '../components/MarkdownMessage';
import {
  FaUser,
  FaRobot,
  FaArrowDown,
  FaHistory,
  FaTrash,
  FaSave,
  FaKeyboard,
} from 'react-icons/fa';
import TextareaAutosize from 'react-textarea-autosize';
import ThemeToggle from '../components/ThemeToggle';
import AlertDialog from '../components/AlertDialog';
import CommandPalette from '../components/CommandPalette';
import { useTheme } from '../context/ThemeContext';
import { useUser } from '../context/UserContext';
import { useConversations } from '../context/ConversationsContext';
import LoginForm from '../components/LoginForm';
import Sidebar from '../components/Sidebar';
import UserAvatar from '../components/UserAvatar';

export default function Home() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [alertConfig, setAlertConfig] = useState<{
    title: string;
    message: string;
    type: 'warning' | 'info' | 'success';
    onConfirm: () => void;
  }>({
    title: '',
    message: '',
    type: 'warning',
    onConfirm: () => {},
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser();
  const { currentConversation, updateConversation, createConversation } =
    useConversations();

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollTop, scrollHeight, clientHeight } =
          scrollContainerRef.current;
        setShowScrollButton(scrollHeight - scrollTop - clientHeight > 100);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !currentConversation) return;

    setIsLoading(true);
    const updatedMessages = [
      ...currentConversation.messages,
      { role: 'user', content: input },
    ];
    updateConversation(currentConversation.id, updatedMessages);
    setInput('');

    try {
      const response = await axios.post('/api/chat', {
        conversation: updatedMessages,
      });
      updateConversation(currentConversation.id, [
        ...updatedMessages,
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

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.metaKey && e.key === 'k') {
      e.preventDefault();
      setShowCommandPalette(true);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  if (!user) {
    return <LoginForm />;
  }

  return (
    <div className='flex h-screen bg-white dark:bg-[#343541] text-gray-900 dark:text-white transition-colors duration-200'>
      <Head>
        <title>CoderHelper</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Sidebar />

      <main className='flex-grow flex flex-col max-w-4xl mx-auto w-full'>
        <div className='flex items-center justify-between py-4 px-4 border-b border-gray-200 dark:border-gray-700'>
          <h1 className='text-xl font-semibold text-gray-900 dark:text-gray-200'>
            CoderHelper
          </h1>
          <div className='flex items-center space-x-2'>
            <button
              onClick={() => setShowCommandPalette(true)}
              className='p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white focus:outline-none transition-colors duration-200'
              title='Command Palette (⌘K)'
            >
              <FaKeyboard size={20} />
            </button>
          </div>
        </div>

        <div
          ref={scrollContainerRef}
          className='flex-grow overflow-y-auto px-4 py-6 space-y-6 relative'
        >
          {!currentConversation || currentConversation.messages.length === 0 ? (
            <div className='max-w-3xl mx-auto'>
              <SuggestionCards
                onSuggestionClick={(prompt) => {
                  if (!currentConversation) {
                    createConversation();
                  }
                  setInput(prompt);
                }}
              />
            </div>
          ) : (
            currentConversation.messages.map((message, index) => (
              <div
                key={index}
                className={`flex items-start space-x-4 ${
                  message.role === 'user' ? 'justify-end' : ''
                } animate-slide-in`}
              >
                {message.role === 'user' ? (
                  <UserAvatar name={user?.name || ''} size='sm' />
                ) : (
                  <div className='flex-shrink-0 w-8 h-8 rounded-full bg-green-600 flex items-center justify-center'>
                    <FaRobot className='text-white' size={16} />
                  </div>
                )}
                <div
                  className={`max-w-2xl p-4 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-100 dark:bg-blue-600/20'
                      : 'bg-gray-100 dark:bg-gray-700/50'
                  }`}
                >
                  <MarkdownMessage content={message.content} />
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className='flex items-center space-x-2 text-gray-400'>
              <div
                className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                style={{ animationDelay: '0ms' }}
              ></div>
              <div
                className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                style={{ animationDelay: '150ms' }}
              ></div>
              <div
                className='w-2 h-2 bg-gray-400 rounded-full animate-bounce'
                style={{ animationDelay: '300ms' }}
              ></div>
            </div>
          )}
          <div ref={messagesEndRef} />
          {showScrollButton && (
            <button
              onClick={scrollToBottom}
              className='fixed bottom-24 right-8 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-full p-3 shadow-lg transition-all duration-200 ease-in-out'
            >
              <FaArrowDown size={16} />
            </button>
          )}
        </div>

        {currentConversation && (
          <form
            ref={formRef}
            onSubmit={handleSubmit}
            className='p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-[#343541]'
          >
            <div className='flex items-center bg-gray-100 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 focus-within:border-gray-300 dark:focus-within:border-gray-500 transition-colors duration-200'>
              <TextareaAutosize
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className='flex-grow p-4 bg-transparent focus:outline-none resize-none text-gray-900 dark:text-gray-200 rounded-md min-h-[52px] max-h-40'
                placeholder='Message CoderHelper...'
                minRows={1}
                maxRows={6}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
              <button
                type='submit'
                className='p-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200'
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
        )}
      </main>

      <AlertDialog
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        onConfirm={() => {
          alertConfig.onConfirm();
          setShowAlert(false);
        }}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onSaveConversation={() => {
          if (currentConversation) {
            toast.success('Conversation saved!');
          }
        }}
        onClearConversation={() => {
          if (currentConversation) {
            createConversation();
          }
        }}
        onToggleTheme={toggleTheme}
        onShowHistory={() => {}}
      />

      <Toaster />
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateY(10px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        .animate-slide-in {
          animation: slide-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
