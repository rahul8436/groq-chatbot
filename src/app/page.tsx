'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Head from 'next/head';
import axios from 'axios';
import { toast, Toaster } from 'react-hot-toast';
import SuggestionCards from '../components/SuggestionCards';
import MarkdownMessage from '../components/MarkdownMessage';
import { FileAttachment } from '@/lib/types';
import {
  FaRobot,
  FaArrowDown,
  FaKeyboard,
  FaPaperclip,
  FaTimes,
  FaDownload,
  FaInfoCircle,
  FaComments,
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
import ModelSelector from '../components/ModelSelector';
import { defaultModel } from '@/lib/models';
import Image from 'next/image';
import FeedbackForm from '../components/FeedbackForm';
import SpeechToText from '../components/SpeechToText';
import Tesseract from 'tesseract.js';

export default function Home() {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
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
  const [selectedModel, setSelectedModel] = useState(defaultModel);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { theme, toggleTheme } = useTheme();
  const { user } = useUser();
  const { currentConversation, updateConversation, createConversation } =
    useConversations();

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_FILE_TYPES = [
    'text/plain',
    'application/json',
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/markdown',
    'text/x-python',
    'text/javascript',
    'text/typescript',
    'text/html',
    'text/css',
  ];

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: FileAttachment[] = [];
    const errors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name} is too large (max 5MB)`);
        continue;
      }

      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        errors.push(`${file.name} is not a supported file type`);
        continue;
      }

      try {
        if (file.type.startsWith('image/')) {
          toast.loading('Extracting text from image...');
          const { data } = await Tesseract.recognize(file, 'eng');
          toast.dismiss();
          if (data.text.trim()) {
            setInput((prev) =>
              prev ? prev + ' ' + data.text.trim() : data.text.trim()
            );
            toast.success('Text extracted from image!');
          } else {
            toast.error('No text found in image.');
          }
        } else {
          const content = await readFileAsBase64(file);
          const attachment: FileAttachment = {
            name: file.name,
            type: file.type,
            size: file.size,
            content,
          };
          newAttachments.push(attachment);
        }
      } catch (error) {
        errors.push(`Failed to read ${file.name}`);
      }
    }

    if (errors.length > 0) {
      toast.error(errors.join('\n'), { duration: 5000 });
    }

    if (newAttachments.length > 0) {
      setAttachments((prev) => [...prev, ...newAttachments]);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const readFileAsBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!input.trim() && attachments.length === 0) || !currentConversation)
      return;

    setIsLoading(true);
    const updatedMessages = [
      ...currentConversation.messages,
      {
        role: 'user',
        content: input,
        timestamp: new Date().toISOString(),
        attachments: attachments.length > 0 ? attachments : undefined,
      },
    ];
    updateConversation(currentConversation.id, updatedMessages);
    setInput('');
    setAttachments([]);

    try {
      const response = await axios.post('/api/chat', {
        conversation: updatedMessages,
        model: selectedModel.id,
      });
      updateConversation(currentConversation.id, [
        ...updatedMessages,
        {
          role: 'assistant',
          content: response.data.response,
          timestamp: new Date().toISOString(),
        },
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

      <main className='flex-1 flex flex-col h-screen'>
        <div className='flex items-center p-4 border-b border-gray-200 dark:border-gray-700'>
          <div className='flex items-center gap-4'>
            <ModelSelector
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />
          </div>
          <div className='flex-1' />
          <div className='flex items-center gap-2'>
            <button
              onClick={() => setShowFeedback(true)}
              className='p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white focus:outline-none transition-colors duration-200'
              title='Send Feedback'
            >
              <FaComments size={20} />
            </button>
            <button
              onClick={() => {
                setAlertConfig({
                  title: 'Clear Chat',
                  message: 'Are you sure you want to clear this conversation?',
                  type: 'warning',
                  onConfirm: () => {
                    if (currentConversation) {
                      updateConversation(currentConversation.id, []);
                    }
                  },
                });
                setShowAlert(true);
              }}
              className='text-sm text-gray-400 hover:text-white'
            >
              Clear Chat
            </button>
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
                  <MarkdownMessage
                    content={message.content}
                    attachments={message.attachments}
                  />
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
            {attachments.length > 0 && (
              <div className='mb-2 flex flex-wrap gap-2'>
                {attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className='flex items-center gap-2 bg-gray-100 dark:bg-gray-700/50 rounded-lg px-3 py-1.5 text-sm'
                  >
                    {attachment.type.startsWith('image/') ? (
                      <Image
                        src={attachment.url || ''}
                        alt={attachment.name}
                        width={24}
                        height={24}
                        className='object-cover rounded'
                      />
                    ) : (
                      <FaPaperclip className='h-4 w-4 text-gray-500' />
                    )}
                    <span className='text-gray-700 dark:text-gray-300 truncate max-w-[150px]'>
                      {attachment.name}
                    </span>
                    <button
                      type='button'
                      onClick={() => removeAttachment(index)}
                      className='text-gray-500 hover:text-red-500 dark:hover:text-red-400'
                    >
                      <FaTimes className='h-3 w-3' />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className='flex items-center bg-gray-100 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600 focus-within:border-gray-300 dark:focus-within:border-gray-500 transition-colors duration-200'>
              <input
                type='file'
                ref={fileInputRef}
                onChange={handleFileSelect}
                multiple
                accept={ALLOWED_FILE_TYPES.join(',')}
                className='hidden'
              />
              <button
                type='button'
                onClick={() => fileInputRef.current?.click()}
                className='p-4 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white focus:outline-none transition-colors duration-200'
                title='Attach files'
              >
                <FaPaperclip size={20} />
              </button>
              <SpeechToText
                onTranscript={(text) =>
                  setInput((prev) => (prev ? prev + ' ' + text : text))
                }
                disabled={isLoading}
              />
              <TextareaAutosize
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className='flex-grow p-4 bg-transparent focus:outline-none resize-none text-gray-900 dark:text-gray-200 rounded-md min-h-[52px] max-h-40'
                placeholder='Ask anything...'
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
                disabled={
                  isLoading || (!input.trim() && attachments.length === 0)
                }
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

        {/* Feedback form modal */}
        {showFeedback && (
          <FeedbackForm onClose={() => setShowFeedback(false)} />
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
